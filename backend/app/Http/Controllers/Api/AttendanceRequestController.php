<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AttendanceRequest;
use Illuminate\Http\Request;

class AttendanceRequestController extends Controller
{
    public function index(Request $request)
    {
        $query = AttendanceRequest::with(['activity:id,nama', 'user:id,nama,nim'])->latest();
        if ($request->user()->role !== 'admin') {
            $query->where('user_id', $request->user()->id);
        }
        return response()->json(['success' => true, 'data' => ['requests' => $query->get()]]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'activity_id' => 'nullable|exists:activities,id',
            'tanggal' => 'required|date',
            'jenis' => 'required|in:izin,sakit,dinas,koreksi',
            'alasan' => 'required|string|max:1000',
            'bukti_file' => 'nullable|file|image|max:5120',
        ]);

        $data['user_id'] = $request->user()->id;

        if ($request->hasFile('bukti_file')) {
            $path = $request->file('bukti_file')->store('requests', 'public');
            $data['bukti'] = $path;
        }
        unset($data['bukti_file']);

        $requestRecord = AttendanceRequest::create($data);

        return response()->json([
            'success' => true,
            'message' => 'Pengajuan berhasil dikirim.',
            'data' => ['request' => $requestRecord],
        ], 201);
    }

    public function update(Request $request, AttendanceRequest $attendanceRequest)
    {
        $data = $request->validate([
            'status' => 'required|in:disetujui,ditolak',
            'catatan_admin' => 'nullable|string|max:1000',
        ]);

        $attendanceRequest->update($data);

        if ($data['status'] === 'disetujui') {
            $attendanceStatus = 'Hadir';
            if (in_array(strtolower($attendanceRequest->jenis), ['izin', 'sakit', 'dinas'])) {
                $attendanceStatus = ucfirst(strtolower($attendanceRequest->jenis));
            }

            \App\Models\Attendance::updateOrCreate(
                [
                    'user_id' => $attendanceRequest->user_id,
                    'tanggal' => $attendanceRequest->tanggal->toDateString(),
                ],
                [
                    'activity_id' => $attendanceRequest->activity_id,
                    'waktu_absen' => now('Asia/Jakarta')->format('H:i:s'),
                    'status' => $attendanceStatus,
                    'foto_absen' => $attendanceRequest->bukti,
                    'similarity' => 1.0,
                ]
            );
        }

        return response()->json([
            'success' => true,
            'message' => 'Pengajuan berhasil diperbarui.',
            'data' => ['request' => $attendanceRequest->fresh()],
        ]);
    }
}