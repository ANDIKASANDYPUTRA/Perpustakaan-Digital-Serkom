<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Buku extends Model
{
    protected $table = 'buku';
    public $timestamps = false;
    protected $guarded = [
        'id',
    ];

    public function peminjaman()
    {
        return $this->hasMany(Peminjaman::class, 'id_buku');
    }
    public function kategori()
    {
        return $this->belongsToMany(KategoriBuku::class, 'buku_kategori', 'id_buku', 'id_kategori');
    }
}
