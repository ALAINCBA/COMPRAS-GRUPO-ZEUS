const { body, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

const validateLogin = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
  handleValidationErrors
];

const validatePurchase = [
  body('order_number').notEmpty().trim(),
  body('store_id').isInt().toInt(),
  body('supplier_id').isInt().toInt(),
  body('purchase_date').isISO8601(),
  body('total_amount').isDecimal().toFloat(),
  handleValidationErrors
];

const validateInstallment = [
  body('purchase_id').isInt().toInt(),
  body('installment_number').isInt().toInt(),
  body('due_date').isISO8601(),
  body('amount').isDecimal().toFloat(),
  handleValidationErrors
];

const validatePayment = [
  body('installment_id').isInt().toInt(),
  body('payment_date').isISO8601(),
  body('amount_paid').isDecimal().toFloat(),
  body('payment_method').notEmpty(),
  handleValidationErrors
];

module.exports = {
  validateLogin,
  validatePurchase,
  validateInstallment,
  validatePayment
};
