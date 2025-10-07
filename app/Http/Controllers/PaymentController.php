<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use Illuminate\Http\Request;

class PaymentController extends Controller
{
    public function index()
    {
        return response()->json(Payment::all(), 200);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'tenant_id' => 'required|exists:tenants,id',
            'payment_type' => 'required|in:monthly_rent,deposit,utility,penalty',
            'amount' => 'required|numeric|min:0',
            'due_date' => 'required|date',
            'payment_date' => 'nullable|date',
            'status' => 'in:pending,paid,overdue,cancelled',
            'payment_method' => 'nullable|string|max:50',
            'notes' => 'nullable|string'
        ]);

        $payment = Payment::create($validated);
        return response()->json($payment, 201);
    }

    public function show($id)
    {
        return response()->json(Payment::findOrFail($id), 200);
    }

    public function update(Request $request, $id)
    {
        $payment = Payment::findOrFail($id);
        $payment->update($request->all());
        return response()->json($payment, 200);
    }

    public function destroy($id)
    {
        Payment::findOrFail($id)->delete();
        return response()->json(['message' => 'Payment deleted successfully'], 200);
    }
}
