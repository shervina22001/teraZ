<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Room;

class RoomSeeder extends Seeder
{
    /**
     * Jalankan seeder untuk tabel rooms.
     */
    public function run(): void
    {
        $rooms = [
            [
                'nomor_kamar' => 'A101',
                'tipe'        => 'Single',
                'harga'       => 500000,
                'status'      => 'tersedia',
                'fasilitas'   => 'Kasur, Lemari, Meja Belajar'
            ],
            [
                'nomor_kamar' => 'A102',
                'tipe'        => 'Double',
                'harga'       => 750000,
                'status'      => 'tersedia',
                'fasilitas'   => 'Kasur, Lemari, Meja, AC'
            ],
            [
                'nomor_kamar' => 'B201',
                'tipe'        => 'Suite',
                'harga'       => 1200000,
                'status'      => 'terisi',
                'fasilitas'   => 'Kasur King, AC, TV, Lemari, Kamar Mandi Dalam'
            ],
        ];

        foreach ($rooms as $room) {
            Room::create($room);
        }
    }
}
