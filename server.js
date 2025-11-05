const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 5000;
const DB_FILE = path.join(__dirname, 'data', 'timetable.json');

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(express.static('public'));

// Ensure data directory exists
if (!fs.existsSync(path.join(__dirname, 'data'))) {
  fs.mkdirSync(path.join(__dirname, 'data'), { recursive: true });
}

// Initialize database file if it doesn't exist
if (!fs.existsSync(DB_FILE)) {
  const initialData = {
    semesters: {
      'Semester 1 2024': {
        courses: [],
        teachers: [],
        subjects: [],
        schedule: [],
        currentCollege: 'Moss Vale'
      }
    },
    currentSemester: 'Semester 1 2024',
    lastUpdated: new Date().toISOString()
  };
  fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2));
}

// Helper functions
const readDatabase = () => {
  try {
    const data = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading database:', error);
    return null;
  }
};

const writeDatabase = (data) => {
  try {
    data.lastUpdated = new Date().toISOString();
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing database:', error);
    return false;
  }
};

// Routes

// Get all data
app.get('/api/data', (req, res) => {
  const data = readDatabase();
  if (data) {
    res.json({ success: true, data });
  } else {
    res.status(500).json({ success: false, error: 'Failed to read database' });
  }
});

// Save all data
app.post('/api/data', (req, res) => {
  const { data } = req.body;
  if (!data) {
    return res.status(400).json({ success: false, error: 'No data provided' });
  }
  
  const success = writeDatabase(data);
  if (success) {
    res.json({ success: true, message: 'Data saved successfully' });
  } else {
    res.status(500).json({ success: false, error: 'Failed to save database' });
  }
});

// Get specific semester
app.get('/api/semester/:name', (req, res) => {
  const data = readDatabase();
  if (!data) {
    return res.status(500).json({ success: false, error: 'Failed to read database' });
  }
  
  const semester = data.semesters[req.params.name];
  if (semester) {
    res.json({ success: true, data: semester });
  } else {
    res.status(404).json({ success: false, error: 'Semester not found' });
  }
});

// Create new semester
app.post('/api/semester', (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ success: false, error: 'Semester name required' });
  }
  
  const data = readDatabase();
  if (!data) {
    return res.status(500).json({ success: false, error: 'Failed to read database' });
  }
  
  if (data.semesters[name]) {
    return res.status(400).json({ success: false, error: 'Semester already exists' });
  }
  
  data.semesters[name] = {
    courses: [],
    teachers: [],
    subjects: [],
    schedule: [],
    currentCollege: 'Moss Vale'
  };
  
  if (writeDatabase(data)) {
    res.json({ success: true, message: 'Semester created', data: data.semesters[name] });
  } else {
    res.status(500).json({ success: false, error: 'Failed to create semester' });
  }
});

// Delete semester
app.delete('/api/semester/:name', (req, res) => {
  const data = readDatabase();
  if (!data) {
    return res.status(500).json({ success: false, error: 'Failed to read database' });
  }
  
  if (!data.semesters[req.params.name]) {
    return res.status(404).json({ success: false, error: 'Semester not found' });
  }
  
  delete data.semesters[req.params.name];
  
  if (data.currentSemester === req.params.name) {
    data.currentSemester = Object.keys(data.semesters)[0] || 'Semester 1 2024';
  }
  
  if (writeDatabase(data)) {
    res.json({ success: true, message: 'Semester deleted' });
  } else {
    res.status(500).json({ success: false, error: 'Failed to delete semester' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Server is running', timestamp: new Date().toISOString() });
});

// Serve index.html for all other routes (SPA)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ success: false, error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`TAFE Timetable Cloud Server running on port ${PORT}`);
  console.log(`Database file: ${DB_FILE}`);
});
