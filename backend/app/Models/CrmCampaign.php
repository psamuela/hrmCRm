<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CrmCampaign extends Model
{
    use HasFactory;

    protected $guarded = [];

    protected $casts = [
        'open_rate' => 'decimal:1',
        'click_rate' => 'decimal:1',
    ];
}
