<?php

namespace App\Http\Controllers;

use App\Models\Pengeluaran;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Carbon\Carbon;

class PengeluaranController extends Controller
{
    public function index(Request $request)
    {
        $month = $request->input('month') ?: null;
        $year  = $request->input('year')  ?: null;
        $kategori = $request->input('kategori') ?: null;

        $query = Pengeluaran::query();

        if ($year) {
            $query->whereYear('tanggal', $year);
        }

        if ($month) {
            $query->whereMonth('tanggal', $month);
        }

        if ($kategori && $kategori !== '' && $kategori !== 'all') {
            $query->where('kategori', $kategori);
        }

        $query->orderBy('tanggal', 'desc')->orderBy('id', 'desc');

        $pengeluarans = $query->get()->map(function ($p) {
            return [
                'id'        => $p->id,
                'judul'     => $p->judul,
                'kategori'  => $p->kategori,
                'deskripsi' => $p->deskripsi,
                'tanggal'   => $p->tanggal?->format('d/m/Y') ?? '-',
                'nominal'   => $p->nominal,
            ];
        });

        $today = Carbon::today();
        $currentMonth = $today->month;
        $currentYear  = $today->year;

        $stats = [
            'total' => Pengeluaran::sum('nominal'),
            'month_total' => Pengeluaran::whereYear('tanggal', $currentYear)
                ->whereMonth('tanggal', $currentMonth)
                ->sum('nominal'),
            'today_total' => Pengeluaran::whereDate('tanggal', $today)->sum('nominal'),
        ];

        return Inertia::render('admin/PengeluaranAdminPage', [
            'user' => Auth::user(),
            'pengeluarans' => $pengeluarans,
            'stats' => $stats,
            'filters' => [
                'month' => $month,
                'year' => $year,
                'kategori' => $kategori,
            ],
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'judul'     => 'required|string|max:255',
            'kategori'  => 'nullable|string|max:100',
            'deskripsi' => 'nullable|string|max:1000',
            'tanggal'   => 'required|date',
            'nominal'   => 'required|integer|min:0',
        ]);

        $data['created_by'] = Auth::id();
        
        // Convert tanggal to proper format
        $data['tanggal'] = Carbon::parse($data['tanggal'])->format('Y-m-d');

        Pengeluaran::create($data);

        return redirect()->route('admin.pengeluaran.index')
            ->with('success', 'Pengeluaran berhasil ditambahkan.');
    }

    public function update(Request $request, $id)
    {
        $pengeluaran = Pengeluaran::findOrFail($id);
        
        $data = $request->validate([
            'judul'     => 'required|string|max:255',
            'kategori'  => 'nullable|string|max:100',
            'deskripsi' => 'nullable|string|max:1000',
            'tanggal'   => 'required|date',
            'nominal'   => 'required|integer|min:0',
        ]);

        $data['tanggal'] = Carbon::parse($data['tanggal'])->format('Y-m-d');
        $pengeluaran->update($data);

        return redirect()->route('admin.pengeluaran.index')
            ->with('success', 'Pengeluaran berhasil diperbarui.');
    }

    public function destroy($id)
    {
        $pengeluaran = Pengeluaran::findOrFail($id);
        $pengeluaran->delete();

        return redirect()->route('admin.pengeluaran.index')
            ->with('success', 'Pengeluaran berhasil dihapus.');
    }
}