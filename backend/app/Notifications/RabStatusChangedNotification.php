<?php

namespace App\Notifications;

use App\Models\RabItem;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class RabStatusChangedNotification extends Notification
{
    use Queueable;

    public function __construct(public RabItem $rabItem)
    {
    }

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'title' => 'Status Pengajuan RAB',
            'message' => 'Pengajuan RAB '.$this->rabItem->nama_item.' telah '.$this->rabItem->status.'.',
            'type' => 'rab_status_changed',
            'rab_item_id' => $this->rabItem->id,
            'status' => $this->rabItem->status,
            'rejection_note' => $this->rabItem->rejection_note,
        ];
    }
}
