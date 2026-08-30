<?php

namespace Tests\Feature;

use App\Models\Division;
use App\Models\RabItem;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class RabWorkflowTest extends TestCase
{
    use RefreshDatabase;

    private Division $divisionA;
    private Division $divisionB;
    private Division $bendaharaDivision;
    private User $memberA;
    private User $memberA2;
    private User $memberB;
    private User $bendahara;
    private User $admin;

    protected function setUp(): void
    {
        parent::setUp();
        $this->divisionA = Division::create(['nama' => 'Acara', 'warna' => '#111111']);
        $this->divisionB = Division::create(['nama' => 'Publikasi', 'warna' => '#222222']);
        $this->bendaharaDivision = Division::create(['nama' => 'Bendahara', 'warna' => '#333333']);
        $this->memberA = $this->user('Anggota A', '001', 'peserta', $this->divisionA->id);
        $this->memberA2 = $this->user('Anggota A2', '002', 'peserta', $this->divisionA->id);
        $this->memberB = $this->user('Anggota B', '003', 'peserta', $this->divisionB->id);
        $this->bendahara = $this->user('Bendahara', '004', 'peserta', $this->bendaharaDivision->id);
        $this->admin = $this->user('Admin', '005', 'admin', null);
    }

    public function test_member_submits_for_own_division_and_bendahara_is_notified(): void
    {
        Storage::fake('public');
        $response = $this->actingAs($this->memberA)->post('/api/rab', [
            ...$this->payload(), 'division_id' => $this->divisionB->id,
            'lampiran' => UploadedFile::fake()->create('nota.jpg', 100, 'image/jpeg'),
        ]);
        $response->assertCreated()->assertJsonPath('data.division_id', $this->divisionA->id)
            ->assertJsonPath('data.status', 'pending')->assertJsonPath('data.user.id', $this->memberA->id);
        $item = RabItem::firstOrFail();
        $this->assertStringStartsWith('rab-attachments/', $item->lampiran_path);
        Storage::disk('public')->assertExists($item->lampiran_path);
        $this->assertNotNull($response->json('data.attachment_url'));
        $response->assertJsonMissingPath('data.lampiran_url');
        $this->assertCount(1, $this->bendahara->notifications);
        $this->assertCount(1, $this->admin->notifications);
    }

    public function test_without_division_is_rejected_and_admin_can_choose_division(): void
    {
        $withoutDivision = $this->user('Tanpa Divisi', '006', 'peserta', null);
        $this->actingAs($withoutDivision)->postJson('/api/rab', $this->payload())->assertUnprocessable();
        $this->actingAs($this->admin)->postJson('/api/rab', [...$this->payload(), 'division_id' => $this->divisionB->id])
            ->assertCreated()->assertJsonPath('data.division_id', $this->divisionB->id);
    }

    public function test_index_is_scoped_with_relations_and_flat_summary(): void
    {
        $own = $this->rab($this->memberA, ['volume' => 2, 'harga_satuan' => 100]);
        $other = $this->rab($this->memberB, ['volume' => 3, 'harga_satuan' => 100, 'status' => 'approved']);
        $response = $this->actingAs($this->memberA)->getJson('/api/rab?division_id='.$this->divisionB->id)->assertOk()
            ->assertJsonCount(1, 'data')->assertJsonPath('data.0.id', $own->id)
            ->assertJsonPath('data.0.division.id', $this->divisionA->id)
            ->assertJsonPath('summary.pending_count', 1)->assertJsonPath('summary.approved_count', 0)
            ->assertJsonPath('summary.rejected_count', 0)->assertJsonPath('summary.pending_total', 200)
            ->assertJsonPath('summary.approved_total', 0)->assertJsonPath('summary.rejected_total', 0)
            ->assertJsonPath('summary.total_count', 1)->assertJsonPath('summary.total_amount', 200)
            ->assertJsonMissingPath('data.items')->assertJsonMissingPath('data.0.lampiran_url');
        $this->assertSame(['data', 'summary'], array_keys($response->json()));
        $this->assertSame([
            'pending_count', 'approved_count', 'rejected_count',
            'pending_total', 'approved_total', 'rejected_total',
            'total_count', 'total_amount',
        ], array_keys($response->json('summary')));
        $this->actingAs($this->memberA)->getJson('/api/rab/'.$other->id)->assertForbidden();
        $this->actingAs($this->bendahara)->getJson('/api/rab')->assertJsonCount(2, 'data')
            ->assertJsonPath('summary.pending_count', 1)->assertJsonPath('summary.approved_count', 1)
            ->assertJsonPath('summary.total_count', 2)->assertJsonPath('summary.total_amount', 500);
        $this->actingAs($this->admin)->getJson('/api/rab')->assertJsonCount(2, 'data');
    }

    public function test_division_members_manage_pending_or_rejected_but_not_cross_division(): void
    {
        $item = $this->rab($this->memberA);
        $this->actingAs($this->memberB)->putJson('/api/rab/'.$item->id, ['nama_item' => 'Tidak boleh'])->assertForbidden();
        $this->actingAs($this->memberA2)->putJson('/api/rab/'.$item->id, ['nama_item' => 'Dikelola divisi'])->assertOk();
        $item->update(['status' => 'approved']);
        $this->actingAs($this->memberA2)->deleteJson('/api/rab/'.$item->id)->assertUnprocessable();
        $this->actingAs($this->admin)->deleteJson('/api/rab/'.$item->id)->assertOk();
    }

    public function test_rejected_update_resubmits_clears_review_and_notifies_bendahara(): void
    {
        $item = $this->rab($this->memberA, [
            'status' => 'rejected', 'rejection_note' => 'Perbaiki',
            'reviewed_by' => $this->bendahara->id, 'reviewed_at' => now(),
        ]);
        $before = $this->bendahara->notifications()->count();
        $this->actingAs($this->memberA2)->putJson('/api/rab/'.$item->id, ['harga_satuan' => 20000])->assertOk()
            ->assertJsonPath('data.status', 'pending')->assertJsonPath('data.rejection_note', null)
            ->assertJsonPath('data.reviewed_by', null)->assertJsonPath('data.reviewed_at', null);
        $this->assertSame($before + 1, $this->bendahara->notifications()->count());
    }

    public function test_bendahara_and_admin_review_and_notify_all_division_members(): void
    {
        $item = $this->rab($this->memberA);
        $this->actingAs($this->memberB)->patchJson('/api/rab/'.$item->id.'/status', ['status' => 'approved'])->assertForbidden();
        $this->actingAs($this->bendahara)->patchJson('/api/rab/'.$item->id.'/status', ['status' => 'invalid'])->assertUnprocessable();
        $this->actingAs($this->bendahara)->patchJson('/api/rab/'.$item->id.'/status', ['status' => 'rejected'])->assertJsonValidationErrors('rejection_note');
        $this->actingAs($this->bendahara)->patchJson('/api/rab/'.$item->id.'/status', [
            'status' => 'rejected', 'rejection_note' => 'Nominal perlu diperbaiki',
        ])->assertOk()->assertJsonPath('data.status', 'rejected')->assertJsonPath('data.reviewed_by', $this->bendahara->id);
        $this->assertCount(1, $this->memberA->notifications);
        $this->assertCount(1, $this->memberA2->notifications);
        $this->actingAs($this->admin)->patchJson('/api/rab/'.$item->id.'/status', ['status' => 'approved'])
            ->assertOk()->assertJsonPath('data.rejection_note', null);
    }

    public function test_multipart_method_spoof_replaces_attachment_and_validation_applies(): void
    {
        Storage::fake('public');
        $old = UploadedFile::fake()->create('old.jpg', 100, 'image/jpeg')->store('rab-attachments', 'public');
        $item = $this->rab($this->memberA, ['lampiran_path' => $old]);
        $this->actingAs($this->memberA)->post('/api/rab/'.$item->id, [
            '_method' => 'PUT', 'nama_item' => 'Baru',
            'lampiran' => UploadedFile::fake()->create('baru.pdf', 100, 'application/pdf'),
        ])->assertOk();
        Storage::disk('public')->assertMissing($old);
        Storage::disk('public')->assertExists($item->fresh()->lampiran_path);
        $this->actingAs($this->memberA)->post('/api/rab', [...$this->payload(), 'volume' => 0])->assertSessionHasErrors('volume');
        $this->actingAs($this->memberA)->post('/api/rab', [...$this->payload(), 'lampiran' => UploadedFile::fake()->create('virus.exe', 10)])
            ->assertSessionHasErrors('lampiran');
    }

    public function test_notifications_are_limited_owned_and_markable_as_read(): void
    {
        $item = $this->rab($this->memberA);
        $this->actingAs($this->bendahara)->patchJson('/api/rab/'.$item->id.'/status', ['status' => 'approved'])->assertOk();
        $mine = $this->memberA->notifications()->firstOrFail();
        $other = $this->memberA2->notifications()->firstOrFail();
        $this->actingAs($this->memberA)->getJson('/api/notifications')->assertOk()->assertJsonCount(1, 'data')->assertJsonPath('unread_count', 1);
        $this->actingAs($this->memberA)->patchJson('/api/notifications/'.$other->id.'/read')->assertForbidden();
        $this->actingAs($this->memberA)->patchJson('/api/notifications/'.$mine->id.'/read')->assertOk();
        $this->assertNotNull($mine->fresh()->read_at);
        $this->actingAs($this->memberA)->patchJson('/api/notifications/read-all')->assertOk();
    }

    private function user(string $name, string $nim, string $role, ?int $divisionId): User
    {
        return User::create(['nama' => $name, 'nim' => $nim, 'jurusan' => 'Teknik', 'password' => 'password', 'role' => $role, 'division_id' => $divisionId]);
    }

    private function payload(): array
    {
        return ['nama_item' => 'Konsumsi', 'deskripsi_kegiatan' => 'Pelaksanaan kegiatan divisi', 'satuan' => 'paket', 'volume' => 2, 'harga_satuan' => 25000, 'keterangan' => 'Makan siang'];
    }

    private function rab(User $user, array $overrides = []): RabItem
    {
        return RabItem::create(array_merge($this->payload(), ['division_id' => $user->division_id, 'user_id' => $user->id, 'status' => 'pending'], $overrides));
    }
}
