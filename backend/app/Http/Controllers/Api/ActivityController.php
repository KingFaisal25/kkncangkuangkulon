<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Activity;
use Illuminate\Http\Request;

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
        return response()->json(['success' => true, 'message' => 'Kegiatan berhasil dibuat.', 'data' => ['activity' => $activity]], 201);
    }

    public function update(Request $request, Activity $activity)
    {
        $data = $request->validate([
            'nama' => 'sometimes|required|string|max:150', 'deskripsi' => 'nullable|string', 'tanggal' => 'sometimes|required|date',
            'jam_mulai' => 'sometimes|required|date_format:H:i', 'jam_selesai' => 'sometimes|required|date_format:H:i',
            'lokasi' => 'nullable|string|max:255', 'status' => 'nullable|in:rencana,persiapan,berjalan,selesai,aktif,dibatalkan',
        ]);
        $activity->update($data);
        return response()->json(['success' => true, 'message' => 'Kegiatan berhasil diperbarui.', 'data' => ['activity' => $activity->fresh()]]);
    }

    public function destroy(Activity $activity)
    {
        $activity->delete();
        return response()->json(['success' => true, 'message' => 'Kegiatan berhasil dihapus.']);
    }
}