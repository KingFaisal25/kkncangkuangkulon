<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Division;

class DivisionSeeder extends Seeder
{
    public function run(): void
    {
        $divisions = [
            ['nama' => 'Koordinator', 'deskripsi' => 'Ketua dan koordinator umum KKN', 'warna' => '#f59e0b'],
            ['nama' => 'Sekretaris', 'deskripsi' => 'Administrasi dan dokumentasi kelompok', 'warna' => '#6366f1'],
            ['nama' => 'Bendahara', 'deskripsi' => 'Pengelola keuangan dan anggaran KKN', 'warna' => '#10b981'],
            ['nama' => 'Humas', 'deskripsi' => 'Hubungan masyarakat dan komunikasi', 'warna' => '#0ea5e9'],
            ['nama' => 'Dokumentasi', 'deskripsi' => 'Foto, video, dan arsip kegiatan', 'warna' => '#ec4899'],
            ['nama' => 'Pendidikan', 'deskripsi' => 'Program kerja bidang pendidikan', 'warna' => '#8b5cf6'],
            ['nama' => 'Kesehatan', 'deskripsi' => 'Program kerja bidang kesehatan warga', 'warna' => '#ef4444'],
            ['nama' => 'Lingkungan', 'deskripsi' => 'Program kerja bidang lingkungan dan kebersihan', 'warna' => '#84cc16'],
        ];

        foreach ($divisions as $div) {
            Division::firstOrCreate(['nama' => $div['nama']], $div);
        }
    }
}
