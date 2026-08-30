<?php

namespace Tests\Feature;

use App\Models\Activity;
use App\Models\ActivityReport;
use App\Models\Attendance;
use App\Models\User;
use App\Notifications\ActivityNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class ActivityNotificationTest extends TestCase
{
    use RefreshDatabase;

    private function user(string $role = 'peserta'): User
    {
        static $number = 0;
        $number++;
        return User::create(['nama' => 'User '.$number, 'nim' => 'NIM'.$number, 'jurusan' => 'TI', 'password' => 'password', 'role' => $role]);
    }

    private function activity(array $attributes = []): Activity
    {
        return Activity::create(array_merge(['nama' => 'Kerja Bakti', 'tanggal' => '2026-07-27', 'jam_mulai' => '10:00', 'jam_selesai' => '12:00', 'lokasi' => 'Desa', 'status' => 'rencana'], $attributes));
    }

    public function test_admin_create_and_update_activity_notifies_all_participants_only(): void
    {
        Notification::fake();
        $admin = $this->user('admin'); $first = $this->user(); $second = $this->user();
        $response = $this->actingAs($admin)->postJson('/api/admin/activities', ['nama' => 'Rapat', 'tanggal' => '2026-07-27', 'jam_mulai' => '10:00', 'jam_selesai' => '11:00', 'status' => 'rencana']);
        $response->assertCreated();
        Notification::assertSentTo([$first, $second], ActivityNotification::class, fn ($notification) => $notification->toArray($first)['type'] === 'activity_upcoming');
        Notification::assertNotSentTo($admin, ActivityNotification::class);
        $activityId = $response->json('data.activity.id');
        $this->actingAs($admin)->putJson('/api/admin/activities/'.$activityId, ['lokasi' => 'Balai Desa', 'status' => 'dibatalkan'])->assertOk();
        Notification::assertSentTo($first, ActivityNotification::class, fn ($notification) => ($data = $notification->toArray($first))['type'] === 'activity_updated' && $data['status'] === 'dibatalkan');
    }

    public function test_admin_publish_report_is_idempotent_and_participants_can_read_published_reports(): void
    {
        Notification::fake();
        $admin = $this->user('admin'); $author = $this->user(); $other = $this->user();
        $report = ActivityReport::create(['activity_id' => $this->activity()->id, 'user_id' => $author->id, 'hasil' => 'Selesai']);
        $this->actingAs($admin)->patchJson('/api/admin/reports/'.$report->id.'/publish')->assertOk();
        $this->assertDatabaseHas('activity_reports', ['id' => $report->id, 'status' => 'published', 'published_by' => $admin->id]);
        $this->assertNotNull($report->fresh()->published_at);
        Notification::assertSentTo([$author, $other], ActivityNotification::class, fn ($notification) => $notification->toArray($author)['type'] === 'activity_report_published');
        $this->actingAs($admin)->patchJson('/api/admin/reports/'.$report->id.'/publish')->assertOk();
        Notification::assertSentToTimes($author, ActivityNotification::class, 1);
        $this->actingAs($other)->getJson('/api/reports')->assertOk()->assertJsonPath('data.reports.0.id', $report->id);
    }

    public function test_non_admin_cannot_publish_report(): void
    {
        $participant = $this->user();
        $report = ActivityReport::create(['activity_id' => $this->activity()->id, 'user_id' => $participant->id]);
        $this->actingAs($participant)->patchJson('/api/admin/reports/'.$report->id.'/publish')->assertForbidden();
        $this->assertSame('draft', $report->fresh()->status);
    }

    public function test_reminder_command_sends_only_to_absent_eligible_participants_and_deduplicates(): void
    {
        $absent = $this->user(); $present = $this->user(); $admin = $this->user('admin');
        $activity = $this->activity(['tanggal' => '2026-07-26', 'jam_mulai' => '10:00', 'jam_selesai' => '12:00']);
        Attendance::create(['user_id' => $present->id, 'activity_id' => $activity->id, 'tanggal' => '2026-07-26', 'waktu_absen' => '09:30:00', 'status' => 'Hadir']);
        $this->artisan('notifications:attendance-reminders', ['--now' => '2026-07-26T09:30:00+07:00'])->expectsOutput('Terkirim: 1')->assertSuccessful();
        $this->assertCount(1, $absent->fresh()->notifications);
        $this->assertCount(0, $present->fresh()->notifications);
        $this->assertCount(0, $admin->fresh()->notifications);
        $this->artisan('notifications:attendance-reminders', ['--now' => '2026-07-26T10:30:00+07:00'])->expectsOutput('Terkirim: 0')->assertSuccessful();
        $this->assertCount(1, $absent->fresh()->notifications);
    }

    public function test_existing_notification_read_endpoint_remains_available(): void
    {
        $participant = $this->user();
        $participant->notify(new ActivityNotification(['type' => 'activity_updated', 'label' => 'Update', 'title' => 'Update', 'message' => 'Updated', 'status' => 'rencana', 'occurred_at' => now()->toIso8601String(), 'activity_id' => 1, 'report_id' => null]));
        $notification = $participant->notifications()->first();
        $this->actingAs($participant)->patchJson('/api/notifications/'.$notification->id.'/read')->assertOk();
        $this->assertNotNull($notification->fresh()->read_at);
    }
}
