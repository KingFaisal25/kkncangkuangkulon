<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Activity;
use App\Models\User;
use App\Notifications\ActivityNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Notification;

class ActivityController extends Controller
{
    public function index(Request $request)
    {
        $query = Activity::query()->orderBy('tanggal')->orderBy('jam_mulai');
        if ($request->boolean('upcoming')) {
            $query->whereDate('tanggal', '>=', now('Asia/Jakarta')->toDateString());
        }
        return response()->json(['success' => true, 'data' => ['activities' => $query->get()]]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'nama' => 'required|string|max:150', 'deskripsi' => 'nullable|string',
            'tanggal' => 'required|date', 'jam_mulai' => 'required|date_format:H:i',
            'jam_selesai' => 'required|date_format:H:i|after:jam_mulai', 'lokasi' => 'nullable|string|max:255',
            'status' => 'nullable|in:rencana,persiapan,berjalan,selesai,aktif,dibatalkan',
        ]);
        $activity = Activity::create($data);

        if ($activity->status !== 'dibatalkan') {
            $this->notifyParticipants($activity, 'activity_upcoming');
        }

        return response()->json(['success' => true, 'message' => 'Kegiatan berhasil dibuat.', 'data' => ['activity' => $activity]], 201);
    }

    public function update(Request $request, Activity $activity)
    {
        $data = $request->validate([
            'nama' => 'sometimes|required|string|max:150', 'deskripsi' => 'nullable|string', 'tanggal' => 'sometimes|required|date',
            'jam_mulai' => 'sometimes|required|date_format:H:i', 'jam_selesai' => 'sometimes|required|date_format:H:i',
            'lokasi' => 'nullable|string|max:255', 'status' => 'nullable|in:rencana,persiapan,berjalan,selesai,aktif,dibatalkan',
        ]);
        $activity->fill($data);
        $changed = $activity->isDirty(['nama', 'tanggal', 'jam_mulai', 'jam_selesai', 'lokasi', 'status']);
        $activity->save();

        if ($changed) {
            $this->notifyParticipants($activity, 'activity_updated');
        }

        return response()->json(['success' => true, 'message' => 'Kegiatan berhasil diperbarui.', 'data' => ['activity' => $activity->fresh()]]);
    }

    public function destroy(Activity $activity)
    {
        $activity->delete();
        return response()->json(['success' => true, 'message' => 'Kegiatan berhasil dihapus.']);
    }

    private function notifyParticipants(Activity $activity, string $type): void
    {
        $cancelled = $activity->status === 'dibatalkan';
        $label = $cancelled ? 'Kegiatan Dibatalkan' : ($type === 'activity_upcoming' ? 'Kegiatan Mendatang' : 'Kegiatan Diperbarui');
        $message = $cancelled
            ? "Kegiatan {$activity->nama} telah dibatalkan."
            : "{$activity->nama} akan dilaksanakan pada {$activity->tanggal->format('d-m-Y')} pukul {$activity->jam_mulai}.";

        Notification::send(User::where('role', 'peserta')->get(), new ActivityNotification([
            'type' => $type,
            'label' => $label,
            'title' => $label,
            'message' => $message,
            'status' => $cancelled ? 'dibatalkan' : $activity->status,
            'occurred_at' => now('Asia/Jakarta')->toIso8601String(),
            'activity_id' => $activity->id,
            'report_id' => null,
            'url' => '/activities/'.$activity->id,
        ]));
    }
}
