const Payment = require('../../models/Payment');

describe('Payment Model (testes diretos)', () => {
  test('markAsPaid altera status e transactionId', () => {
    const payment = new Payment({ amount: 100 });
    payment.markAsPaid('tx123');
    expect(payment.status).toBe('paid');
    expect(payment.transactionId).toBe('tx123');
    expect(payment.paidAt).toBeInstanceOf(Date);
  });

  test('markAsCanceled altera status e canceledAt', () => {
    const payment = new Payment({ amount: 100 });
    payment.markAsCanceled();
    expect(payment.status).toBe('canceled');
    expect(payment.canceledAt).toBeInstanceOf(Date);
  });

  test('markAsRefunded altera status e refundedAt', () => {
    const payment = new Payment({ amount: 100 });
    payment.markAsRefunded();
    expect(payment.status).toBe('refunded');
    expect(payment.refundedAt).toBeInstanceOf(Date);
  });

  test('markAsFailed altera status', () => {
    const payment = new Payment({ amount: 100 });
    payment.markAsFailed();
    expect(payment.status).toBe('failed');
  });
});
