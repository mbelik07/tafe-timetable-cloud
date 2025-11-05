# TAFE Timetable Cloud

Cloud-based TAFE Interactive Timetabling Application with database storage.

## Features

- ✅ Cloud-based data storage
- ✅ Multi-college timetabling
- ✅ Teacher and course management
- ✅ Conflict detection
- ✅ PDF export
- ✅ Real-time synchronization

## Installation

### Prerequisites
- Node.js (v14 or higher)
- npm

### Setup

1. Clone the repository:
```bash
git clone https://github.com/mbelik07/tafe-timetable-cloud.git
cd tafe-timetable-cloud
```

2. Install dependencies:
```bash
npm install
```

3. Start the server:
```bash
npm start
```

The application will be available at `http://localhost:5000`

## API Endpoints

### Get all data
```
GET /api/data
```

### Save all data
```
POST /api/data
Body: { data: {...} }
```

### Get specific semester
```
GET /api/semester/:name
```

### Create new semester
```
POST /api/semester
Body: { name: "Semester 2 2024" }
```

### Delete semester
```
DELETE /api/semester/:name
```

### Health check
```
GET /api/health
```

## Development

For development with auto-reload:
```bash
npm run dev
```

## Database

Data is stored in `data/timetable.json` with automatic backups.

## License

MIT
