<?php

namespace App\Console\Commands;

use App\Models\Activity;
use App\Models\Attendance;
use App\Models\User;
use App\Notifications\AttendanceReminderNotification;
use Carbon\Carbon;
use Illuminate\Console\Command;

class AttendanceReminders extends Command
{
    protected $signature = 'notifications:attendance-reminders {--now= : ISO datetime in Asia/Jakarta}';
    protected $description = 'Kirim pengingat absensi kepada peserta yang belum absen';

    public function handle(): int
    {
        $now = $this->option('now') ? Carbon::parse($this->option('now'), 'Asia/Jakarta') : now('Asia/Jakarta');
        $sent = 0;
        $activities = Activity::whereNotIn('status', ['selesai', 'dibatalkan'])->get();
        foreach ($activities as $activity) {
            $date = $activity->tanggal->format('Y-m-d');
            $start = Carbon::parse($date.' '.$activity->jam_mulai, 'Asia/Jakarta');
            $end = Carbon::parse($date.' '.$activity->jam_selesai, 'Asia/Jakarta');
            if (!($now->betweenIncluded($start->copy()->subHour(), $end))) continue;
            $occurrenceKey = $date.'_'.$activity->id;
            foreach (User::where('role', 'peserta')->get() as $user) {
                $attended = Attendance::where('user_id', $user->id)->where('activity_id', $activity->id)->whereDate('tanggal', $date)->exists();
                $duplicate = $user->notifications()->where('type', AttendanceReminderNotification::class)->get()->contains(function ($notification) use ($activity, $occurrenceKey) {
                    $data = $notification->data;
                    return ($data['activity_id'] ?? null) == $activity->id && ($data['occurrence_key'] ?? null) === $occurrenceKey;
                });
                if (!$attended && !$duplicate) {
                    $user->notify(new AttendanceReminderNotification([
                        'type' => 'attendance_reminder', 'label' => 'Pengingat Absensi', 'title' => 'Pengingat Absensi',
                        'message' => 'Jangan lupa melakukan absensi untuk kegiatan '.$activity->nama.'.', 'status' => $activity->status,
                        'occurred_at' => $now->toIso8601String(), 'activity_id' => $activity->id, 'occurrence_key' => $occurrenceKey,
                        'report_id' => null, 'url' => '/activities/'.$activity->id,
                    ]));
                    $sent++;
                }
            }
        }
        $this->info("Terkirim: {$sent}");
        return self::SUCCESS;
    }
}
