<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DivisionReport;
use App\Models\Division;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class DivisionReportController extends Controller
{
    // GET /division-reports — all auth users (optionally filter by division)
    public function index(Request $request)
    {
        $query = DivisionReport::with(['division:id,nama,warna', 'user:id,nama,nim'])
            ->orderBy('created_at', 'desc');

        if ($request->has('division_id')) {
            $query->where('division_id', $request->division_id);
        }

        $reports = $query->get();

        return response()->json(['data' => $reports]);
    }

    // POST /division-reports — any auth user
    public function store(Request $request)
    {
        $data = $request->validate([
            'division_id' => 'required|exists:divisions,id',
            'judul' => 'required|string|max:200',
            'deskripsi' => 'nullable|string',
            'progress' => 'required|integer|min:0|max:100',
            'status' => 'required|in:rencana,berjalan,selesai',
            'foto_bukti' => 'nullable|string', // base64
            'tanggal_laporan' => 'nullable|date',
        ]);

        $data['user_id'] = Auth::id();

        $report = DivisionReport::create($data);
        $report->load(['division:id,nama,warna', 'user:id,nama,nim']);

        return response()->json(['data' => $report, 'message' => 'Laporan berhasil disimpan'], 201);
    }

    // PUT /division-reports/{id}
    public function update(Request $request, DivisionReport $divisionReport)
    {
        $user = Auth::user();

        // Only owner or admin can edit
        if ($divisionReport->user_id !== $user->id && $user->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $data = $request->validate([
            'judul' => 'sometimes|string|max:200',
            'deskripsi' => 'nullable|string',
            'progress' => 'sometimes|integer|min:0|max:100',
            'status' => 'sometimes|in:rencana,berjalan,selesai',
            'foto_bukti' => 'nullable|string',
        ]);

        $divisionReport->update($data);
        $divisionReport->load(['division:id,nama,warna', 'user:id,nama,nim']);

        return response()->json(['data' => $divisionReport, 'message' => 'Laporan berhasil diperbarui']);
    }

    // DELETE /division-reports/{id}
    public function destroy(DivisionReport $divisionReport)
    {
        $user = Auth::user();

        if ($divisionReport->user_id !== $user->id && $user->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $divisionReport->delete();

        return response()->json(['message' => 'Laporan berhasil dihapus']);
    }

    // GET /division-reports/by-division — grouped per division (for dashboard)
    public function byDivision()
    {
        $divisions = Division::with([
            'reports' => function ($q) {
                $q->orderBy('created_at', 'desc');
            },
            'users:id,nama,division_id'
        ])->get();

        return response()->json([
            'data' => $divisions->map(function ($div) {
                return [
                    'id' => $div->id,
                    'nama' => $div->nama,
                    'warna' => $div->warna,
                    'progress' => $div->progress,
                    'jumlah_anggota' => $div->users->count(),
                    'jumlah_laporan' => $div->reports->count(),
                    'laporan_terbaru' => $div->reports->first(),
                ];
            })->values(),
        ]);
    }
}
