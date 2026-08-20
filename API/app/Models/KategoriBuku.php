<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class KategoriBuku extends Model
{
    protected $table = 'kategori_buku';
    public $timestamps = false;
    protected $guarded = [
        'id',
    ];

    public function BukuKategori()
    {
        return $this->belongsToMany(BukuKategori::class, 'id_kategori');
    }
}
