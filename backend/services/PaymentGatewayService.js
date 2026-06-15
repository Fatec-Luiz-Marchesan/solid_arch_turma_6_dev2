const crypto = require('crypto');

class PaymentGatewayService {
  static async processPayment(amount, method, cardDetails = null) {
    const success = Math.random() < 0.95;
    await new Promise(resolve => setTimeout(resolve, 500));
    if (success) {
      return {
        success: true,
        transactionId: crypto.randomBytes(16).toString('hex'),
        message: 'Pagamento autorizado'
      };
    }
    return { success: false, error: 'Transação negada pelo banco' };
  }

  static async refund(transactionId) {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { success: true, message: 'Reembolso processado' };
  }

  static async generatePix(amount) {
    const code = crypto.randomBytes(32).toString('hex');
    const qrCode = `00020126580014BR.GOV.BCB.PIX0136${code}5204000053039865404${amount}5802BR5925PaymentSystem6009SAO PAULO62290525${code}6304E2A8`;
    return {
      code,
      qrCode,
      expiresAt: new Date(Date.now() + 30 * 60 * 1000)
    };
  }

  static async generateBoleto(amount) {
    const barcode = crypto.randomBytes(12).toString('hex').toUpperCase();
    return {
      barcode,
      url: `https://pay.example/boleto/${barcode}`,
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
    };
  }
}

module.exports = PaymentGatewayService;
