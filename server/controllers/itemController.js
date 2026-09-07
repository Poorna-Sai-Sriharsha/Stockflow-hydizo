const Item = require('../models/Item');
const Transaction = require('../models/Transaction');
const Category = require('../models/Category');
const fs = require('fs');
const csv = require('csv-parser');
const { Parser } = require('json2csv');

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

exports.importItems = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const results = [];
    const filePath = req.file.path;

    await new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', resolve)
        .on('error', reject);
    });

    // Clean up the uploaded file immediately
    fs.unlinkSync(filePath);

    let importedCount = 0;
    for (const row of results) {
      try {
        // Resolve category
        let category = await Category.findOne({ name: row.category });
        if (!category) {
          category = await Category.create({ name: row.category || 'Uncategorized' });
        }

        const item = await Item.create({
          name: row.name,
          sku: row.sku,
          category: category._id,
          quantity: parseInt(row.quantity) || 0,
          unitPrice: parseFloat(row.unitPrice) || 0,
          supplier: row.supplier,
          reorderThreshold: parseInt(row.reorderThreshold) || 10,
        });

        await Transaction.create({
          item: item._id,
          type: 'IN',
          quantity: item.quantity,
          note: 'Imported from CSV',
          user: req.user._id,
        });

        importedCount++;
      } catch (err) {
        console.error(`Error importing row ${row.name}:`, err);
      }
    }

    res.status(201).json({ message: `Successfully imported ${importedCount} items` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.exportItems = async (req, res) => {
  try {
    const items = await Item.find().populate('category');

    const data = items.map(item => ({
      SKU: item.sku,
      Name: item.name,
      Category: item.category?.name || 'N/A',
      Quantity: item.quantity,
      UnitPrice: item.unitPrice,
      Supplier: item.supplier,
      Threshold: item.reorderThreshold,
    }));

    const json2csvParser = new Parser();
    const csv = json2csvParser.parse(data);

    res.header('Content-Type', 'text/csv');
    res.attachment('inventory_audit.csv');
    return res.send(csv);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
