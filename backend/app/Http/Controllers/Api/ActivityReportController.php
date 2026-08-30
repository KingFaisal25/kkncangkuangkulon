<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityReport;
use App\Models\User;
use App\Notifications\ActivityNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Notification;

class ActivityReportController extends Controller
{
    public function index(Request $r)
    {
        $q = ActivityReport::with(['activity:id,nama', 'user:id,nama'])->latest();
        if ($r->user()->role !== 'admin') {
            $q->where(function ($query) use ($r) {
                $query->where('user_id', $r->user()->id)->orWhere('status', 'published');
            });
        }
        return response()->json(['success' => true, 'data' => ['reports' => $q->get()]]);
    }

    public function store(Request $r)
    {
        $rules = ['activity_id' => 'required|exists:activities,id', 'hasil' => 'nullable|string', 'kendala' => 'nullable|string', 'catatan' => 'nullable|string'];
        if ($r->hasFile('dokumentasi_file')) $rules['dokumentasi_file'] = 'image|mimes:jpeg,png,jpg,gif,webp,svg|max:5120';
        $d = $r->validate($rules);
        $d['user_id'] = $r->user()->id;
        if ($r->hasFile('dokumentasi_file')) $d['dokumentasi'] = $r->file('dokumentasi_file')->store('reports', 'public');
        unset($d['dokumentasi_file']);
        $report = ActivityReport::create($d);
        return response()->json(['success' => true, 'data' => ['report' => $report]], 201);
    }

    public function publish(Request $r, ActivityReport $activityReport)
    {
        if ($activityReport->status === 'published') {
            return response()->json(['success' => true, 'data' => ['report' => $activityReport]]);
        }
        $activityReport->update(['status' => 'published', 'published_at' => now('Asia/Jakarta'), 'published_by' => $r->user()->id]);
        $activityReport->load('activity');
        Notification::send(User::where('role', 'peserta')->get(), new ActivityNotification([
            'type' => 'activity_report_published', 'label' => 'Laporan Kegiatan Diterbitkan',
            'title' => 'Laporan Kegiatan Baru', 'message' => 'Laporan kegiatan '.$activityReport->activity->nama.' telah diterbitkan.',
            'status' => 'published', 'occurred_at' => now('Asia/Jakarta')->toIso8601String(),
            'activity_id' => $activityReport->activity_id, 'report_id' => $activityReport->id, 'url' => '/reports/'.$activityReport->id,
        ]));
        return response()->json(['success' => true, 'data' => ['report' => $activityReport->fresh()]]);
    }

    public function destroy(Request $r, ActivityReport $activityReport)
    {
        if ($r->user()->role !== 'admin' && $r->user()->id !== $activityReport->user_id) return response()->json(['message' => 'Akses ditolak'], 403);
        $activityReport->delete();
        return response()->json(['success' => true]);
    }
}
