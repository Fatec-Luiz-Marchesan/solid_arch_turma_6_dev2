const express = require('express');
const app = express();
app.use(express.json());
app.use((req, res, next) => {
  req.userId = '507f1f77bcf86cd799439011';
  next();
});
const PaymentRoutes = require('../../routers/PaymentRoutes');
app.use('/api/payments', PaymentRoutes);
module.exports = app;
