const validator = require('validator');

class PaymentValidator {
  static validateAmount(amount) {
    if (!amount || isNaN(amount)) {
      return { valid: false, message: 'Valor inválido' };
    }
    const amountNum = parseFloat(amount);
    if (amountNum < 0.01) {
      return { valid: false, message: 'Valor mínimo é R$ 0,01' };
    }
    if (amountNum > 10000) {
      return { valid: false, message: 'Valor máximo é R$ 10.000' };
    }
    return { valid: true, value: amountNum };
  }

  static validatePaymentMethod(method) {
    const validMethods = ['credit_card', 'debit_card', 'pix', 'boleto', 'cash'];
    if (!method || !validMethods.includes(method)) {
      return { valid: false, message: 'Método de pagamento inválido' };
    }
    return { valid: true, value: method };
  }

  static validateCardDetails(cardDetails, paymentMethod) {
    if (paymentMethod !== 'credit_card' && paymentMethod !== 'debit_card') {
      return { valid: true };
    }

    if (!cardDetails) {
      return { valid: false, message: 'Dados do cartão são obrigatórios' };
    }

    const { last4, brand, holderName } = cardDetails;

    if (!last4 || !/^\d{4}$/.test(last4)) {
      return { valid: false, message: 'Últimos 4 dígitos do cartão inválidos' };
    }

    if (!brand || typeof brand !== 'string') {
      return { valid: false, message: 'Bandeira do cartão inválida' };
    }

    if (!holderName || holderName.length < 3) {
      return { valid: false, message: 'Nome do titular inválido' };
    }

    return { valid: true };
  }

  static validateStatus(status) {
    const validStatus = ['pending', 'paid', 'failed', 'refunded', 'canceled'];
    if (status && !validStatus.includes(status)) {
      return { valid: false, message: 'Status inválido' };
    }
    return { valid: true };
  }

  static validateObjectId(id) {
    if (!id) {
      return { valid: false, message: 'ID não fornecido' };
    }
    const isValid = id.match(/^[0-9a-fA-F]{24}$/);
    if (!isValid) {
      return { valid: false, message: 'ID inválido' };
    }
    return { valid: true };
  }
}

module.exports = PaymentValidator;
