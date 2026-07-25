<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityReport;
use Illuminate\Http\Request;

class ActivityReportController extends Controller
{
    public function index(Request $r)
    {
        $q = ActivityReport::with(['activity:id,nama', 'user:id,nama'])->latest();
        if ($r->user()->role !== 'admin') {
            $q->where('user_id', $r->user()->id);
        }
        return response()->json(['success' => true, 'data' => ['reports' => $q->get()]]);
    }

    public function store(Request $r)
    {
        $rules = [
            'activity_id' => 'required|exists:activities,id',
            'hasil' => 'nullable|string',
            'kendala' => 'nullable|string',
            'catatan' => 'nullable|string',
        ];

        if ($r->hasFile('dokumentasi_file')) {
            $rules['dokumentasi_file'] = 'image|mimes:jpeg,png,jpg,gif,webp,svg|max:5120';
        }

        $d = $r->validate($rules);

        $d['user_id'] = $r->user()->id;

        if ($r->hasFile('dokumentasi_file')) {
            $path = $r->file('dokumentasi_file')->store('reports', 'public');
            $d['dokumentasi'] = $path;
        }
        unset($d['dokumentasi_file']);

        $report = ActivityReport::create($d);

        return response()->json(['success' => true, 'data' => ['report' => $report]], 201);
    }

    public function destroy(Request $r, ActivityReport $activityReport)
    {
        if ($r->user()->role !== 'admin' && $r->user()->id !== $activityReport->user_id) {
            return response()->json(['message' => 'Akses ditolak'], 403);
        }

        $activityReport->delete();

        return response()->json(['success' => true]);
    }
}