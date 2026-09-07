const Item = require('../models/Item');
const Transaction = require('../models/Transaction');

exports.getItems = async (req, res) => {
  try {
    const { category, search, sort } = req.query;
    let query = {};

    if (category) query.category = category;
    if (search) query.name = { $regex: search, $options: 'i' };

    let items = await Item.find(query).populate('category');

    if (sort) {
      const [field, order] = sort.split(':');
      items = await Item.find(query).populate('category').sort({ [field]: order === 'desc' ? -1 : 1 });
    } else {
      // Default sort by name
      items = await Item.find(query).populate('category').sort({ name: 1 });
    }

    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createItem = async (req, res) => {
  try {
    const item = await Item.create(req.body);

    // Create an initial "Stock In" transaction for the new item
    await Transaction.create({
      item: item._id,
      type: 'IN',
      quantity: item.quantity,
      note: 'Initial stock on creation',
      user: req.user._id,
    });

    res.status(201).json(item);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getItemById = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id).populate('category');
    if (!item) return res.status(404).json({ message: 'Item not found' });
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateItem = async (req, res) => {
  try {
    const item = await Item.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!item) return res.status(404).json({ message: 'Item not found' });
    res.json(item);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteItem = async (req, res) => {
  try {
    const item = await Item.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });

    // Clean up all transactions associated with this item
    await Transaction.deleteMany({ item: req.params.id });

    res.json({ message: 'Item and its transactions removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getLowStockItems = async (req, res) => {
  try {
    const items = await Item.find({
      $expr: { $lte: ['$quantity', '$reorderThreshold'] }
    }).populate('category');
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
