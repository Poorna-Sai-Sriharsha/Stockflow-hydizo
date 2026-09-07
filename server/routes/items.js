const express = require('express');
const router = express.Router();
const { getItems, createItem, getItemById, updateItem, deleteItem, getLowStockItems } = require('../controllers/itemController');
const { protect, admin } = require('../middleware/auth');

router.route('/').get(protect, getItems).post(protect, admin, createItem);
router.get('/low-stock', protect, getLowStockItems);
router.route('/:id').get(protect, getItemById).put(protect, admin, updateItem).delete(protect, admin, deleteItem);

module.exports = router;
