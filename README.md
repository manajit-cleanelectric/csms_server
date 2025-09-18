# CSMS Server - Charging Station Management System

[![Node.js](https://img.shields.io/badge/Node.js-22.19.0-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue.svg)](https://www.typescriptlang.org/)
[![Express.js](https://img.shields.io/badge/Express.js-5.1.0-lightgrey.svg)](https://expressjs.com/)
[![OCPP](https://img.shields.io/badge/OCPP-1.6.-orange.svg)](https://www.openchargealliance.org/)

A comprehensive Charging Station Management System (CSMS) server implementation featuring OCPP (Open Charge Point Protocol) support, user management, payment processing, and real-time charging session monitoring.

## 🚀 Features

### Core Functionality
- **OCPP Protocol Support** - Partial OCPP 1.6/ implementation via WebSocket
- **User Management** - Registration, authentication, and profile management
- **Charging Sessions** - Complete session lifecycle management
- **Payment Processing** - Integrated with Razorpay payment gateway
- **Wallet System** - User balance management with double-entry ledger
- **Vehicle Management** - Vehicle registration with RC document upload
- **Real-time Monitoring** - Live charger status and session tracking

### Technical Features
- **Event-Driven Architecture** - Kafka-based messaging system
- **Rate Limiting** - Redis-powered API protection
- **File Upload** - Secure image handling with Sharp processing
- **Background Workers** - Asynchronous task processing
- **Comprehensive Logging** - Structured logging with Pino
- **Database ORM** - TypeORM with PostgreSQL
- **JWT Authentication** - Secure token-based authentication
- **SMS/Email Notifications** - Multi-channel communication

## 📋 Prerequisites

- **Node.js** >= 22.19.0
- **PostgreSQL** >= 12.0
- **Redis** >= 6.0
- **Kafka** >= 2.8.0 (optional, for event streaming)
- **npm** or **yarn** package manager

## 🛠️ Installation

### 1. Clone the Repository
```bash
git clone <repository-url>
cd csms_server
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Copy the environment template and configure your settings:

```bash
cp .env.example .env
```

#### Required Environment Variables
```env
# Database Configuration
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=csms_db
DATABASE_USERNAME=your_db_user
DATABASE_PASSWORD=your_db_password

# Server Configuration
SERVER_HOST=localhost
SERVER_PORT=3000

# JWT Configuration
JWT_SECRET_KEY=your_jwt_secret_key
REFRESH_TOKEN_SECRET_KEY=your_refresh_token_secret

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password

# Rate Limiting
RATE_LIMITER_WINDOW_SIZE=60000
RATE_LIMITER_LIMIT=100

# File Storage
STATIC_FOLDER=public
MEDIA_FOLDER=media
RC_IMAGE_FOLDER=rc_image

# SMS Service
SMS_SERVICE_PROVIDER_URL=your_sms_provider_url
SMS_SERVICE_PROVIDER_API_KEY=your_sms_api_key

# Payment Gateway (Razorpay)
RAZORPAY_API_KEY_ID=your_razorpay_key_id
RAZORPAY_API_KEY_SECRET=your_razorpay_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret

# Miscellaneous
OTP_LENGTH=6
```

### 4. Database Setup
```bash
# Create database
createdb csms_db

# Run migrations (if available)
npm run migration:run
```

### 5. Start the Application

#### Development Mode
```bash
npm start
```

#### Production Mode
```bash
npm run build
npm run start:prod
```

## 🏗️ Project Structure

```
src/
├── controllers/          # API endpoint handlers
├── models/              # TypeORM entity definitions
├── routes/              # Express route definitions
├── services/            # Business logic and integrations
├── middleware/          # Custom middleware functions
├── kafka/               # Kafka message broker setup
├── ocpp/               # OCPP protocol implementation
├── database/           # Database configuration
├── utils/              # Utility functions
├── errors/             # Custom error classes
└── tests/              # Test files
```

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/send-otp` - Send OTP for phone verification
- `POST /api/auth/verify-otp` - Verify OTP and authenticate
- `POST /api/auth/refresh-token` - Refresh access token

### User Management
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update user profile
- `POST /api/user/complete-profile` - Complete user registration

### Charging Sessions
- `POST /api/session/start` - Start charging session
- `POST /api/session/stop` - Stop charging session
- `GET /api/session/active` - Get active session
- `GET /api/session/history` - Get session history

### Wallet Operations
- `GET /api/wallet/balance` - Get wallet balance
- `POST /api/wallet/add-money` - Add money to wallet
- `GET /api/wallet/transactions` - Get transaction history

### Vehicle Management
- `POST /api/vehicle/register` - Register new vehicle
- `GET /api/vehicle/list` - Get user vehicles
- `POST /api/vehicle/upload-rc` - Upload RC document

### Payment Processing
- `POST /api/payment/create-order` - Create payment order
- `POST /api/payment/verify` - Verify payment
- `POST /api/payment/webhook` - Handle payment webhooks

### Charger Management
- `GET /api/charger/status/:chargerId` - Get charger status
- `GET /api/charger/list` - Get available chargers
- `POST /api/charger/register` - Register new charger (Admin)

## 🔧 Development

### Running Tests
```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- user.controller.test.ts
```

### Code Quality
```bash
# Lint code
npm run lint

# Format code
npm run format

# Type checking
npm run type-check
```

[//]: # (### Database Operations)

[//]: # (```bash)

[//]: # (# Generate migration)

[//]: # (npm run migration:generate -- -n MigrationName)

[//]: # ()
[//]: # (# Run migrations)

[//]: # (npm run migration:run)

[//]: # ()
[//]: # (# Revert migration)

[//]: # (npm run migration:revert)

[//]: # (```)

### Documentation
```bash
# Generate API documentation
npm run docs

# Serve documentation locally
npm run docs:serve
```

## 🐳 Docker Support

### Using Docker Compose
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Docker Environment
The application includes:
- **PostgreSQL** database
- **Redis** cache
- **Kafka** message broker (optional)
- **Application** server

## 🔒 Security Features

- **JWT Authentication** with refresh token rotation
- **Rate Limiting** with Redis-based storage
- **Input Validation** and sanitization
- **CORS** protection
- **Helmet** security headers
- **File Upload** validation and virus scanning
- **SQL Injection** prevention via TypeORM
- **XSS Protection** through input sanitization

## 📊 Monitoring & Logging

### Logging
- **Structured Logging** with Pino
- **Log Levels** (error, warn, info, debug)
- **Request/Response** logging
- **Performance Metrics** tracking

[//]: # (### Health Checks)

[//]: # (- `GET /health` - Application health status)

[//]: # (- `GET /health/db` - Database connectivity)

[//]: # (- `GET /health/redis` - Redis connectivity)

## 🚀 Deployment

### Environment Setup
1. Configure production environment variables
2. Set up PostgreSQL database
3. Configure Redis instance
4. Set up Kafka cluster (if using)
5. Configure SSL certificates
6. Set up monitoring and logging

### Production Checklist
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] SSL certificates installed
- [ ] Monitoring setup
- [ ] Backup strategy implemented
- [ ] Load balancer configured
- [ ] CDN setup for static files

## 🤝 Contributing

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Write comprehensive JSDoc comments
- Include unit tests for new features
- Follow conventional commit messages
- Update documentation as needed

[//]: # (## 📝 License)

[//]: # ()
[//]: # (This project is licensed under the MIT License - see the [LICENSE]&#40;LICENSE&#41; file for details.)

## 🆘 Support

### Documentation
- [Full API Documentation](./docs/index.html) - Generated TypeDoc documentation
- [Development Guide](./DOCUMENTATION.md) - Comprehensive development guide

[//]: # (### Issues)

[//]: # (If you encounter any issues, please:)

[//]: # (1. Check existing [GitHub Issues]&#40;issues-url&#41;)

[//]: # (2. Create a new issue with detailed information)

[//]: # (3. Include error logs and reproduction steps)

[//]: # (### Contact)

[//]: # (- **Author**: Achyut Salunkhe)

[//]: # (- **Email**: [your-email@example.com])

[//]: # (- **Project Repository**: [repository-url])

## 🎯 Roadmap

### Current Version (1.0.0)
- ✅ Basic OCPP implementation
- ✅ User management system
- ✅ Payment processing
- ✅ Charging session management

### Upcoming Features
- 🔄 OCPP 2.0.1 full compliance
- 🔄 Advanced analytics dashboard
- 🔄 Multi-tenant support
- 🔄 Mobile app integration
- 🔄 Smart charging algorithms
- 🔄 Grid integration features

---

**Made with ❤️ for the EV charging ecosystem**
