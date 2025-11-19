<?php

namespace App\Http\Controllers;

use App\Models\Room;
use App\Models\Tenant;
use App\Models\Payment;
use App\Models\MaintenanceRequest;
use App\Models\Pengeluaran;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

class DashboardAdminController extends Controller
{
    public function index()
    {
        $now = Carbon::now();
        $currentMonth = $now->month;
        $currentYear = $now->year;

        // === Room & Tenant Statistics ===
        $totalRooms = Room::count();
        $occupiedRooms = Room::whereHas('tenants', fn($q) => $q->where('status', 'aktif'))->count();
        $emptyRooms = $totalRooms - $occupiedRooms;
        $activeTenants = Tenant::where('status', 'aktif')->count();

        // === Payment Statistics ===
        $paymentStats = Payment::selectRaw("
            SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) AS pending,
            SUM(CASE WHEN status = 'paid' THEN 1 ELSE 0 END) AS waiting_approval
        ")->first();

        // === Maintenance Statistics ===
        $pendingMaintenance = MaintenanceRequest::whereIn('status', ['pending', 'in_progress'])->count();

        // === Income (Bulanan & Total) ===
        $monthlyIncome = Payment::where('status', 'confirmed')
            ->where('period_month', $currentMonth)
            ->where('period_year', $currentYear)
            ->sum('amount');

        $totalIncome = Payment::where('status', 'confirmed')->sum('amount');

        // === Maintenance Outcome (Bulanan & Total) ===
        $maintenanceMonthly = MaintenanceRequest::where('status', 'done')
            ->whereMonth('dilaporkan_pada', $currentMonth)
            ->whereYear('dilaporkan_pada', $currentYear)
            ->sum('biaya');

        $maintenanceTotal = MaintenanceRequest::where('status', 'done')->sum('biaya');

        // === Pengeluaran Admin (Bulanan & Total) ===
        $adminOutcomeMonthly = Pengeluaran::whereMonth('tanggal', $currentMonth)
            ->whereYear('tanggal', $currentYear)
            ->sum('nominal');

        $adminOutcomeTotal = Pengeluaran::sum('nominal');

        // === Total Outcome (Maintenance + Admin Pengeluaran) ===
        $monthlyOutcome = $maintenanceMonthly + $adminOutcomeMonthly;
        $totalOutcome   = $maintenanceTotal + $adminOutcomeTotal;

        // === Derived Metrics (Profit) ===
        $monthlyProfit = $monthlyIncome - $monthlyOutcome;
        $totalProfit   = $totalIncome - $totalOutcome;

        // === Recent Payments (Last 5) ===
        $recentPayments = Payment::with(['tenant.room'])
            ->latest()
            ->limit(5)
            ->get()
            ->map(fn($p) => [
                'id' => $p->id,
                'room_number' => $p->tenant->room->nomor_kamar ?? '-',
                'tenant_name' => $p->tenant->nama ?? 'Unknown',
                'description' => $this->getPaymentPeriod($p) . ' - ' . $this->mapPaymentType($p->payment_type),
                'amount' => $p->amount,
                'status' => $p->status,
                'status_label' => $p->status_label,
                'status_color' => $this->mapPaymentStatusColor($p->status),
            ]);

        // === Recent Maintenance (Last 5) ===
        $recentMaintenance = MaintenanceRequest::with(['room', 'tenant'])
            ->latest('dilaporkan_pada')
            ->limit(5)
            ->get()
            ->map(fn($m) => [
                'id' => $m->id,
                'room_number' => $m->room->nomor_kamar ?? '-',
                'tenant_name' => $m->tenant->nama ?? '-',
                'title' => $m->judul,
                'description' => $m->deskripsi,
                'status' => $m->status,
                'status_label' => $this->mapMaintenanceStatus($m->status),
                'status_color' => $this->mapMaintenanceStatusColor($m->status),
                'priority' => $m->priority,
                'biaya' => $m->biaya,
            ]);

            $reminderLogs = Payment::with(['tenant.room'])
            ->whereNotNull('last_notified_at')
            ->orderByDesc('last_notified_at')
            ->get()
            ->map(fn($p) => [
                'id' => $p->id,
                'room_number' => $p->tenant->room->nomor_kamar ?? '-',
                'tenant_name' => $p->tenant->nama ?? '-',
                'amount' => $p->amount,
                'due_date' => $p->due_date,
                'status' => $p->status,
                'status_label' => $p->status_label ?? ucfirst($p->status),
                'status_color' => $this->mapPaymentStatusColor($p->status),
                'last_notified_at' => $p->last_notified_at,
            ]);

        // === Chart Data (Last 6 Months) ===
        // === Chart Data (6 Bulan Terakhir, Income vs Outcome) ===
        $chartData = collect(range(5, 0))
            ->map(function ($i) use ($now) {
                $date = $now->copy()->subMonths($i);
                $month = $date->month;
                $year = $date->year;

                $monthName = $this->monthNameShort($month);

                // pendapatan
                $income = Payment::where('status', 'confirmed')
                    ->where('period_month', $month)
                    ->where('period_year', $year)
                    ->sum('amount');

                // pengeluaran maintenance
                $maintenanceOutcome = MaintenanceRequest::where('status', 'done')
                    ->whereMonth('dilaporkan_pada', $month)
                    ->whereYear('dilaporkan_pada', $year)
                    ->sum('biaya');

                // pengeluaran admin
                $adminOutcome = Pengeluaran::whereMonth('tanggal', $month)
                    ->whereYear('tanggal', $year)
                    ->sum('nominal');

                // total
                $outcome = $maintenanceOutcome + $adminOutcome;

                return [
                    'month' => "{$monthName} {$year}",
                    'income' => (float) $income,
                    'outcome' => (float) $outcome,
                    'profit' => (float) ($income - $outcome),
                ];
            });

        // === Return to Inertia ===
        return Inertia::render('admin/DashboardAdminPage', [
            'user' => Auth::user(),
            'chart_data' => $chartData,
            'stats' => [
                'rooms' => [
                    'total' => $totalRooms,
                    'occupied' => $occupiedRooms,
                    'empty' => $emptyRooms,
                ],
                'tenants' => [
                    'active' => $activeTenants,
                ],
                'payments' => [
                    'pending' => (int) $paymentStats->pending,
                    'waiting_approval' => (int) $paymentStats->waiting_approval,
                ],
                'maintenance' => [
                    'pending' => $pendingMaintenance,
                ],
                'finance' => [
                    'monthly_income' => $monthlyIncome,
                    'monthly_outcome' => $monthlyOutcome,
                    'monthly_profit' => $monthlyProfit,
                    'total_income' => $totalIncome,
                    'total_outcome' => $totalOutcome,
                    'total_profit' => $totalProfit,
                ],
            ],
            'recent_payments' => $recentPayments,
            'recent_maintenance' => $recentMaintenance,
            'reminder_logs' => $reminderLogs,
        ]);
    }

    private function getPaymentPeriod(Payment $payment): string
    {
        if (!$payment->period_month || !$payment->period_year) return '-';
        return $this->monthNameFull($payment->period_month) . ' ' . $payment->period_year;
    }

    private function mapPaymentType(?string $type): string
    {
        return match ($type) {
            'rent' => 'Sewa Bulanan',
            'deposit' => 'Deposit',
            'utilities' => 'Utilitas',
            'maintenance' => 'Maintenance',
            default => 'Lainnya',
        };
    }

    private function mapPaymentStatusColor(string $status): string
    {
        return match ($status) {
            'pending' => 'yellow',
            'paid' => 'blue',
            'confirmed' => 'green',
            'rejected' => 'red',
            default => 'gray',
        };
    }

    private function mapMaintenanceStatus(string $status): string
    {
        return match ($status) {
            'pending' => 'Menunggu',
            'in_progress' => 'Proses',
            'done' => 'Selesai',
            default => 'Menunggu',
        };
    }

    private function mapMaintenanceStatusColor(string $status): string
    {
        return match ($status) {
            'pending' => 'yellow',
            'in_progress' => 'blue',
            'done' => 'green',
            default => 'gray',
        };
    }

    private function monthNameShort(int $month): string
    {
        return [
            1 => 'Jan', 2 => 'Feb', 3 => 'Mar', 4 => 'Apr',
            5 => 'Mei', 6 => 'Jun', 7 => 'Jul', 8 => 'Agu',
            9 => 'Sep', 10 => 'Okt', 11 => 'Nov', 12 => 'Des'
        ][$month] ?? '-';
    }

    private function monthNameFull(int $month): string
    {
        return [
            1 => 'Januari', 2 => 'Februari', 3 => 'Maret', 4 => 'April',
            5 => 'Mei', 6 => 'Juni', 7 => 'Juli', 8 => 'Agustus',
            9 => 'September', 10 => 'Oktober', 11 => 'November', 12 => 'Desember'
        ][$month] ?? '-';
    }
}
