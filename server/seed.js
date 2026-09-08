require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Category = require('./models/Category');
const Item = require('./models/Item');
const Transaction = require('./models/Transaction');

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    await User.deleteMany();
    await Category.deleteMany();
    await Item.deleteMany();
    await Transaction.deleteMany();

    const adminUser = await User.create({
      name: 'System Admin',
      email: 'admin@stockflow.com',
      password: 'password123',
      role: 'admin'
    });

    const staffUser = await User.create({
      name: 'Jane Staff',
      email: 'staff@stockflow.com',
      password: 'password123',
      role: 'staff'
    });

    const cat1 = await Category.create({ name: 'Electronics' });
    const cat2 = await Category.create({ name: 'Office Supplies' });
    const cat3 = await Category.create({ name: 'Furniture' });

    await Item.insertMany([
      {
        name: 'Wireless Mouse',
        sku: 'ELEC-001',
        category: cat1._id,
        quantity: 45,
        unitPrice: 25.99,
        supplier: 'TechCorp',
        reorderThreshold: 10
      },
      {
        name: 'Mechanical Keyboard',
        sku: 'ELEC-002',
        category: cat1._id,
        quantity: 8,
        unitPrice: 89.99,
        supplier: 'TechCorp',
        reorderThreshold: 10
      },
      {
        name: 'A4 Paper Ream',
        sku: 'OFFC-001',
        category: cat2._id,
        quantity: 120,
        unitPrice: 5.50,
        supplier: 'PaperWorld',
        reorderThreshold: 20
      },
      {
        name: 'Black Ink Cartridge',
        sku: 'OFFC-002',
        category: cat2._id,
        quantity: 5,
        unitPrice: 45.00,
        supplier: 'PaperWorld',
        reorderThreshold: 10
      },
      {
        name: 'Ergonomic Chair',
        sku: 'FURN-001',
        category: cat3._id,
        quantity: 12,
        unitPrice: 299.00,
        supplier: 'ComfortSeat',
        reorderThreshold: 5
      }
    ]);

    console.log('Database seeded successfully!');
    process.exit();
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDB();
