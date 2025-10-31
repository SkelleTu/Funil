# Funil - Landing Page and Registration System

## Overview

Funil is a video-based landing page application designed to capture leads through a multi-step funnel process. The application features a video presentation that tracks user engagement, followed by a registration form that collects user information. It includes an administrative dashboard for monitoring visitor analytics and managing registrations.

The system consists of:
- A React-based frontend with TypeScript and Tailwind CSS
- An Express.js backend API
- PostgreSQL database for data persistence
- Comprehensive analytics tracking system
- Admin authentication and dashboard

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Technology Stack:**
- **Framework**: React 18 with TypeScript for type safety
- **Build Tool**: Vite for fast development and optimized production builds
- **Styling**: Tailwind CSS for utility-first responsive design
- **Routing**: React Router DOM v7 for client-side navigation
- **Icons**: Lucide React for consistent iconography

**Page Structure:**
The application uses a multi-page funnel approach:
1. **Landing Page**: Video presentation with progress tracking and engagement monitoring
2. **Registration Page**: Form for capturing user data (name, phone, email)
3. **Confirmation Page**: Post-registration call-to-action with multiple conversion paths
4. **Admin Login**: Secure authentication for administrators
5. **Admin Dashboard**: Analytics and data visualization interface

**State Management:**
- Component-level state using React hooks (useState, useEffect)
- No global state management library (Redux, Context API) currently implemented
- Navigation state managed through URL routing

**Design Rationale:**
- Single-page navigation state in MainApp component allows for smooth transitions without full page reloads
- Separation of admin routes enables independent deployment and security boundaries
- TypeScript provides compile-time type checking to reduce runtime errors

### Backend Architecture

**Technology Stack:**
- **Runtime**: Node.js with ES modules
- **Framework**: Express.js 5 for API routing
- **Database Client**: PostgreSQL via `pg` library
- **Authentication**: JWT tokens with bcrypt for password hashing
- **Security**: CORS middleware, cookie-parser for secure session management

**API Structure:**
The backend exposes RESTful endpoints under `/api`:
- `/api/admin/login` - Admin authentication
- `/api/analytics/*` - Analytics tracking endpoints (implied by frontend code)
- Additional endpoints for visitor tracking, events, and registration data

**Authentication Mechanism:**
- JWT tokens stored in HTTP-only cookies for security
- Middleware-based authentication (`authMiddleware`) protecting admin routes
- Bcrypt hashing (10 salt rounds) for password storage
- Token verification on protected routes

**Server Configuration:**
- Port 3001 for backend API
- CORS configured to allow requests from frontend (localhost:5000 by default)
- Environment-based configuration for production/development
- SSL support for PostgreSQL connections in production

**Design Decisions:**
- JWT in cookies chosen over localStorage for XSS protection
- Separate admin authentication system isolates admin functionality
- Environment variables for sensitive configuration enables secure deployment

### Data Storage

**Database**: PostgreSQL

**Schema Design** (inferred from code):

**Tables:**
1. **admins**
   - email (primary identifier)
   - password_hash (bcrypt hashed)
   - Used for administrative access control

2. **visitors** (analytics tracking)
   - id (primary key)
   - visitor_id (unique identifier from localStorage)
   - first_visit, last_visit (timestamps)
   - ip_address, country, city, region (geolocation)
   - device_type, browser, os (device fingerprinting)
   - referrer, landing_page (traffic source)
   - total_visits, total_time_spent (engagement metrics)

3. **registrations**
   - id (primary key)
   - visitor_id (links to visitors table)
   - email, name, phone (user data)
   - registered_at (timestamp)
   - ip_address, city, country (location at registration)
   - device_type (device used for registration)
   - registration_data (JSON field for additional data)

4. **events** (analytics events)
   - id (primary key)
   - visitor_id (links to visitors table)
   - event_type (categorizes events)
   - event_data (JSON field for event details)
   - page_url (where event occurred)
   - Additional timestamp and metadata fields

**Database Connection:**
- Connection pooling via `pg.Pool` for efficient connection management
- SSL enabled in production environments
- Environment variable configuration (`DATABASE_URL`)

**Data Persistence Strategy:**
- Visitor tracking persists across sessions via localStorage
- Session tracking uses sessionStorage for single-session data
- Database stores all historical analytics and registration data

**Design Rationale:**
- Separate visitors and registrations tables allows tracking anonymous visitors
- JSON fields (registration_data, event_data) provide flexibility for evolving data requirements
- Geolocation and device data enables detailed analytics segmentation

### External Dependencies

**Third-Party Services:**

1. **Supabase** (`@supabase/supabase-js`)
   - Purpose: Database hosting and potential authentication backend
   - Integration: Client library included but implementation not visible in provided code
   - May be used for PostgreSQL hosting or planned future features

**Development Tools:**
- **ESLint**: Code quality and consistency enforcement
- **TypeScript**: Static type checking
- **Vite**: Development server and build optimization
- **Concurrently**: Running frontend and backend servers simultaneously

**Frontend Libraries:**
- **React Router DOM**: Client-side routing
- **Lucide React**: Icon system
- **Tailwind CSS**: Utility-first styling with PostCSS/Autoprefixer

**Backend Libraries:**
- **bcryptjs**: Password hashing
- **jsonwebtoken**: JWT token generation and verification
- **cookie-parser**: Cookie parsing middleware
- **cors**: Cross-origin resource sharing
- **dotenv**: Environment variable management
- **pg**: PostgreSQL client

**Asset Management:**
- Custom alias configuration (`@assets`) points to `attached_assets` directory
- Static images served through Vite's asset pipeline

**Environment Configuration:**
Required environment variables:
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Secret key for JWT signing
- `NODE_ENV`: Environment mode (production/development)
- `ALLOWED_ORIGINS`: CORS allowed origins (comma-separated)
- `PORT`: Server port (defaults to 3001)

**Proxy Configuration:**
- Vite development server proxies `/api` requests to backend (localhost:3001)
- Enables seamless frontend-backend communication during development
- Production deployment requires separate proxy/reverse proxy configuration

## Recent Changes

### Analytics System Implementation (October 31, 2025)

A comprehensive analytics and visitor tracking system has been implemented to monitor all user interactions across the funnel:

**New Features:**
1. **Automatic Visitor Tracking** - Every visitor is assigned a unique ID and tracked across sessions
2. **Event Tracking** - All clicks, scrolls, and user interactions are recorded
3. **Page View Analytics** - Time spent on each page and scroll depth are captured
4. **Registration Tracking** - Full registration data with geolocation and device information
5. **Admin Dashboard** - Secure administrative interface at `/admin/login` with comprehensive analytics

**Database Schema Updates:**
- Added `page_views` table to track detailed page viewing metrics
- All tables properly indexed for performance
- Foreign key relationships ensure data integrity

**Security Enhancements:**
- Admin authentication via JWT tokens in HTTP-only cookies with `sameSite: strict`
- CORS restricted to specific allowed origins
- Bcrypt password hashing for admin accounts
- Protected admin routes with authentication middleware

**Analytics Tracking SDK:**
Location: `src/utils/analytics.ts`
- Automatic initialization on page load
- Tracks visitor metadata (device, browser, OS, location)
- Event queue for reliable data transmission
- Integrates with ipapi.co for geolocation

**Admin Dashboard Features:**
- Real-time statistics (total visitors, events, registrations, page views)
- Visitor details with complete interaction history
- Registration management with geolocation data
- Event stream visualization
- Responsive design for mobile and desktop

**API Endpoints:**
- `POST /api/admin/login` - Admin authentication
- `GET /api/admin/verify` - Verify admin session
- `POST /api/admin/logout` - Logout
- `GET /api/admin/stats` - Dashboard statistics
- `GET /api/admin/visitors` - List all visitors (paginated)
- `GET /api/admin/visitor/:id` - Detailed visitor information
- `GET /api/admin/registrations` - List all registrations (paginated)
- `GET /api/admin/events` - Recent events stream
- `POST /api/analytics/visitor` - Track visitor
- `POST /api/analytics/event` - Track event
- `POST /api/analytics/pageview` - Track page view
- `POST /api/analytics/registration` - Track registration

**Admin Access:**
- URL: `/admin/login`
- Authentication required for all admin routes
- Initial admin created via `scripts/create-admin.js`

**Technical Implementation:**
- Backend runs on port 3001
- Frontend runs on port 5000 with proxy to backend
- Concurrent execution of both servers via `npm run dev`
- Analytics SDK auto-initializes and tracks all interactions passively