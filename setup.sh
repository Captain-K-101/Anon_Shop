#!/bin/bash

echo "🚀 Setting up Anon Shop E-commerce Application..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Node.js and npm are installed"

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install

# Create uploads directory
mkdir -p uploads

# Copy environment file
if [ ! -f .env ]; then
    cp env.example .env
    echo "📝 Created .env file. Please update it with your database credentials."
fi

cd ..

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd frontend
npm install

cd ..

echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Update backend/.env with your MongoDB URI"
echo "2. Make sure MongoDB is running"
echo "3. Seed the database: cd backend && npm run db:seed"
echo "4. Start the development servers: npm run dev"
echo ""
echo "🔗 The application will be available at:"
echo "   Frontend: http://64.227.163.71:3002"
echo "   Backend API: http://64.227.163.71:5002"
echo ""
echo "👤 Default admin credentials:"
echo "   Email: admin@anonshop.com"
echo "   Password: admin123"
echo ""
echo "🔑 Test referral code: WELCOME2024" 