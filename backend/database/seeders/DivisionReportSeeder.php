<?php

namespace Database\Seeders;

use App\Models\Division;
use App\Models\DivisionReport;
use App\Models\User;
use Illuminate\Database\Seeder;

class DivisionReportSeeder extends Seeder
{
    public function run(): void
    {
        // ponytail: uses first user (admin) as the report author; upgrade by
        // picking per-division members once user<->division assignment is seeded.
        $author = User::first();
        if (!$author) {
            return;
        }

        $byName = Division::pluck('id', 'nama');

        $templates = [
            'Bendahara' => [
                ['judul' => 'Laporan Penerimaan Iuran Minggu 1', 'deskripsi' => 'Iuran dari seluruh anggota terkumpul Rp 350.000.', 'progress' => 100, 'status' => 'selesai'],
                ['judul' => 'Penyusunan RAB Program Kerja', 'deskripsi' => 'Menyusun anggaran untuk 5 program kerja prioritas.', 'progress' => 60, 'status' => 'berjalan'],
            ],
            'Lingkungan' => [
                ['judul' => 'Kerja Bakti Pembersihan Saluran Air', 'deskripsi' => 'Membersihkan saluran air di RT 03 bersama warga.', 'progress' => 100, 'status' => 'selesai'],
                ['judul' => 'Sosialisasi Pilah Sampah', 'deskripsi' => 'Edukasi pemilahan sampah organik & anorganik.', 'progress' => 40, 'status' => 'berjalan'],
            ],
            'Pendidikan' => [
                ['judul' => 'Bimbingan Belajar Anak SD', 'deskripsi' => 'Les gratis matematika untuk 15 siswa.', 'progress' => 75, 'status' => 'berjalan'],
            ],
            'Humas' => [
                ['judul' => 'Kunjungan ke Balai Desa', 'deskripsi' => 'Permitaan dan koordinasi program dengan perangkat desa.', 'progress' => 100, 'status' => 'selesai'],
            ],
        ];

        foreach ($templates as $divName => $reports) {
            $divisionId = $byName[$divName] ?? null;
            if (!$divisionId) {
                continue;
            }

            foreach ($reports as $r) {
                DivisionReport::firstOrCreate(
                    [
                        'division_id' => $divisionId,
                        'judul' => $r['judul'],
                    ],
                    array_merge($r, [
                        'user_id' => $author->id,
                        'tanggal_laporan' => now(),
                    ])
                );
            }
        }
    }
}