const express = require('express');
const router = express.Router();
const { createTransaction, getItemTransactions, getAllTransactions } = require('../controllers/transactionController');
const { protect } = require('../middleware/auth');

router.route('/').post(protect, createTransaction).get(protect, getAllTransactions);
router.get('/item/:itemId', protect, getItemTransactions);

module.exports = router;
