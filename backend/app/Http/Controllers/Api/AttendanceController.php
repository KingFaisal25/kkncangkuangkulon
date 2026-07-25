<?php

namespace App\Http\Controllers\Api;

use App\Helpers\FaceHelper;
use App\Http\Controllers\Controller;
use App\Models\Attendance;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

class AttendanceController extends Controller
{
    /**
     * Submit attendance with face verification.
     */
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'activity_id' => 'required|exists:activities,id',
                'foto_absen' => 'required|string',
                'face_embedding' => 'required|array|size:128',
                'face_embedding.*' => 'required|numeric',
            ], [
                'foto_absen.required' => 'Foto absen harus diisi.',
                'face_embedding.required' => 'Face embedding harus diisi.',
                'face_embedding.size' => 'Face embedding harus berisi 128 nilai.',
            ]);

            $user = $request->user();
            $today = Carbon::now('Asia/Jakarta')->toDateString();

            // Check if already attended today
            $existingAttendance = Attendance::where('user_id', $user->id)
                ->whereDate('tanggal', $today)
                ->first();

            if ($existingAttendance) {
                return response()->json([
                    'success' => false,
                    'message' => 'Anda sudah melakukan absensi hari ini.',
                    'data' => [
                        'attendance' => $existingAttendance,
                    ],
                ], 409);
            }

            // Get stored face embedding
            $storedEmbedding = $user->face_embedding;

            if (empty($storedEmbedding)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Data wajah belum terdaftar. Silakan registrasi ulang.',
                    'data' => null,
                ], 400);
            }

            // Calculate cosine similarity
            $similarity = FaceHelper::cosineSimilarity($storedEmbedding, $validated['face_embedding']);

            // Check threshold
            if ($similarity < 0.6) {
                return response()->json([
                    'success' => false,
                    'message' => 'Wajah tidak cocok. Similarity: ' . round($similarity, 4),
                    'data' => [
                        'similarity' => round($similarity, 4),
                    ],
                ], 403);
            }

            // Determine status based on time
            $currentTime = Carbon::now('Asia/Jakarta');
            $status = $currentTime->format('H:i') <= '08:00' ? 'Hadir' : 'Terlambat';

            // Save photo base64 directly to database
            $fotoPath = null;
            if ($request->foto_absen) {
                $fotoPath = $request->foto_absen;
                
                // Ensure it's a valid data URI
                if (!str_starts_with($fotoPath, 'data:image')) {
                    $fotoPath = 'data:image/jpeg;base64,' . $fotoPath;
                }
            }

            // Create attendance record
            $attendance = Attendance::create([
                'user_id' => $user->id,
                'activity_id' => $validated['activity_id'],
                'tanggal' => $today,
                'waktu_absen' => $currentTime->format('H:i:s'),
                'status' => $status,
                'foto_absen' => $fotoPath,
                'similarity' => round($similarity, 4),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Absensi berhasil dicatat. Status: ' . $status,
                'data' => [
                    'attendance' => $attendance,
                    'similarity' => round($similarity, 4),
                ],
            ], 201);

        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal.',
                'data' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan: ' . $e->getMessage(),
                'data' => null,
            ], 500);
        }
    }

    /**
     * Get today's attendance for current user.
     */
    public function today(Request $request)
    {
        try {
            $user = $request->user();
            $today = Carbon::now('Asia/Jakarta')->toDateString();

            $attendance = Attendance::where('user_id', $user->id)
                ->whereDate('tanggal', $today)
                ->first();

            return response()->json([
                'success' => true,
                'message' => $attendance
                    ? 'Data absensi hari ini ditemukan.'
                    : 'Belum melakukan absensi hari ini.',
                'data' => [
                    'attendance' => $attendance,
                    'sudah_absen' => $attendance !== null,
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan: ' . $e->getMessage(),
                'data' => null,
            ], 500);
        }
    }

    /**
     * Get attendance history for current user (paginated).
     */
    public function history(Request $request)
    {
        try {
            $user = $request->user();

            $attendance = Attendance::where('user_id', $user->id)
                ->orderBy('tanggal', 'desc')
                ->orderBy('waktu_absen', 'desc')
                ->paginate(15);

            return response()->json([
                'success' => true,
                'message' => 'Riwayat absensi berhasil diambil.',
                'data' => $attendance,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan: ' . $e->getMessage(),
                'data' => null,
            ], 500);
        }
    }
}
