<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\RabItem;
use App\Models\User;
use App\Notifications\RabStatusChangedNotification;
use App\Notifications\RabSubmittedNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class RabController extends Controller
{
    private function isAdmin(User $user): bool
    {
        return $user->role === 'admin';
    }

    private function canReview(User $user): bool
    {
        return $this->isAdmin($user) || $user->isBendahara();
    }

    private function canManage(User $user, RabItem $item): bool
    {
        return $this->isAdmin($user)
            || ($user->division_id && $user->division_id === $item->division_id);
    }

    private function relations(): array
    {
        return ['division:id,nama,warna', 'user:id,nama,nim,division_id', 'reviewer:id,nama'];
    }

    public function index(Request $request)
    {
        $user = $request->user();
        $query = RabItem::with($this->relations())->latest();

        if (!$this->canReview($user)) {
            $query->where('division_id', $user->division_id ?: 0);
        } elseif ($request->filled('division_id')) {
            $query->where('division_id', $request->integer('division_id'));
        }

        $items = $query->get()->values();
        $pending = $items->where('status', 'pending');
        $approved = $items->where('status', 'approved');
        $rejected = $items->where('status', 'rejected');

        return response()->json([
            'data' => $items,
            'summary' => [
                'pending_count' => $pending->count(),
                'approved_count' => $approved->count(),
                'rejected_count' => $rejected->count(),
                'pending_total' => $pending->sum('total'),
                'approved_total' => $approved->sum('total'),
                'rejected_total' => $rejected->sum('total'),
                'total_count' => $items->count(),
                'total_amount' => $items->sum('total'),
            ],
        ]);
    }

    public function show(Request $request, RabItem $rabItem)
    {
        abort_unless($this->canReview($request->user()) || $this->canManage($request->user(), $rabItem), 403);
        return response()->json(['data' => $rabItem->load($this->relations())]);
    }

    public function store(Request $request)
    {
        $user = $request->user();
        if (!$this->isAdmin($user) && !$user->division_id) {
            return response()->json(['message' => 'Pengguna harus memiliki divisi'], 422);
        }
        if (!$this->isAdmin($user) && $user->role !== 'peserta') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $data = $request->validate($this->rules());
        $data['division_id'] = $this->isAdmin($user) ? $request->validate(['division_id' => 'required|exists:divisions,id'])['division_id'] : $user->division_id;
        $data['user_id'] = $user->id;
        $data['status'] = 'pending';
        if ($request->hasFile('lampiran')) {
            $data['lampiran_path'] = $request->file('lampiran')->store('rab-attachments', 'public');
        }

        $item = RabItem::create($data)->load($this->relations());
        $this->notifyBendahara($item);
        return response()->json(['data' => $item, 'message' => 'Pengajuan RAB berhasil dibuat'], 201);
    }

    public function update(Request $request, RabItem $rabItem)
    {
        $user = $request->user();
        if (!$this->canManage($user, $rabItem)) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        if (!$this->isAdmin($user) && !in_array($rabItem->status, ['pending', 'rejected'], true)) {
            return response()->json(['message' => 'Pengajuan tidak dapat diubah'], 422);
        }

        $data = $request->validate($this->rules(true));
        unset($data['division_id'], $data['user_id'], $data['status']);
        if ($request->hasFile('lampiran')) {
            if ($rabItem->lampiran_path) Storage::disk('public')->delete($rabItem->lampiran_path);
            $data['lampiran_path'] = $request->file('lampiran')->store('rab-attachments', 'public');
        }
        if (!$this->isAdmin($user) && $rabItem->status === 'rejected') {
            $data += ['status' => 'pending', 'rejection_note' => null, 'reviewed_by' => null, 'reviewed_at' => null];
        }

        $rabItem->update($data);
        if (($data['status'] ?? null) === 'pending') $this->notifyBendahara($rabItem->refresh());
        return response()->json(['data' => $rabItem->refresh()->load($this->relations()), 'message' => 'Pengajuan RAB berhasil diperbarui']);
    }

    public function destroy(Request $request, RabItem $rabItem)
    {
        $user = $request->user();
        if (!$this->canManage($user, $rabItem)) return response()->json(['message' => 'Unauthorized'], 403);
        if (!$this->isAdmin($user) && !in_array($rabItem->status, ['pending', 'rejected'], true)) {
            return response()->json(['message' => 'Pengajuan tidak dapat dihapus'], 422);
        }
        if ($rabItem->lampiran_path) Storage::disk('public')->delete($rabItem->lampiran_path);
        $rabItem->delete();
        return response()->json(['message' => 'Pengajuan RAB berhasil dihapus']);
    }

    public function status(Request $request, RabItem $rabItem)
    {
        if (!$this->canReview($request->user())) return response()->json(['message' => 'Unauthorized'], 403);
        $data = $request->validate([
            'status' => ['required', Rule::in(['approved', 'rejected'])],
            'rejection_note' => ['required_if:status,rejected', 'nullable', 'string'],
        ]);
        $rabItem->update([
            'status' => $data['status'],
            'rejection_note' => $data['status'] === 'rejected' ? $data['rejection_note'] : null,
            'reviewed_by' => $request->user()->id,
            'reviewed_at' => now(),
        ]);
        $rabItem->refresh();
        $rabItem->division->users()->get()->each->notify(new RabStatusChangedNotification($rabItem));
        return response()->json(['data' => $rabItem->load($this->relations()), 'message' => 'Status pengajuan RAB berhasil diperbarui']);
    }

    private function notifyBendahara(RabItem $item): void
    {
        User::query()->get()->filter->isBendahara()->each->notify(new RabSubmittedNotification($item));
    }

    private function rules(bool $updating = false): array
    {
        $required = $updating ? 'sometimes' : 'required';
        return [
            'nama_item' => [$required, 'string', 'max:200'],
            'deskripsi_kegiatan' => [$required, 'string'],
            'satuan' => [$required, 'string', 'max:50'],
            'volume' => [$required, 'numeric', 'gt:0'],
            'harga_satuan' => [$required, 'numeric', 'min:0'],
            'keterangan' => ['nullable', 'string'],
            'lampiran' => ['nullable', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:5120'],
        ];
    }
}
