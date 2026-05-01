const bcrypt = require('bcryptjs');
const Company = require('../models/Company');
const User = require('../models/User');
const Expense = require('../models/Expense');

const sampleUsers = [
  { email: 'admin@expense.com', role: 'Admin' },
  { email: 'manager@expense.com', role: 'Manager', isManagerApprover: true },
  { email: 'employee@expense.com', role: 'Employee' },
];

const seedSampleData = async () => {
  if (process.env.SEED_SAMPLE_DATA === 'false') return;

  const existingAdmin = await User.findOne({ email: 'admin@expense.com' });
  if (existingAdmin) return;

  const company = await Company.create({
    name: 'Expense Management Corp',
    currency: 'USD',
  });

  const hashedPassword = await bcrypt.hash('password123', 10);
  const users = {};

  for (const sampleUser of sampleUsers) {
    users[sampleUser.role] = await User.create({
      ...sampleUser,
      password: hashedPassword,
      company: company._id,
    });
  }

  users.Employee.manager = users.Manager._id;
  await users.Employee.save();

  await Expense.insertMany([
    {
      description: 'Business lunch with client',
      category: 'Meals',
      amount: 45.5,
      date: new Date('2026-04-15'),
      status: 'approved',
      submittedBy: users.Employee._id,
      reviewedBy: users.Manager._id,
      reviewedAt: new Date('2026-04-16'),
      comments: 'Client meeting at downtown restaurant',
      company: company._id,
    },
    {
      description: 'Taxi to airport',
      category: 'Transportation',
      amount: 25,
      date: new Date('2026-04-18'),
      status: 'pending',
      approvalLevel: 'manager',
      submittedBy: users.Employee._id,
      company: company._id,
    },
    {
      description: 'Office supplies',
      category: 'Office Supplies',
      amount: 120.75,
      date: new Date('2026-04-20'),
      status: 'rejected',
      submittedBy: users.Employee._id,
      reviewedBy: users.Manager._id,
      reviewedAt: new Date('2026-04-21'),
      approvalComment: 'Personal items are not covered',
      company: company._id,
    },
  ]);

  console.log('Sample users and expenses seeded');
};

module.exports = seedSampleData;
