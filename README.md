# Anon-Shop E-commerce Application

A modern E-commerce platform with referral code requirement for user registration.

## Features

### User Features
- **Referral-based Registration**: Users can only register with a valid referral code
- **Product Catalog**: Browse products with categories and search
- **Shopping Cart**: Add/remove items and manage quantities
- **User Dashboard**: View orders, profile, and referral codes
- **Payment Options**: UPI payment (via QR scanner) or Cash on Delivery (COD)

### Admin Features
- **Product Management**: Add, edit, and manage products
- **Order Management**: View and update order status
- **User Management**: View user details and referral statistics
- **Analytics Dashboard**: Sales and user analytics

## Tech Stack

### Frontend
- React 18 with TypeScript
- Tailwind CSS for styling
- React Router for navigation
- React Query for state management
- Axios for API calls

### Backend
- Node.js with Express
- TypeScript
- MongoDB database
- JWT authentication
- Multer for file uploads

### Database
- MongoDB with Mongoose ODM
- User management
- Product catalog
- Order processing
- Referral system

## Quick Start

### Prerequisites
- Node.js 18+ 
- MongoDB 6+
- npm or yarn

### Installation

1. **Clone and install dependencies:**
   ```bash
   git clone <repository-url>
   cd Anon-Shop
   npm run install:all
   ```

2. **Set up environment variables:**
   ```bash
   cp backend/.env.example backend/.env
   # Edit backend/.env with your database credentials
   ```

3. **Set up database:**
   ```bash
   cd backend
   npm run db:seed
   ```

4. **Start development servers:**
   ```bash
   npm run dev
   ```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Environment Variables

Create a `.env` file in the backend directory:

```env
MONGODB_URI="mongodb://localhost:27017/anon_shop"
JWT_SECRET="your-jwt-secret-key"
PORT=5000
NODE_ENV=development
```

## Database Schema

The application uses the following main entities:
- Users (with referral tracking)
- Products and Categories
- Orders and OrderItems
- ReferralCodes

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register with referral code
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product details
- `POST /api/products` - Create product (admin)
- `PUT /api/products/:id` - Update product (admin)

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders` - Get user orders
- `GET /api/orders/:id` - Get order details
- `PUT /api/orders/:id/status` - Update order status (admin)

### Referrals
- `GET /api/referrals/code` - Get user's referral code
- `GET /api/referrals/stats` - Get referral statistics

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License 