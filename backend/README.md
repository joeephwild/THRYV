# THRYV Backend API

This is the backend API for THRYV, an AI-powered smart savings, budgeting, and investment app built for Gen Z users, especially undergraduates. The app provides flexible ways to save, invest, budget, and build wealth with an AI CFO (Chief Financial Officer) to guide users through their spending, investments, and savings.

## Features

- **User Authentication**: Secure registration, login, and social authentication
- **Wallet Management**: Track balance, transactions, and connect blockchain wallets
- **Savings Goals**: Create and manage savings goals with progress tracking
- **Emergency Funds**: Build and manage emergency funds
- **Budgeting**: Create and track budgets with spending analysis
- **Investments**: Manage investments with performance tracking and recommendations
- **AI CFO**: Get personalized financial advice and insights

## Tech Stack

- **Node.js**: JavaScript runtime
- **Express**: Web framework
- **TypeScript**: Type-safe JavaScript
- **Prisma**: ORM for database operations
- **PostgreSQL**: Database (configurable via Prisma)
- **JWT**: Authentication tokens

## Project Structure

```
/backend
├── prisma/              # Prisma schema and migrations
├── src/
│   ├── controllers/     # Request handlers
│   ├── middleware/      # Express middleware
│   ├── routes/          # API routes
│   ├── utils/           # Utility functions
│   └── index.ts         # Entry point
├── .env.example         # Example environment variables
├── package.json         # Dependencies and scripts
└── tsconfig.json        # TypeScript configuration
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login
- `POST /api/auth/google` - Google authentication
- `POST /api/auth/apple` - Apple authentication
- `GET /api/auth/verify-email/:token` - Verify email
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password/:token` - Reset password
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout

### User
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `PUT /api/users/profile/image` - Update profile image
- `GET /api/users/settings` - Get user settings
- `PUT /api/users/settings` - Update user settings
- `GET /api/users/notifications` - Get notifications
- `PUT /api/users/notifications/:id/read` - Mark notification as read
- `PUT /api/users/notifications/read-all` - Mark all notifications as read
- `GET /api/users/streak` - Get user streak

### Wallet
- `GET /api/wallet` - Get wallet info
- `GET /api/wallet/transactions` - Get wallet transactions
- `POST /api/wallet/connect` - Connect blockchain wallet
- `DELETE /api/wallet/disconnect` - Disconnect blockchain wallet
- `POST /api/wallet/deposit` - Deposit funds
- `POST /api/wallet/withdraw` - Withdraw funds
- `POST /api/wallet/transfer` - Transfer funds

### Savings
- `GET /api/savings/goals` - Get all savings goals
- `GET /api/savings/goals/:id` - Get a specific savings goal
- `POST /api/savings/goals` - Create a savings goal
- `PUT /api/savings/goals/:id` - Update a savings goal
- `DELETE /api/savings/goals/:id` - Delete a savings goal
- `POST /api/savings/goals/:id/contribute` - Contribute to a savings goal
- `POST /api/savings/goals/:id/withdraw` - Withdraw from a savings goal
- `GET /api/savings/emergency-fund` - Get emergency fund
- `POST /api/savings/emergency-fund` - Create emergency fund
- `PUT /api/savings/emergency-fund` - Update emergency fund
- `POST /api/savings/emergency-fund/contribute` - Contribute to emergency fund
- `POST /api/savings/emergency-fund/withdraw` - Withdraw from emergency fund

### Budget
- `GET /api/budget` - Get all budgets
- `GET /api/budget/:id` - Get a specific budget
- `POST /api/budget` - Create a budget
- `PUT /api/budget/:id` - Update a budget
- `DELETE /api/budget/:id` - Delete a budget
- `GET /api/budget/overview` - Get budget overview
- `GET /api/budget/category-analysis` - Get category analysis
- `GET /api/budget/trends` - Get spending trends
- `GET /api/budget/:id/transactions` - Get budget transactions
- `POST /api/budget/:id/transactions` - Add a transaction to a budget

### Investment
- `GET /api/investment` - Get all investments
- `GET /api/investment/:id` - Get a specific investment
- `POST /api/investment` - Create an investment
- `PUT /api/investment/:id` - Update an investment
- `DELETE /api/investment/:id` - Delete an investment
- `GET /api/investment/performance/:id` - Get investment performance
- `GET /api/investment/portfolio/overview` - Get portfolio overview
- `GET /api/investment/recommendations` - Get investment recommendations
- `POST /api/investment/:id/fund` - Add funds to investment
- `POST /api/investment/:id/withdraw` - Withdraw funds from investment

### AI CFO
- `POST /api/ai/conversation` - Start a new conversation
- `POST /api/ai/conversation/:id/message` - Send a message
- `GET /api/ai/conversation/:id` - Get conversation history
- `GET /api/ai/conversations` - Get all conversations
- `GET /api/ai/insights` - Get financial insights
- `GET /api/ai/recommendations/spending` - Get spending recommendations
- `GET /api/ai/recommendations/saving` - Get saving recommendations
- `GET /api/ai/recommendations/investment` - Get investment recommendations

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- PostgreSQL database

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   cd backend
   npm install
   ```
3. Copy `.env.example` to `.env` and update the variables:
   ```bash
   cp .env.example .env
   ```
4. Generate Prisma client:
   ```bash
   npx prisma generate
   ```
5. Run database migrations:
   ```bash
   npx prisma migrate dev
   ```
6. Start the development server:
   ```bash
   npm run dev
   ```

## Scripts

- `npm run build` - Build the project
- `npm start` - Start the production server
- `npm run dev` - Start the development server
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm test` - Run tests
- `npm run migrate` - Run Prisma migrations
- `npm run prisma:generate` - Generate Prisma client

## Environment Variables

See `.env.example` for required environment variables.

## License

This project is licensed under the MIT License.