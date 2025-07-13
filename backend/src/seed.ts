import dotenv from 'dotenv';
import connectDB from './lib/mongoose';
import User from './models/User';
import Category from './models/Category';
import Product from './models/Product';
import ReferralCode from './models/ReferralCode';

// Load environment variables
dotenv.config();

const seedData = async () => {
  try {
    console.log('🌱 Starting database seeding...');

    // Connect to MongoDB
    await connectDB();

    // Clear existing data
    await User.deleteMany({});
    await Category.deleteMany({});
    await Product.deleteMany({});
    await ReferralCode.deleteMany({});

    // Create admin user
    const adminUser = new User({
      email: 'admin@anonshop.com',
      password: 'admin123',
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
      referralCode: 'ADMIN001',
      phone: '9876543210',
      address: '123 Admin Street',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400001'
    });

    await adminUser.save();
    console.log('✅ Admin user created:', adminUser.email);

    // Create delivery personnel user
    const deliveryUser = new User({
      email: 'delivery@anonshop.com',
      password: 'delivery123',
      firstName: 'John',
      lastName: 'Delivery',
      role: 'DELIVERY',
      referralCode: 'DELIVERY001',
      phone: '9876543211',
      address: '456 Delivery Street',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400002'
    });

    await deliveryUser.save();
    console.log('✅ Delivery user created:', deliveryUser.email);

    // Create categories
    const categories = await Category.create([
      {
        name: 'Electronics',
        description: 'Latest electronic gadgets and devices',
        image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400'
      },
      {
        name: 'Fashion',
        description: 'Trendy fashion items and accessories',
        image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=400'
      },
      {
        name: 'Home & Living',
        description: 'Home decor and lifestyle products',
        image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400'
      },
      {
        name: 'Books',
        description: 'Books across all genres',
        image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400'
      }
    ]);

    console.log('✅ Categories created:', categories.map(c => c.name));

    // Create sample products
    const products = await Product.create([
      // Electronics
      {
        name: 'Wireless Bluetooth Headphones',
        description: 'High-quality wireless headphones with noise cancellation',
        price: 2999.00,
        salePrice: 2499.00,
        images: [
          'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
          'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=400'
        ],
        categoryId: categories[0]._id,
        stock: 50,
        sku: 'ELEC001',
        weight: 0.25,
        dimensions: '{"length": 18, "width": 8, "height": 3}',
        isFeatured: true
      },
      {
        name: 'Smartphone',
        description: 'Latest smartphone with advanced features',
        price: 15999.00,
        salePrice: 13999.00,
        images: [
          'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400',
          'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400'
        ],
        categoryId: categories[0]._id,
        stock: 25,
        sku: 'ELEC002',
        weight: 0.18,
        dimensions: '{"length": 15, "width": 7, "height": 0.8}',
        isFeatured: true
      },
      // Fashion
      {
        name: 'Casual T-Shirt',
        description: 'Comfortable cotton t-shirt for everyday wear',
        price: 599.00,
        salePrice: 499.00,
        images: [
          'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400',
          'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=400'
        ],
        categoryId: categories[1]._id,
        stock: 100,
        sku: 'FASH001',
        weight: 0.15,
        dimensions: '{"length": 28, "width": 20, "height": 1}'
      },
      {
        name: 'Denim Jeans',
        description: 'Classic denim jeans with perfect fit',
        price: 1299.00,
        salePrice: 999.00,
        images: [
          'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400',
          'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400'
        ],
        categoryId: categories[1]._id,
        stock: 75,
        sku: 'FASH002',
        weight: 0.4,
        dimensions: '{"length": 32, "width": 18, "height": 2}'
      },
      // Home & Living
      {
        name: 'Table Lamp',
        description: 'Modern table lamp for your workspace',
        price: 899.00,
        salePrice: 699.00,
        images: [
          'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400',
          'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400'
        ],
        categoryId: categories[2]._id,
        stock: 30,
        sku: 'HOME001',
        weight: 0.8,
        dimensions: '{"length": 15, "width": 15, "height": 45}',
        isFeatured: true
      },
      {
        name: 'Throw Pillow',
        description: 'Soft and comfortable throw pillow',
        price: 399.00,
        salePrice: 299.00,
        images: [
          'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=400',
          'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=400'
        ],
        categoryId: categories[2]._id,
        stock: 60,
        sku: 'HOME002',
        weight: 0.3,
        dimensions: '{"length": 18, "width": 18, "height": 6}'
      },
      // Books
      {
        name: 'The Great Gatsby',
        description: 'Classic novel by F. Scott Fitzgerald',
        price: 299.00,
        salePrice: 249.00,
        images: [
          'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400',
          'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400'
        ],
        categoryId: categories[3]._id,
        stock: 40,
        sku: 'BOOK001',
        weight: 0.2,
        dimensions: '{"length": 20, "width": 13, "height": 2}'
      },
      {
        name: 'Business Strategy Guide',
        description: 'Comprehensive guide to business strategy',
        price: 599.00,
        salePrice: 499.00,
        images: [
          'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400',
          'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400'
        ],
        categoryId: categories[3]._id,
        stock: 35,
        sku: 'BOOK002',
        weight: 0.4,
        dimensions: '{"length": 23, "width": 15, "height": 3}',
        isFeatured: true
      }
    ]);

    console.log('✅ Products created:', products.map(p => p.name));

    // Create a sample referral code for testing
    const referralCode = new ReferralCode({
      code: 'WELCOME2024',
      userId: adminUser._id,
      isActive: true,
      maxUsage: 100,
      expiresAt: new Date('2024-12-31')
    });

    await referralCode.save();
    console.log('✅ Referral code created:', referralCode.code);

    console.log('🎉 Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    process.exit(1);
  }
};

seedData(); 