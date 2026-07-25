<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Activity;
use App\Models\ActivityReport;
use App\Models\AttendanceRequest;
use App\Models\User;
use App\Models\WorkProgram;
use App\Models\Division;
use App\Models\FinancialTransaction;
use App\Models\RabItem;

class DashboardController extends Controller
{
    public function index()
    {
        $pemasukan = FinancialTransaction::where('jenis', 'pemasukan')->sum('jumlah');
        $pengeluaran = FinancialTransaction::where('jenis', 'pengeluaran')->sum('jumlah');
        $saldoKas = $pemasukan - $pengeluaran;

        return response()->json([
            'success' => true,
            'data' => [
                'peserta' => User::where('role', 'peserta')->count(),
                'kegiatan' => Activity::count(),
                'kegiatan_selesai' => Activity::where('status', 'selesai')->count(),
                'program' => WorkProgram::count(),
                'program_selesai' => WorkProgram::where('status', 'selesai')->count(),
                'laporan' => ActivityReport::count(),
                'pengajuan_menunggu' => AttendanceRequest::where('status', 'menunggu')->count(),
                'total_divisi' => Division::count(),
                'saldo_kas' => (float) $saldoKas,
                'total_rab' => (float) RabItem::sum('total'),
            ]
        ]);
    }
}