<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Company extends Model
{
    use HasFactory;

    protected $guarded = [];

    protected $casts = [
        'settings' => 'array',
    ];

    public function branches()
    {
        return $this->hasMany(Branch::class);
    }

    public function departments()
    {
        return $this->hasMany(Department::class);
    }

    public function employees()
    {
        return $this->hasMany(Employee::class);
    }

    public function leads()
    {
        return $this->hasMany(Lead::class);
    }

    public function customerAccounts()
    {
        return $this->hasMany(CustomerAccount::class);
    }

    public function deals()
    {
        return $this->hasMany(Deal::class);
    }
}
