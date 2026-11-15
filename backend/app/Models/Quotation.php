<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Quotation extends Model
{
    use HasFactory;

    protected $guarded = [];

    protected $casts = [
        'subtotal' => 'decimal:2',
        'tax_amount' => 'decimal:2',
        'discount_amount' => 'decimal:2',
        'grand_total' => 'decimal:2',
        'valid_until' => 'date',
        'items' => 'array',
    ];

    public function customerAccount()
    {
        return $this->belongsTo(CustomerAccount::class);
    }

    public function deal()
    {
        return $this->belongsTo(Deal::class);
    }
}
