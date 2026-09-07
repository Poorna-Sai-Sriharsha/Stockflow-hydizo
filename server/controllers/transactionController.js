const Transaction = require('../models/Transaction');
const Item = require('../models/Item');

exports.createTransaction = async (req, res) => {
  const { itemId, type, quantity, note } = req.body;
  try {
    const item = await Item.findById(itemId);
    if (!item) return res.status(404).json({ message: 'Item not found' });

    if (type === 'OUT' && item.quantity < quantity) {
      return res.status(400).json({ message: 'Insufficient stock' });
    }

    const newQuantity = type === 'IN'
      ? item.quantity + quantity
      : item.quantity - quantity;

    item.quantity = newQuantity;
    item.lastUpdated = Date.now();
    await item.save();

    const transaction = await Transaction.create({
      item: itemId,
      type,
      quantity,
      note,
      user: req.user._id
    });

    res.status(201).json(transaction);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getItemTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ item: req.params.itemId })
      .populate('user', 'name')
      .sort({ date: -1 });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({})
      .populate('item', 'name sku')
      .populate('user', 'name')
      .sort({ date: -1 });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
