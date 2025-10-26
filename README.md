# FluxBit: A Real-Time Collaborative Data Analytics Dashboard

A multi-user analytics platform enabling teams to collaboratively filter, visualize, and annotate business data in real-time.

## Features

- Real-time collaboration with live cursor tracking
- Interactive data visualizations
- Collaborative annotations
- User authentication and authorization
- Dashboard management (CRUD operations)
- WebSocket-based real-time updates

## Tech Stack

### Frontend
- React 18 with TypeScript
- Tailwind CSS for styling
- Zustand for state management
- Recharts for data visualization
- Socket.io-client for real-time communication
- React Router for navigation

### Backend
- Node.js with Express
- TypeScript
- PostgreSQL database
- Socket.io for WebSocket connections
- JWT authentication
- bcrypt for password hashing

## Prerequisites

- Node.js v20.11.0
- npm 10.2.4
- PostgreSQL 14.19
- Git 2.43.0

## Installation

### 1. Clone the repository
```bash
git clone <your-repository-url>
cd collaborative-dashboard
```

### 2. Set up the database
```bash
# Start PostgreSQL
brew services start postgresql@14

# Create database
psql postgres
CREATE DATABASE collaborative_dashboard;
CREATE USER dashboard_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE collaborative_dashboard TO dashboard_user;
\q

# Run migrations
psql -U dashboard_user -d collaborative_dashboard -f database/migrations/001_initial_schema.sql
```

### 3. Set up backend
```bash
cd backend
npm install

# Create .env file
cp .env.example .env
# Edit .env with your configuration
```

### 4. Set up frontend
```bash
cd ../frontend
npm install

# Create .env file
cp .env.example .env
# Edit .env with your configuration
```

## Running the Application

### Development Mode

Open two terminal windows:

Terminal 1 - Backend:
```bash
cd backend
npm run dev
```

Terminal 2 - Frontend:
```bash
cd frontend
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend: http://localhost:5001

## Usage

1. Register a new account at http://localhost:3000/register
2. Create a new dashboard
3. Open the dashboard to see real-time collaboration features
4. Open the same dashboard in multiple browser windows to test real-time features
5. Click "Add Annotation" to enable annotation mode, then click anywhere to add annotations

## Project Structure
```
collaborative-dashboard/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/
│   │   │   ├── dashboard/
│   │   │   ├── charts/
│   │   │   └── collaboration/
│   │   ├── hooks/
│   │   ├── store/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── types/
│   │   └── App.tsx
│   └── package.json
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── utils/
│   │   └── server.ts
│   └── package.json
└── database/
    └── migrations/
```

## API Endpoints

### Authentication
- POST /api/auth/register - Register new user
- POST /api/auth/login - Login user
- POST /api/auth/refresh - Refresh access token
- POST /api/auth/logout - Logout user

### Dashboards
- GET /api/dashboards - Get all dashboards
- GET /api/dashboards/:id - Get specific dashboard
- POST /api/dashboards - Create dashboard
- PUT /api/dashboards/:id - Update dashboard
- DELETE /api/dashboards/:id - Delete dashboard

### Annotations
- GET /api/annotations/:dashboardId - Get dashboard annotations
- POST /api/annotations - Create annotation
- PUT /api/annotations/:id - Update annotation
- DELETE /api/annotations/:id - Delete annotation

## WebSocket Events

- `join:dashboard` - Join dashboard room
- `leave:dashboard` - Leave dashboard room
- `cursor:move` - Broadcast cursor position
- `dashboard:update` - Notify dashboard changes
- `annotation:add` - Notify new annotation
- `user:join` - User joined dashboard
- `user:leave` - User left dashboard

## Troubleshooting

### Backend won't start
- Check if PostgreSQL is running: `brew services list`
- Verify database connection string in .env
- Ensure port 5000 is not in use

### Frontend won't start
- Clear npm cache: `npm cache clean --force`
- Delete node_modules and reinstall: `rm -rf node_modules && npm install`
- Check if port 3000 is available

### Database connection errors
- Verify PostgreSQL is running
- Check database credentials in backend/.env
- Ensure database exists: `psql -l`

### WebSocket connection issues
- Check if backend server is running
- Verify CORS settings in backend/src/server.ts
- Check browser console for connection errors

## Next Steps

### Phase 1: Enhanced Visualizations
- Add more chart types (bar, pie, scatter, heatmap)
- Implement interactive chart controls (zoom, pan, filter)
- Add customizable color schemes

### Phase 2: Data Management
- CSV/Excel file upload
- Direct database connections
- API integration for external data sources
- Data refresh scheduling

### Phase 3: AI Integration
- Natural language query processing
- Automatic insight generation
- Anomaly detection
- Predictive analytics

### Phase 4: Advanced Collaboration
- Comment threads
- @mention notifications
- Activity feed
- Real-time chat sidebar

### Phase 5: Export and Reporting
- PDF/PNG export
- Scheduled email reports
- Branded templates

## Security Considerations

- All API keys stored in environment variables
- Passwords hashed with bcrypt
- JWT tokens with short expiration
- SQL injection prevention with parameterized queries
- CORS configuration
- Rate limiting on API endpoints

## Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## License

MIT License