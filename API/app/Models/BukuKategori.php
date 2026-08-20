<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BukuKategori extends Model
{
    protected $table = 'buku_kategori';
    public $timestamps = false;
    protected $guarded = [
        'id',
    ];

    public function BukuKategori()
    {
        return $this->belongsToMany(BukuKategori::class, 'id_kategori');
    }
}
