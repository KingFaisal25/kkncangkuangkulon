<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Response;

class AdminController extends Controller
{
    /**
     * List all peserta users with attendance count.
     */
    public function users()
    {
        try {
            $users = User::where('role', 'peserta')
                ->withCount('attendance')
                ->orderBy('nama', 'asc')
                ->get();

            return response()->json([
                'success' => true,
                'message' => 'Daftar peserta berhasil diambil.',
                'data' => [
                    'users' => $users,
                    'total' => $users->count(),
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
     * Get attendance records with filters (paginated).
     */
    public function attendance(Request $request)
    {
        try {
            $query = Attendance::with(['user:id,nama,nim,jurusan', 'activity:id,nama']);

            if ($request->filled('activity_id')) {
                $query->where('activity_id', $request->activity_id);
            }

            // Filter by date range
            if ($request->filled('tanggal_dari')) {
                $query->whereDate('tanggal', '>=', $request->tanggal_dari);
            }
            if ($request->filled('tanggal_sampai')) {
                $query->whereDate('tanggal', '<=', $request->tanggal_sampai);
            }

            // Filter by specific date
            if ($request->filled('tanggal')) {
                $query->whereDate('tanggal', $request->tanggal);
            }

            // Filter by user
            if ($request->filled('user_id')) {
                $query->where('user_id', $request->user_id);
            }

            // Filter by status
            if ($request->filled('status')) {
                $query->where('status', $request->status);
            }

            // Search by nama or NIM
            if ($request->filled('search')) {
                $search = $request->search;
                $query->whereHas('user', function ($q) use ($search) {
                    $q->where('nama', 'like', "%{$search}%")
                      ->orWhere('nim', 'like', "%{$search}%");
                });
            }

            $attendance = $query->orderBy('tanggal', 'desc')
                ->orderBy('waktu_absen', 'desc')
                ->paginate($request->get('per_page', 15));

            return response()->json([
                'success' => true,
                'message' => 'Data absensi berhasil diambil.',
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

    /**
     * Get attendance summary/statistics for a given date.
     */
    public function summary(Request $request)
    {
        try {
            $tanggal = $request->get('tanggal', Carbon::now('Asia/Jakarta')->toDateString());

            $totalPeserta = max(37, User::where('role', 'peserta')->count()); // Target 37 mahasiswa KKN

            $hadir = Attendance::whereDate('tanggal', $tanggal)
                ->where('status', 'Hadir')
                ->count();

            $terlambat = Attendance::whereDate('tanggal', $tanggal)
                ->where('status', 'Terlambat')
                ->count();

            $today = Carbon::now('Asia/Jakarta')->toDateString();
            $currentTime = Carbon::now('Asia/Jakarta')->format('H:i');

            if ($tanggal < $today) {
                $tidakHadir = max(0, $totalPeserta - ($hadir + $terlambat));
            } elseif ($tanggal === $today) {
                if ($currentTime >= '23:59') {
                    $tidakHadir = max(0, $totalPeserta - ($hadir + $terlambat));
                } else {
                    $tidakHadir = 0;
                }
            } else {
                $tidakHadir = 0;
            }

            return response()->json([
                'success' => true,
                'message' => 'Ringkasan absensi berhasil diambil.',
                'data' => [
                    'tanggal' => $tanggal,
                    'total_peserta' => $totalPeserta,
                    'hadir' => $hadir,
                    'terlambat' => $terlambat,
                    'tidak_hadir' => $tidakHadir,
                    'total_hadir' => $hadir + $terlambat,
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
     * Export attendance to CSV.
     */
    public function export(Request $request)
    {
        try {
            $query = Attendance::with(['user:id,nama,nim,jurusan', 'activity:id,nama']);

            if ($request->filled('activity_id')) {
                $query->where('activity_id', $request->activity_id);
            }

            // Apply filters
            if ($request->filled('tanggal_dari')) {
                $query->whereDate('tanggal', '>=', $request->tanggal_dari);
            }
            if ($request->filled('tanggal_sampai')) {
                $query->whereDate('tanggal', '<=', $request->tanggal_sampai);
            }
            if ($request->filled('tanggal')) {
                $query->whereDate('tanggal', $request->tanggal);
            }
            if ($request->filled('status')) {
                $query->where('status', $request->status);
            }

            $records = $query->orderBy('tanggal', 'desc')
                ->orderBy('waktu_absen', 'asc')
                ->get();

            // Build CSV
            $csvContent = "\xEF\xBB\xBF"; // UTF-8 BOM for Excel
            $csvContent .= "No,Nama,NIM,Jurusan,Tanggal,Waktu,Status,Similarity\n";

            $no = 1;
            foreach ($records as $record) {
                $csvContent .= implode(',', [
                    $no++,
                    '"' . str_replace('"', '""', $record->user->nama ?? '') . '"',
                    '"' . ($record->user->nim ?? '') . '"',
                    '"' . str_replace('"', '""', $record->user->jurusan ?? '') . '"',
                    $record->tanggal->format('Y-m-d'),
                    $record->waktu_absen,
                    $record->status,
                    $record->similarity,
                ]) . "\n";
            }

            $filename = 'absensi_kkn_' . Carbon::now('Asia/Jakarta')->format('Y-m-d_H-i-s') . '.csv';

            return Response::make($csvContent, 200, [
                'Content-Type' => 'text/csv; charset=UTF-8',
                'Content-Disposition' => 'attachment; filename="' . $filename . '"',
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
     * Delete a peserta user and their attendance records.
     */
    public function deleteUser($id)
    {
        try {
            $user = User::findOrFail($id);

            if ($user->role === 'admin') {
                return response()->json([
                    'success' => false,
                    'message' => 'Tidak dapat menghapus akun admin.',
                    'data' => null,
                ], 403);
            }

            // Delete user (attendance cascade via FK)
            $user->delete();

            return response()->json([
                'success' => true,
                'message' => 'Peserta berhasil dihapus.',
                'data' => null,
            ]);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Peserta tidak ditemukan.',
                'data' => null,
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan: ' . $e->getMessage(),
                'data' => null,
            ], 500);
        }
    }

    /**
     * Create a new peserta user by admin.
     */
    public function storeUser(Request $request)
    {
        try {
            $validated = $request->validate([
                'nama' => 'required|string|max:255',
                'nim' => 'required|string|max:50|unique:users,nim',
                'jurusan' => 'nullable|string|max:255',
                'password' => 'required|string|min:6',
                'division_id' => 'nullable|exists:divisions,id',
                'foto_registrasi' => 'nullable|string',
            ], [
                'nama.required' => 'Nama mahasiswa harus diisi.',
                'nim.required' => 'NIM harus diisi.',
                'nim.unique' => 'NIM sudah terdaftar.',
                'password.required' => 'Password harus diisi.',
                'password.min' => 'Password minimal 6 karakter.',
            ]);

            $fotoPath = null;
            if (!empty($validated['foto_registrasi'])) {
                $fotoPath = $validated['foto_registrasi'];
                if (!str_starts_with($fotoPath, 'data:image')) {
                    $fotoPath = 'data:image/jpeg;base64,' . $fotoPath;
                }
            }

            $user = User::create([
                'nama' => $validated['nama'],
                'nim' => $validated['nim'],
                'jurusan' => $validated['jurusan'] ?? '-',
                'password' => $validated['password'],
                'division_id' => $validated['division_id'] ?? null,
                'foto_registrasi' => $fotoPath,
                'role' => 'peserta',
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Peserta mahasiswa berhasil ditambahkan.',
                'data' => $user,
            ], 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
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
}
