<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Deal extends Model
{
    use HasFactory;

    protected $guarded = [];

    protected $casts = [
        'deal_value' => 'decimal:2',
        'probability_percent' => 'integer',
        'expected_closing_date' => 'date',
    ];

    public function customerAccount()
    {
        return $this->belongsTo(CustomerAccount::class);
    }

    public function lead()
    {
        return $this->belongsTo(Lead::class);
    }

    public function assignedUser()
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }
}
