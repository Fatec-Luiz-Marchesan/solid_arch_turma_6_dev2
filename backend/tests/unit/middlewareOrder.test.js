const fs = require('fs');
const path = require('path');

describe('Ordem dos middlewares nas rotas (inspeção de código)', () => {
  const adminRoutesPath = path.join(__dirname, '../../routers/AdminRoutes.js');
  const paymentRoutesPath = path.join(__dirname, '../../routers/PaymentRoutes.js');

  let adminContent = '';
  let paymentContent = '';

  beforeAll(() => {
    if (fs.existsSync(adminRoutesPath)) {
      adminContent = fs.readFileSync(adminRoutesPath, 'utf8');
    }
    if (fs.existsSync(paymentRoutesPath)) {
      paymentContent = fs.readFileSync(paymentRoutesPath, 'utf8');
    }
  });

  describe('AdminRoutes.js', () => {
    test('rotas protegidas devem ter apiLimiter antes de checkToken', () => {
      const protectedRoutePattern = /router\.(get|post|put|delete|patch)\(\s*['"](?!\/register|\/login)([^'"]+)['"],\s*([^,]+),\s*([^,]+)/g;
      let match;
      let hasError = false;
      const errors = [];

      while ((match = protectedRoutePattern.exec(adminContent)) !== null) {
        let firstMw = match[3].trim().split('//')[0].trim();
        let secondMw = match[4].trim().split('//')[0].trim();
        if (firstMw === 'apiLimiter' && secondMw === 'checkToken') {
          // ok
        } else if (firstMw === 'checkToken' && secondMw === 'apiLimiter') {
          errors.push(`❌ Rota ${match[1]} ${match[2]}: ordem invertida`);
          hasError = true;
        } else if (!firstMw.includes('apiLimiter') && !secondMw.includes('apiLimiter')) {
          errors.push(`⚠️ Rota ${match[1]} ${match[2]}: apiLimiter ausente`);
          hasError = true;
        }
      }
      if (errors.length) console.log(errors.join('\n'));
      expect(hasError).toBe(false);
    });

    test('rotas públicas (login/register) devem ter authLimiter', () => {
      const loginMatch = adminContent.match(/router\.post\(\s*'\/login',\s*([^,]+)/);
      const registerMatch = adminContent.match(/router\.post\(\s*'\/register',\s*([^,]+)/);
      if (loginMatch) expect(loginMatch[1].trim()).toContain('authLimiter');
      if (registerMatch) expect(registerMatch[1].trim()).toContain('authLimiter');
    });
  });

  describe('PaymentRoutes.js', () => {
    test('rotas protegidas devem ter apiLimiter antes de authMiddleware', () => {
      if (!paymentContent) return;
      const protectedRoutePattern = /router\.(get|post|put|delete|patch)\(\s*['"](?!\/webhook)([^'"]+)['"],\s*([^,]+),\s*([^,]+)/g;
      let match;
      let hasError = false;
      const errors = [];

      while ((match = protectedRoutePattern.exec(paymentContent)) !== null) {
        let firstMw = match[3].trim().split('//')[0].trim();
        let secondMw = match[4].trim().split('//')[0].trim();
        if (firstMw === 'apiLimiter' && secondMw === 'authMiddleware') {
          // ok
        } else if (firstMw === 'authMiddleware' && secondMw === 'apiLimiter') {
          errors.push(`❌ Rota ${match[1]} ${match[2]}: ordem invertida`);
          hasError = true;
        } else if (!firstMw.includes('apiLimiter') && !secondMw.includes('apiLimiter')) {
          errors.push(`⚠️ Rota ${match[1]} ${match[2]}: apiLimiter ausente`);
          hasError = true;
        }
      }
      if (errors.length) console.log(errors.join('\n'));
      expect(hasError).toBe(false);
    });

    test('webhook deve ter authLimiter (sem authMiddleware)', () => {
      if (!paymentContent) return;
      const webhookMatch = paymentContent.match(/router\.post\(\s*'\/webhook',\s*([^,]+),\s*([^,]+)/);
      if (webhookMatch) {
        expect(webhookMatch[1].trim()).toContain('authLimiter');
        expect(webhookMatch[2].trim()).not.toContain('authMiddleware');
      }
    });
  });
});