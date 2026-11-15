<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Candidate extends Model
{
    use HasFactory;

    protected $guarded = [];

    protected $casts = [
        'rating' => 'integer',
        'ai_match_score' => 'integer',
        'interview_scheduled_at' => 'datetime',
    ];

    public function jobOpening()
    {
        return $this->belongsTo(JobOpening::class);
    }
}
