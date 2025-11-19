<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use App\Models\User;
use App\Models\Room;
use App\Models\Tenant;
use App\Models\Payment;

class TenantAdminController extends Controller
{
    public function index(Request $request)
    {
        $q = Tenant::with(['user', 'room'])->orderByDesc('created_at');

        if ($request->filled('status')) {
            $q->where('status', $request->string('status'));
        }

        if ($request->filled('room_id')) {
            $q->where('room_id', (int) $request->get('room_id'));
        }

        if ($request->filled('q')) {
            $s = (string) $request->get('q');
            $q->where(function ($w) use ($s) {
                $w->where('nama', 'ilike', "%{$s}%")
                  ->orWhere('kontak', 'ilike', "%{$s}%")
                  ->orWhereHas('user', function ($wu) use ($s) {
                      $wu->where('username', 'ilike', "%{$s}%")
                         ->orWhere('name', 'ilike', "%{$s}%");
                  });
            });
        }

        return $q->paginate((int) $request->get('per_page', 15));

        $tenants->getCollection()->transform(function (Tenant $t) {
        return [
            'id'            => $t->id,
            'nama'          => $t->nama,
            'kontak'        => $t->kontak,
            'status'        => $t->status,
            'tanggal_mulai' => $t->tanggal_mulai,
            'tanggal_selesai' => $t->tanggal_selesai,
            'catatan'       => $t->catatan,
            'created_at'    => $t->created_at,
            'updated_at'    => $t->updated_at,

            // ⬇️ inilah yang kamu tanyakan
            'profile_photo' => $t->profile_photo_full,

            // Kalau admin butuh info user & room juga:
            'user' => [
                'id'       => $t->user?->id,
                'name'     => $t->user?->name,
                'username' => $t->user?->username,
                'phone'    => $t->user?->phone,
                'role'     => $t->user?->role,
            ],
            'room' => [
                'id'     => $t->room?->id,
                'number' => $t->room?->number,
                'type'   => $t->room?->type,
                'status' => $t->room?->status,
            ],
        ];
    });

        return $tenants;
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'room_id'          => ['required', 'exists:rooms,id'],
            'name'             => ['required', 'string', 'max:255'],
            'username'         => ['nullable', 'string', 'max:100'],
            'phone'            => ['nullable', 'string', 'max:50'],
            'tanggal_mulai'    => ['required', 'date'],
            'tanggal_selesai'  => ['required', 'date', 'after_or_equal:tanggal_mulai'],
            'catatan'          => ['nullable', 'string'],
        ]);

        $room = Room::findOrFail($data['room_id']);
        if ($room->status !== 'available') {
            return response()->json(['message' => 'Kamar belum tersedia'], 422);
        }

        // Auto-generate username kalau kosong
        $username = $data['username'] ?? $this->makeUsernameFromName($data['name']);

        // Cari user; bila tidak ada -> buat baru (role tenant)
        $user = User::where('username', $username)->first();
        if (! $user) {
            $user = User::create([
                'name'     => $data['name'],
                'username' => $username,
                'password' => Hash::make('password'), 
                'phone'    => $data['phone'] ?? null,
                'role'     => 'tenant',
            ]);
        } else {
            if ($user->role !== 'tenant') {
                return response()->json(['message' => 'Username dimiliki role lain'], 422);
            }
        }

        // Buat kontrak tenant
        $tenant = Tenant::create([
            'user_id'         => $user->id,
            'room_id'         => $room->id,
            'nama'            => $data['name'],
            'kontak'          => $data['phone'] ?? null,
            'tanggal_mulai'   => $data['tanggal_mulai'],
            'tanggal_selesai' => $data['tanggal_selesai'],
            'status'          => 'aktif',
            'catatan'         => $data['catatan'] ?? null,
        ]);

        // Room -> occupied
        $room->update(['status' => 'occupied']);

        // Generate tagihan bulan ini (jika belum ada)
        $year  = (int) now()->format('Y');
        $month = (int) now()->format('n');

        $exists = Payment::where('tenant_id', $tenant->id)
            ->where('period_year', $year)
            ->where('period_month', $month)
            ->exists();

        if (! $exists) {
            Payment::create([
                'tenant_id'    => $tenant->id,
                'room_id'      => $room->id,
                'period_year'  => $year,
                'period_month' => $month,
                'due_date'     => now()->startOfMonth()->addDays(14)->toDateString(),
                'amount'       => (int) $room->harga,
                'status'       => 'pending',
                'note'         => 'Tagihan awal saat check-in',
            ]);
        }

        return response()->json([
            'message' => 'Check-in berhasil',
            'tenant'  => $tenant->load(['user', 'room']),
        ], 201);
    }

    public function show(Tenant $tenant)
    {
        return $tenant->load(['user', 'room']);
    }

    public function update(Request $request, Tenant $tenant)
    {
        $data = $request->validate([
            'name'             => ['sometimes', 'string', 'max:255'],
            'username'         => ['sometimes', 'string', 'max:100'],
            'phone'            => ['sometimes', 'string', 'max:50', 'nullable'],
            'tanggal_mulai'    => ['sometimes', 'date'],
            'tanggal_selesai'  => ['sometimes', 'date', 'after_or_equal:tanggal_mulai'],
            'status'           => ['sometimes', 'string', Rule::in(['aktif','selesai','dibatalkan'])],
            'catatan'          => ['sometimes', 'string', 'nullable'],
            'room_id'          => ['sometimes', 'integer', 'exists:rooms,id'],
        ]);

        // Update user (jika ada perubahan nama/username/phone)
        if (array_key_exists('name', $data) || array_key_exists('username', $data) || array_key_exists('phone', $data)) {
            $user = $tenant->user;

            if (array_key_exists('username', $data) && $data['username'] !== $user->username) {
                // pastikan unik
                $exists = User::where('username', $data['username'])->where('id', '!=', $user->id)->exists();
                if ($exists) {
                    return response()->json(['message' => 'Username sudah digunakan'], 422);
                }
                $user->username = $data['username'];
            }

            if (array_key_exists('name', $data))  $user->name  = $data['name'];
            if (array_key_exists('phone', $data)) $user->phone = $data['phone'];
            $user->save();
        }

        // Pindah kamar (jika room_id berubah)
        if (array_key_exists('room_id', $data) && $data['room_id'] != $tenant->room_id) {
            $newRoom = Room::findOrFail($data['room_id']);
            if ($newRoom->status !== 'available') {
                return response()->json(['message' => 'Kamar tujuan tidak tersedia'], 422);
            }

            // kosongkan kamar lama hanya jika masih ditandai occupied
            if ($tenant->room && $tenant->room->status === 'occupied') {
                $tenant->room->update(['status' => 'available']);
            }

            // set kamar baru occupied
            $newRoom->update(['status' => 'occupied']);
            $tenant->room_id = $newRoom->id;
        }

        // Update field kontrak tenant
        foreach (['tanggal_mulai','tanggal_selesai','status','catatan'] as $field) {
            if (array_key_exists($field, $data)) {
                $tenant->{$field} = $data[$field];
            }
        }

        $tenant->save();

        return response()->json([
            'message' => 'Data tenant berhasil diperbarui',
            'tenant'  => $tenant->fresh()->load(['user','room']),
        ]);
    }

    public function checkout(Request $request, Tenant $tenant)
    {
        $request->validate([
            'effective_date' => ['nullable', 'date'],
        ]);

        $tenant->update([
            'status' => 'selesai',
            'catatan' => trim(($tenant->catatan ?? '') . ' ' . '[Checkout: ' . ($request->effective_date ?? now()->toDateString()) . ']')
        ]);

        if ($tenant->room) {
            $tenant->room->update(['status' => 'available']);
        }

        return response()->json([
            'message' => 'Checkout berhasil, kamar dikosongkan',
            'tenant'  => $tenant->fresh()->load(['user','room']),
        ]);
    }

    public function destroy(Tenant $tenant)
    {
        if ($tenant->room && $tenant->status === 'aktif') {
            $tenant->room->update(['status' => 'available']);
        }
        $tenant->delete();

        return response()->json(null, 204);
    }

    private function makeUsernameFromName(string $name): string
    {
        $base = Str::of($name)->slug('_')->limit(20, '');
        $candidate = (string) $base;
        $suffix = 1;

        while (User::where('username', $candidate)->exists()) {
            $candidate = $base . $suffix;
            $suffix++;
            if ($suffix > 9999) {
                $candidate = $base . '_' . Str::random(4);
                break;
            }
        }
        return $candidate;
    }
}
