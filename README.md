# SafeVoice: Student Welfare Reporting System

A secure, privacy-first platform for students to confidentially report welfare concerns and for welfare administrators to track and respond to issues.

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Key Features](#key-features)
3. [Architecture](#architecture)
4. [Tech Stack](#tech-stack)
5. [Project Structure](#project-structure)
6. [Frontend](#frontend)
7. [Backend](#backend)
8. [Data Flow](#data-flow)
9. [Setup & Installation](#setup--installation)
10. [Running the Application](#running-the-application)
11. [API Endpoints](#api-endpoints)
12. [Privacy & Security](#privacy--security)

---

## System Overview

**SafeVoice** is a full-stack web application designed to help university students (specifically Mzuni) report welfare concerns (mental health, harassment, financial difficulties, etc.) while maintaining privacy and anonymity.

### Users

- **Students**: Create accounts with Mzuni email (@mzuni.ac.mw), submit reports confidentially, track report status, manage profile
- **Administrators**: View all reports, assign welfare officers, update report status, add internal notes, view metrics

### Core Promise

- **Student Privacy First**: Auto-generated Student IDs (format: `SV-XXXXXXXX`) instead of personal information
- **Optional Anonymity**: Students can choose anonymous or non-anonymous reporting; admins never see personal email/name
- **Data Security**: Reports stored locally (student side) and in database (admin side)

---

## Key Features

### 1. Student Authentication & Dashboard
- Sign up with Mzuni email (validation: `@mzuni.ac.mw` domain required)
- Unique auto-generated Student ID on account creation
- Login with email and password (client-side auth, localStorage-backed)
- Dashboard with tabbed interface:
  - **Overview**: Report statistics (total, open, in progress, resolved)
  - **Submit Report**: Form to report concerns with category selection, optional GPS location capture
  - **My Reports**: View submitted reports and their status
  - **Profile**: Update name, email, password

### 2. Report Submission
- **Categories**: Mental Health, Academic Stress, Financial Difficulties, Harassment, Bullying, Abuse, Housing, Health, Discrimination, Safety, Other
- **Report Types**: Anonymous or Non-Anonymous
- **Urgency Auto-Detection**: Based on category (e.g., Abuse/Harassment = High, Mental Health = Medium)
- **Optional GPS Location**: Capture and submit current geolocation with both anonymous and non-anonymous reports
- **Privacy Notes**: Clear messaging about what data is and isn't stored

### 3. Admin Dashboard
- **Report List**: View all submitted reports with filtering/search
- **Report Details**: Full report view with:
  - Student ID only (no personal data)
  - GPS coordinates with "View on map" link (if captured)
  - Category, urgency, status, report text
  - Submission type (Anonymous/Non-Anonymous)
  - Internal notes section (for welfare team communication)
  - Audit log (track all actions on the report)
- **Status Management**: Change report status (New → Under Review → In Progress → Resolved/Escalated)
- **Assignment**: Assign welfare officer to report
- **Metrics View**: System dashboard showing:
  - Total reports by status
  - Report distribution by category and severity
  - ML model health and performance

### 4. ML Model Integration
- **Urgency Prediction**: Machine Learning model predicts report severity
- **Categories**: Maps student-friendly categories to backend categories
- **Health Monitoring**: API tracks model status and prediction accuracy

---

## Architecture

```
┌─────────────────────────────────────────┐
│           Student Browser               │
│  ┌──────────────────────────────────┐   │
│  │   React Frontend (Vite)          │   │
│  │  - Student Auth (localStorage)   │   │
│  │  - Report Form & Dashboard       │   │
│  │  - Tabs & UI Components          │   │
│  └──────────────────────────────────┘   │
└─────────────────────┬───────────────────┘
                      │ HTTP/REST
┌─────────────────────┴───────────────────┐
│         FastAPI Backend                 │
│  ┌──────────────────────────────────┐   │
│  │  API Routes (v1)                 │   │
│  │  - /api/v1/reports (CRUD)        │   │
│  │  - /api/v1/ml/predict            │   │
│  │  - /api/v1/system/status         │   │
│  ├──────────────────────────────────┤   │
│  │  SQLModel / SQLAlchemy           │   │
│  │  (Database ORM)                  │   │
│  └──────────────────────────────────┘   │
└─────────────────────┬───────────────────┘
                      │ Database I/O
┌─────────────────────┴───────────────────┐
│         SQLite Database                 │
│  - Reports Table (all submissions)      │
│  - Stores: ID, category, text, status   │
│    location, studentId, audit log, etc. │
└─────────────────────────────────────────┘
```

---

## Tech Stack

### Frontend
- **Framework**: React 19 with TypeScript
- **Routing**: TanStack Router (file-based auto-routing)
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI (accessible primitives)
- **Forms**: React Hook Form + Zod
- **Notifications**: Sonner (toast notifications)
- **State Management**: React hooks + localStorage (reports mirror)
- **HTTP Client**: Custom API service

### Backend
- **Framework**: FastAPI (Python 3.14)
- **Database**: SQLite with SQLModel/SQLAlchemy ORM
- **ML**: Python ML model (in `backend/ml.py`)
- **CORS**: Enabled for frontend communication

---

## Project Structure

```
Safe_voice/
├── src/                              # Frontend React app
│   ├── main.tsx                      # App entry point
│   ├── router.tsx                    # TanStack Router config
│   ├── routeTree.gen.ts              # Auto-generated route tree
│   ├── components/
│   │   ├── site-layout.tsx           # Header, footer, layout wrapper
│   │   ├── badges.tsx                # Status/urgency badges
│   │   ├── ui/                       # Radix UI components
│   │   │   ├── tabs.tsx              # Tab primitives
│   │   │   ├── button.tsx, input.tsx, etc.
│   ├── hooks/
│   │   └── use-mobile.tsx            # Mobile detection hook
│   ├── lib/
│   │   ├── student-auth.ts           # Student auth logic
│   │   ├── reports-store.ts          # Reports state & persistence
│   │   ├── api/
│   │   │   └── backend.ts            # FastAPI client
│   │   ├── reports/
│   │   │   └── types.ts              # Report interface & types
│   ├── routes/
│   │   ├── __root.tsx                # Root layout
│   │   ├── index.tsx                 # Homepage
│   │   ├── student.tsx               # Student auth & dashboard
│   │   ├── admin.tsx                 # Admin layout
│   │   ├── admin.reports.index.tsx   # Admin reports list
│   │   ├── admin.reports.$id.tsx     # Admin report detail
│   │   ├── admin.analytics.tsx       # Metrics dashboard
│   ├── styles/                       # Global styles
│
├── backend/                          # FastAPI backend
│   ├── main.py                       # API endpoints & middleware
│   ├── models.py                     # SQLModel data models
│   ├── ml.py                         # ML model loading & prediction
│   ├── __init__.py
│
├── ML_model/                         # ML model files
│   └── [model files]
│
├── public/                           # Static assets
├── package.json                      # Frontend dependencies
├── vite.config.ts                    # Vite build config
├── tsconfig.json                     # TypeScript config
├── tailwind.config.js                # Tailwind CSS config
└── README.md                         # This file
```

---

## Frontend

### Key Files

#### `src/lib/student-auth.ts`
**Purpose**: Student authentication logic (client-side)

**Functions**:
- `generateStudentId()`: Creates unique `SV-XXXXXXXX` ID
- `signUpStudent(email, password, fullName)`: Creates new student account
- `signInStudent(email, password)`: Authenticates existing student
- `updateStudentProfile()`: Allows profile updates
- `validateMzuniEmail()`: Validates `@mzuni.ac.mw` domain
- `getCurrentStudent()`: Retrieves stored session

**Storage**: localStorage (`student_auth` key)

---

#### `src/lib/reports-store.ts`
**Purpose**: Report state management and persistence

**Functions**:
- `useReports()`: Hook to access all reports (returns array)
- `addReport(report)`: Create new report (adds to store + backend sync)
- `setStatus(id, status)`: Update report status
- `addNote(id, note)`: Add internal note
- `assign(id, officer)`: Assign welfare officer
- `deleteReport(id)`: Remove report

**Storage**: localStorage + syncs to backend when possible

---

#### `src/routes/student.tsx`
**Purpose**: Student landing page and authenticated dashboard

**Components**:
- **Landing Page** (unauthenticated):
  - Signup/signin forms
  - Email validation, password requirements
  - Privacy messaging about auto-generated IDs
  
- **Dashboard** (authenticated):
  - Tabbed interface (Overview, Submit, My Reports, Profile)
  - Stat cards showing report metrics
  - Report submission form with:
    - Category dropdown
    - Report type selection (Anonymous/Non-Anonymous)
    - Text description (min 20 chars)
    - Preferred contact method
    - **GPS location capture** (optional)
  - Recent reports list
  - Profile editor

**Location Feature**:
- Button triggers `navigator.geolocation.getCurrentPosition()`
- Displays latitude/longitude
- Can clear before submit
- Stored as `locationLat` and `locationLng` in report

---

#### `src/routes/admin.reports.$id.tsx`
**Purpose**: Admin detail view for individual reports

**Sections**:
- Report content (category, text)
- **Submission details**: Type, incident date, location, **GPS coordinates with map link**
- **Student identity**: Only shows auto-generated Student ID (not name/email)
- Status management (dropdown to change)
- Welfare officer assignment
- Internal notes (for team communication)
- Audit log (all actions)
- Delete with confirmation

**Location Display**:
- Shows GPS coordinates if captured
- "View on map →" link opens Google Maps at the location

---

### Components

#### `src/components/site-layout.tsx`
- **PublicLayout**: Wrapper for public pages (homepage, student landing)
  - Optional `heroHeader` prop: when true, hides site header (used for authenticated student dashboard)
- **PageIntro**: Section intro with title and description

#### `src/components/badges.tsx`
- **StatusBadge**: Visual badge for report status
- **UrgencyBadge**: Visual badge for urgency level

#### `src/components/ui/tabs.tsx`
- Radix UI Tabs primitive wrapper
- Used for student dashboard tabs (Overview, Submit, My Reports, Profile)

---

## Backend

### Key Files

#### `backend/main.py`
**Purpose**: FastAPI application and REST endpoints

**Endpoints**:

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/` | API root |
| GET | `/health` | Health check (DB + model status) |
| GET | `/api/v1/system/status` | Full system status with endpoints list |
| GET | `/api/v1/reports` | List all reports (with optional filters) |
| POST | `/api/v1/reports` | Create new report |
| DELETE | `/api/v1/reports/{report_id}` | Delete specific report |
| DELETE | `/api/v1/reports` | Clear all reports |
| POST | `/api/v1/ml/predict` | Predict urgency for text |
| GET | `/api/v1/metrics` | Report metrics (dashboard data) |

**CORS**: Enabled for all origins (`*`)

---

#### `backend/models.py`
**Purpose**: SQLModel data models for ORM

**Report Model**:
```python
class Report(SQLModel, table=True):
    id: str
    created_at: str
    category: str
    text: str
    reporting_type: str  # "Anonymous" | "Non-Anonymous"
    incident_date: Optional[str]
    incident_location: Optional[str]
    location_lat: Optional[float]      # GPS latitude
    location_lng: Optional[float]      # GPS longitude
    urgency: str                       # "Critical" | "High" | "Medium" | "Low"
    status: str                        # "New" | "Under Review" | "In Progress" | "Resolved" | "Escalated"
    notes: list[dict]                  # Internal notes
    assigned_to: Optional[str]         # Welfare officer name
    student_id: Optional[str]          # Auto-generated student ID (not personal info)
    audit_log: list[dict]              # Action history
```

---

#### `backend/ml.py`
**Purpose**: Machine Learning model for urgency prediction

**Functions**:
- `load_model()`: Load trained model from disk
- `predict_severity(text)`: Predict urgency from report text
- `verify_model_prediction()`: Test model health
- `get_model_info()`: Return model metadata

**Categories Mapping**:
- Student categories → Backend ML categories:
  - Mental Health, Academic Stress → "Mental & Academic Well-being"
  - Financial, Housing → "Economic & Housing Support"
  - Abuse, Harassment, Bullying, Safety → "Safety, Abuse & Harassment"
  - Discrimination → "Discrimination & Social Inclusion"

---

## Data Flow

### 1. Student Signup Flow
```
1. Student enters email, password, name on landing
2. Frontend validates Mzuni email (@mzuni.ac.mw)
3. signUpStudent() generates unique Student ID (SV-XXXXXXXX)
4. Stores account in localStorage
5. Redirects to dashboard (authenticated state)
```

### 2. Report Submission Flow
```
1. Student fills form (category, description, optional GPS location)
2. Frontend validates (min 20 chars, category selected)
3. Report object created with:
   - studentId (auto-generated, not personal email)
   - GPS coords (if captured)
   - reportingType (Anonymous/Non-Anonymous)
4. addReport() called:
   - Adds to local reports store (localStorage)
   - POST to /api/v1/reports (syncs to backend DB)
5. Toast success message
6. Form clears, report appears in "My Reports" tab
```

### 3. Admin View Report Flow
```
1. Admin views reports list (/admin/reports)
2. Clicks report → navigates to detail page (/admin/reports/$id)
3. Backend returns report with:
   - studentId only (NOT personal email/name)
   - GPS coordinates (if submitted)
   - Category, text, status, urgency
4. Admin can:
   - Change status
   - Assign welfare officer
   - Add internal notes
   - View audit log
   - If GPS coords exist: click "View on map" → Google Maps link
```

### 4. Location Capture Flow
```
1. Student clicks "Get current location" button
2. Browser requests geolocation permission
3. If granted:
   - Captures latitude/longitude
   - Displays on form (format: XX.XXXXXX, YY.YYYYYY)
4. Student can:
   - Submit report with location
   - Clear location before submit
5. On submit:
   - locationLat & locationLng added to report
6. Admin sees GPS coords with map link
```

---

## Setup & Installation

### Prerequisites
- **Node.js** 18+ (for frontend)
- **Python 3.14** (for backend)
- **npm** or **bun** (package manager)

### Frontend Setup

```bash
# Navigate to project root
cd Safe_voice

# Install dependencies
npm install

# Optional: Install specific packages if needed
npm install --save-dev vite tailwindcss @tailwindcss/vite
npm install @tanstack/react-router @radix-ui/react-tabs
npm install sonner date-fns
```

### Backend Setup

```bash
# Navigate to project root
cd Safe_voice

# Create Python virtual environment (optional but recommended)
python -m venv venv
source venv/Scripts/activate  # Windows: venv\Scripts\activate

# Install Python dependencies
pip install fastapi uvicorn[standard] sqlmodel sqlalchemy python-jose passlib[bcrypt] joblib pydantic python-multipart
```

---

## Running the Application

### Start Backend (FastAPI)

```bash
# From project root, with Python env activated
python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload

# Or use the pre-configured task
npm run start-fastapi  # (if task exists)
```

Backend runs on `http://127.0.0.1:8000`

### Start Frontend (Vite)

```bash
# From project root, in a new terminal
npm run dev

# Vite will output the dev URL (typically http://localhost:5173)
```

### Verify Setup

**Backend Health**:
```bash
curl http://127.0.0.1:8000/health
```

**Frontend**: Open browser to `http://localhost:5173`

---

## API Endpoints

### Health & Status

```http
GET /health
Response: {
  "status": "ok",
  "uptime_seconds": 120,
  "database": { "status": "connected", "report_count": 5 },
  "model": { "status": "ready", "loaded": true }
}
```

```http
GET /api/v1/system/status
Response: Detailed system info with endpoints list
```

### Reports

```http
GET /api/v1/reports
Response: [
  {
    "id": "report-123",
    "student_id": "SV-ABC12345",
    "category": "Mental Health",
    "text": "...",
    "location_lat": 37.7749,
    "location_lng": -122.4194,
    "status": "New",
    "urgency": "High"
  }
]

POST /api/v1/reports
Body: {
  "category": "Mental Health",
  "text": "I'm struggling with stress",
  "reporting_type": "Anonymous",
  "location_lat": 37.7749,
  "location_lng": -122.4194
}
Response: Created report object

DELETE /api/v1/reports/{report_id}
Response: { "success": true }
```

### ML Prediction

```http
POST /api/v1/ml/predict
Body: { "text": "I'm experiencing harassment" }
Response: {
  "severity": "High",
  "confidence": 0.92,
  "category": "Safety, Abuse & Harassment"
}
```

---

## Privacy & Security

### Student Privacy

1. **No Personal Data in Admin View**:
   - Admins see only `student_id` (e.g., `SV-ABC12345`)
   - NOT personal name, email, or phone
   - Privacy policy displayed to students

2. **Anonymous Reporting**:
   - Students choose "Anonymous" or "Non-Anonymous"
   - Both types store only `student_id` (no personal data either way)
   - Preferred contact info NOT stored in report

3. **Location Privacy**:
   - GPS capture is optional
   - Works for both anonymous and non-anonymous reports
   - Only coordinates stored (not address resolution)
   - Visible to admin in detail view

### Security Measures

1. **Client-Side Auth**: Password hashing using bcrypt (if enhanced with backend)
2. **CORS**: Currently open (`*`) — should be restricted in production
3. **Email Validation**: Mzuni domain enforcement (`@mzuni.ac.mw`)
4. **Input Validation**: Min character limits, category whitelist
5. **Data Persistence**: SQLite DB + localStorage backup

### Recommendations for Production

- [ ] Implement server-side authentication (JWT tokens)
- [ ] Restrict CORS to known frontend origin
- [ ] Use HTTPS only
- [ ] Add rate limiting on API endpoints
- [ ] Implement database encryption
- [ ] Add two-factor authentication option
- [ ] Regular security audits

---

## Development Workflow

### Adding a New Report Category

1. Update `categories` array in `src/routes/student.tsx`
2. Update `CATEGORY_ALIASES` in `backend/main.py` (map to ML category)
3. Update Report type if needed in `src/lib/reports/types.ts`

### Adding Admin Functionality

1. Create new route in `src/routes/admin.*.tsx`
2. Add navigation link in admin layout
3. Connect to reports-store hooks
4. Call backend API endpoints as needed

### Modifying Report Fields

1. Update `Report` interface in `src/lib/reports/types.ts`
2. Update `Report` SQLModel in `backend/models.py`
3. Update form in `src/routes/student.tsx`
4. Update detail view in `src/routes/admin.reports.$id.tsx`

---

## Troubleshooting

### Backend won't start
- Ensure Python 3.14 is installed: `python --version`
- Check dependencies: `pip list | grep fastapi`
- Verify port 8000 is free: `netstat -ano | findstr :8000`

### Frontend won't compile
- Clear node_modules: `rm -rf node_modules && npm install`
- Clear Vite cache: `rm -rf .vite`
- Check Node version: `node --version` (should be 18+)

### Reports not persisting
- Check localStorage is enabled in browser
- Check backend is running and reachable
- Check browser console for API errors
- Verify CORS is not blocking requests

### Location not capturing
- Check browser permissions (Settings → Privacy)
- Ensure running over HTTPS or localhost
- Test with a different browser
- Check browser console for geolocation errors

---

## Future Enhancements

- [ ] Multi-language support (esp. local languages)
- [ ] SMS/WhatsApp integration for notifications
- [ ] Email reports to welfare officers
- [ ] Advanced analytics & trends
- [ ] Mobile app (React Native)
- [ ] Video/image attachments
- [ ] Real-time notifications for admins
- [ ] Report templates for common scenarios
- [ ] Peer support features
- [ ] Integration with campus counseling services

---

## Team Notes

### For Code Review

Please focus on:
1. **Privacy**: Verify no personal data leaks to admin view
2. **Data Validation**: Check frontend & backend validation consistency
3. **Error Handling**: Test network failures, invalid inputs
4. **UI/UX**: Dashboard navigation and tab usability
5. **Performance**: Location capture and report submission latency

### Contact & Support

- **Frontend Issues**: Check `src/routes` and `src/lib`
- **Backend Issues**: Check `backend/main.py` and `backend/models.py`
- **Database Issues**: SQLite stored in backend (check `DATABASE_PATH` in `backend/models.py`)
- **ML Issues**: Check `backend/ml.py` and model file path

---

**Last Updated**: June 22, 2026  
**Version**: 1.0.0  
**Status**: Active Development
