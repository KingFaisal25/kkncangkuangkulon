<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\FinancialTransaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class FinancialController extends Controller
{
    private function isBendahara(): bool
    {
        $user = Auth::user();
        if ($user->role === 'admin')
            return true;
        if (!$user->division_id)
            return false;

        // Load division name
        $divName = strtolower($user->division?->nama ?? '');
        return str_contains($divName, 'bendahara');
    }

    // GET /finance — all auth users
    public function index(Request $request)
    {
        $transactions = FinancialTransaction::with('user:id,nama,nim')
            ->orderBy('tanggal', 'desc')
            ->orderBy('created_at', 'desc')
            ->get();

        $pemasukan = $transactions->where('jenis', 'pemasukan')->sum('jumlah');
        $pengeluaran = $transactions->where('jenis', 'pengeluaran')->sum('jumlah');
        $saldo = $pemasukan - $pengeluaran;

        return response()->json([
            'data' => [
                'summary' => [
                    'saldo' => $saldo,
                    'total_pemasukan' => $pemasukan,
                    'total_pengeluaran' => $pengeluaran,
                ],
                'transactions' => $transactions->values(),
            ],
        ]);
    }

    // POST /finance — admin or Bendahara
    public function store(Request $request)
    {
        if (!$this->isBendahara()) {
            return response()->json(['message' => 'Hanya Bendahara atau Admin yang bisa menambah transaksi'], 403);
        }

        $data = $request->validate([
            'jenis' => 'required|in:pemasukan,pengeluaran',
            'judul' => 'required|string|max:200',
            'jumlah' => 'required|numeric|min:0',
            'keterangan' => 'nullable|string',
            'bukti_foto' => 'nullable|string', // base64
            'tanggal' => 'required|date',
        ]);

        $data['user_id'] = Auth::id();

        $transaction = FinancialTransaction::create($data);
        $transaction->load('user:id,nama,nim');

        return response()->json(['data' => $transaction, 'message' => 'Transaksi berhasil ditambahkan'], 201);
    }

    // DELETE /finance/{id} — admin or Bendahara
    public function destroy(FinancialTransaction $financialTransaction)
    {
        if (!$this->isBendahara()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $financialTransaction->delete();

        return response()->json(['message' => 'Transaksi berhasil dihapus']);
    }

    // GET /finance/summary — quick summary for dashboard widget
    public function summary()
    {
        $transactions = FinancialTransaction::orderBy('tanggal', 'desc')->limit(5)->get();
        $all = FinancialTransaction::all();

        $pemasukan = $all->where('jenis', 'pemasukan')->sum('jumlah');
        $pengeluaran = $all->where('jenis', 'pengeluaran')->sum('jumlah');

        return response()->json([
            'data' => [
                'saldo' => $pemasukan - $pengeluaran,
                'total_pemasukan' => $pemasukan,
                'total_pengeluaran' => $pengeluaran,
                'recent' => $transactions->values(),
            ],
        ]);
    }
}
