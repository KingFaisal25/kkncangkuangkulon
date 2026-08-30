<?php

namespace App\Notifications;

use App\Models\RabItem;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class RabSubmittedNotification extends Notification
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
            'title' => 'Pengajuan RAB Baru',
            'message' => $this->rabItem->user->nama.' mengajukan RAB '.$this->rabItem->nama_item.'.',
            'type' => 'rab_submitted',
            'rab_item_id' => $this->rabItem->id,
        ];
    }
}
