class PaymentValidation {
  static validateAmount(amount) {
    if (!amount || isNaN(amount)) return { valid: false, message: 'Valor inválido' };
    const num = parseFloat(amount);
    if (num < 0.01) return { valid: false, message: 'Valor mínimo é R$ 0,01' };
    if (num > 10000) return { valid: false, message: 'Valor máximo é R$ 10.000' };
    return { valid: true, value: num };
  }
  static validatePaymentMethod(method) {
    const valid = ['credit_card', 'debit_card', 'pix', 'boleto', 'cash'];
    if (!method || !valid.includes(method)) return { valid: false, message: 'Método de pagamento inválido' };
    return { valid: true, value: method };
  }
  static validateCardDetails(details, method) {
    if (!['credit_card', 'debit_card'].includes(method)) return { valid: true };
    if (!details) return { valid: false, message: 'Dados do cartão obrigatórios' };
    if (!details.last4 || !/^\d{4}$/.test(details.last4)) return { valid: false, message: 'Últimos 4 dígitos inválidos' };
    if (!details.brand || typeof details.brand !== 'string') return { valid: false, message: 'Bandeira do cartão inválida' };
    if (!details.holderName || details.holderName.length < 3) return { valid: false, message: 'Nome do titular inválido' };
    return { valid: true };
  }
  static validateObjectId(id) {
    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) return { valid: false, message: 'ID inválido' };
    return { valid: true };
  }
}
module.exports = PaymentValidation;
