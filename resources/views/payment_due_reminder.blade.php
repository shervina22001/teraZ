<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Pengingat Pembayaran – Arzetta Co-Living</title>
</head>

<body style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
    {{-- Sapaan ke penyewa kos (tenant) --}}
    <p>
        Halo <strong>{{ $payment->tenant->name }}</strong> 👋,<br>
        kamu adalah bagian dari <strong>Arzetta People’s</strong>, komunitas penghuni Arzetta Co-Living 💛
    </p>

    <p>
        Kami ingin mengingatkan dengan ramah bahwa kamu memiliki tagihan yang sudah memasuki
        masa jatuh tempo di <strong>Arzetta Co-Living</strong>.
    </p>

    <p>
        📌 <strong>Detail Tagihan</strong><br>
        Nominal: <strong>Rp {{ number_format($payment->amount, 0, ',', '.') }}</strong><br>
        Jatuh Tempo: <strong>{{ $payment->due_date->format('d-m-Y') }}</strong><br>
        Status Saat Ini: <strong>{{ strtoupper($payment->status) }}</strong>
    </p>

    <p>
        Supaya tetap nyaman tinggal di Arzetta Co-Living, yuk segera selesaikan pembayaran sesuai
        nominal di atas ya 🙏  
        Kalau kamu <strong>sudah melakukan pembayaran</strong>, kamu bisa abaikan email ini 😊
    </p>

    <p>
        Kalau ada kendala atau butuh bantuan, tim <strong>Arzetta Co-Living</strong> selalu siap membantu
        Arzetta People’s kapan saja 💬
    </p>

    <p style="margin-top: 24px; color: #777;">
        Salam hangat,<br>
        <strong>Arzetta Co-Living</strong><br>
        untuk seluruh <strong>Arzetta People’s</strong> 🏠
    </p>
</body>
</html>
