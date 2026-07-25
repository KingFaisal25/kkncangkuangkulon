<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Division;
use App\Models\User;
use Illuminate\Http\Request;

class DivisionController extends Controller
{
    // GET /divisions — all auth users
    public function index()
    {
        $divisions = Division::with(['users:id,nama,nim,jurusan,division_id', 'reports'])->get();

        return response()->json([
            'data' => $divisions->map(function ($div) {
                return [
                    'id' => $div->id,
                    'nama' => $div->nama,
                    'deskripsi' => $div->deskripsi,
                    'warna' => $div->warna,
                    'progress' => $div->progress,
                    'anggota' => $div->users,
                    'jumlah_laporan' => $div->reports->count(),
                    'laporan_terbaru' => $div->reports->sortByDesc('created_at')->first(),
                ];
            })->values(),
        ]);
    }

    // POST /admin/divisions — admin only
    public function store(Request $request)
    {
        $data = $request->validate([
            'nama' => 'required|string|max:100',
            'deskripsi' => 'nullable|string',
            'warna' => 'nullable|string|max:20',
        ]);

        $division = Division::create($data);

        return response()->json(['data' => $division, 'message' => 'Divisi berhasil dibuat'], 201);
    }

    // PUT /admin/divisions/{id} — admin only
    public function update(Request $request, Division $division)
    {
        $data = $request->validate([
            'nama' => 'sometimes|string|max:100',
            'deskripsi' => 'nullable|string',
            'warna' => 'nullable|string|max:20',
        ]);

        $division->update($data);

        return response()->json(['data' => $division, 'message' => 'Divisi berhasil diperbarui']);
    }

    // DELETE /admin/divisions/{id} — admin only
    public function destroy(Division $division)
    {
        $division->delete();

        return response()->json(['message' => 'Divisi berhasil dihapus']);
    }

    // POST /admin/divisions/{id}/assign — assign user to division
    public function assignUser(Request $request, Division $division)
    {
        $data = $request->validate([
            'user_id' => 'required|exists:users,id',
        ]);

        User::where('id', $data['user_id'])->update(['division_id' => $division->id]);

        return response()->json(['message' => 'User berhasil ditugaskan ke divisi ' . $division->nama]);
    }

    // POST /admin/divisions/unassign — remove user from division
    public function unassignUser(Request $request)
    {
        $data = $request->validate([
            'user_id' => 'required|exists:users,id',
        ]);

        User::where('id', $data['user_id'])->update(['division_id' => null]);

        return response()->json(['message' => 'User berhasil dilepas dari divisi']);
    }
}
