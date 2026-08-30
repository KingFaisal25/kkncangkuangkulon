<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Notifications\DatabaseNotification;

class NotificationController extends Controller
{
    public function index(Request $request)
    {
        return response()->json([
            'data' => $request->user()->notifications()->latest()->limit(30)->get(),
            'unread_count' => $request->user()->unreadNotifications()->count(),
        ]);
    }

    public function read(Request $request, string $id)
    {
        $notification = DatabaseNotification::findOrFail($id);
        if ($notification->notifiable_type !== $request->user()::class
            || (int) $notification->notifiable_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        $notification->markAsRead();
        return response()->json(['data' => $notification->refresh()]);
    }

    public function readAll(Request $request)
    {
        $request->user()->unreadNotifications->markAsRead();
        return response()->json(['message' => 'Semua notifikasi telah dibaca']);
    }
}
