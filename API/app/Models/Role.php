<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Role extends Model
{
    protected $table = 'role';

    protected $guarded = [
        'id',
    ];

    public function pengguna()
    {
        return $this->hasMany(User::class, 'id_role');
    }
}
