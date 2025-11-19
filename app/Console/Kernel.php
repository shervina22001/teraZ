<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

// Tambahkan command reminder kamu di sini:
use App\Console\Commands\SendPaymentReminders;

class Kernel extends ConsoleKernel
{
    /**
     * Register the commands for the application.
     *
     * Di sini Laravel akan otomatis memuat
     * semua file di app/Console/Commands/
     */
    protected $commands = [
        SendPaymentReminders::class, // <= DAFTARKAN COMMAND DI SINI
    ];

    /**
     * Define the application's command schedule.
     *
     * Semua scheduler harian/bulanan/waktu tertentu 
     * ditaruh di sini.
     */
    protected function schedule(Schedule $schedule): void
    {
        // Jalankan reminder setiap hari jam 8 pagi (waktu server)
        $schedule->command('payments:send-reminders')
            ->dailyAt('08:00')
            ->withoutOverlapping();
    }

    /**
     * Register the commands for the application.
     */
    protected function commands(): void
    {
        // Load semua file di routes/console.php
        $this->load(__DIR__.'/Commands');

        require base_path('routes/console.php');
    }
}
