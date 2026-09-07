const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const { getItems, createItem, getItemById, updateItem, deleteItem, getLowStockItems, importItems, exportItems } = require('../controllers/itemController');
const { protect, admin } = require('../middleware/auth');

router.route('/').get(protect, getItems).post(protect, admin, createItem);
router.get('/low-stock', protect, getLowStockItems);
router.post('/import', protect, admin, upload.single('file'), importItems);
router.get('/export', protect, exportItems);
router.route('/:id').get(protect, getItemById).put(protect, admin, updateItem).delete(protect, admin, deleteItem);

module.exports = router;
