<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PerformanceReview extends Model
{
    use HasFactory;

    protected $guarded = [];

    protected $casts = [
        'kpi_score' => 'decimal:1',
        'goals_achievement' => 'decimal:1',
        'overall_score' => 'decimal:1',
        'promotion_recommendation' => 'boolean',
    ];

    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }

    public function reviewer()
    {
        return $this->belongsTo(User::class, 'reviewer_id');
    }
}
