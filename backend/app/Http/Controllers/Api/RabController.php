<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\RabItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class RabController extends Controller
{
    private function isBendahara(): bool
    {
        $user = Auth::user();
        if ($user->role === 'admin')
            return true;
        if (!$user->division_id)
            return false;

        $divName = strtolower($user->division?->nama ?? '');
        return str_contains($divName, 'bendahara');
    }

    // GET /rab — all auth users (optionally filter by division)
    public function index(Request $request)
    {
        $query = RabItem::with(['division:id,nama,warna', 'user:id,nama'])
            ->orderBy('division_id')
            ->orderBy('created_at');

        if ($request->has('division_id')) {
            $query->where('division_id', $request->division_id);
        }

        $items = $query->get();

        $totalRab = $items->sum('total');

        return response()->json([
            'data' => [
                'items' => $items->values(),
                'total_rab' => $totalRab,
            ],
        ]);
    }

    // POST /rab — admin or Bendahara
    public function store(Request $request)
    {
        if (!$this->isBendahara()) {
            return response()->json(['message' => 'Hanya Bendahara atau Admin yang bisa menambah item RAB'], 403);
        }

        $data = $request->validate([
            'division_id' => 'required|exists:divisions,id',
            'nama_item' => 'required|string|max:200',
            'satuan' => 'required|string|max:50',
            'volume' => 'required|numeric|min:0',
            'harga_satuan' => 'required|numeric|min:0',
            'keterangan' => 'nullable|string',
        ]);

        $data['user_id'] = Auth::id();

        $item = RabItem::create($data);
        $item->load(['division:id,nama,warna', 'user:id,nama']);

        return response()->json(['data' => $item, 'message' => 'Item RAB berhasil ditambahkan'], 201);
    }

    // PUT /rab/{id} — admin or Bendahara
    public function update(Request $request, RabItem $rabItem)
    {
        if (!$this->isBendahara()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $data = $request->validate([
            'division_id' => 'sometimes|exists:divisions,id',
            'nama_item' => 'sometimes|string|max:200',
            'satuan' => 'sometimes|string|max:50',
            'volume' => 'sometimes|numeric|min:0',
            'harga_satuan' => 'sometimes|numeric|min:0',
            'keterangan' => 'nullable|string',
        ]);

        $rabItem->update($data);
        $rabItem->refresh();
        $rabItem->load(['division:id,nama,warna', 'user:id,nama']);

        return response()->json(['data' => $rabItem, 'message' => 'Item RAB berhasil diperbarui']);
    }

    // DELETE /rab/{id} — admin or Bendahara
    public function destroy(RabItem $rabItem)
    {
        if (!$this->isBendahara()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $rabItem->delete();

        return response()->json(['message' => 'Item RAB berhasil dihapus']);
    }
}
