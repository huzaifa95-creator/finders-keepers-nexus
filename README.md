
# FAST-NUCES Lost & Found Portal

A simplified web application for managing lost and found items at FAST-NUCES.

## Getting Started

### Backend Setup

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. The MongoDB connection string is already set up in the .env file.

4. Start the backend server:
   ```
   npm run dev
   ```
   The server will run on http://localhost:5000

### Frontend Setup

1. In a new terminal window, navigate to the project root directory.

2. Install dependencies:
   ```
   npm install
   ```

3. Start the frontend development server:
   ```
   npm run dev
   ```
   The frontend will be available at http://localhost:5173 (or similar port)

## Test Accounts

You can register a new account or use these test accounts:

- **Student Account**:
  - Email: student@nu.edu.pk
  - Password: password123

- **Admin Account**:
  - Email: admin@nu.edu.pk
  - Password: admin123

## Important Notes

This is a simplified version of the application with:
- No JWT authentication (simplified auth)
- MongoDB Atlas connection
- Basic CRUD operations

Both frontend and backend servers need to be running simultaneously.
