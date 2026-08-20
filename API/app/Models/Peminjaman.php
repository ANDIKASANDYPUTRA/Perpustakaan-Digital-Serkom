<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Peminjaman extends Model
{
    protected $table = 'peminjaman';
    public $timestamps = false;
    protected $guarded = [
        'id',
    ];

    public function buku()
    {
        return $this->belongsTo(Buku::class, 'id_buku');
    }
    public function anggota()
    {
        return $this->belongsTo(User::class, 'id_anggota');
    }
}
