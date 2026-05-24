const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// User configuration - EDIT THESE WITH YOUR DETAILS
const USER_CONFIG = {
  full_name: 'john_doe',      // Replace with your full name (lowercase, space -> underscore)
  dob: '17091999',            // Replace with your DDMMYYYY
  email: 'john@xyz.com',      // Replace with your college email
  roll_number: 'ABCD123'      // Replace with your roll number
};

// Helper: Check if number is prime
function isPrime(num) {
  const n = parseInt(num);
  if (n < 2) return false;
  for (let i = 2; i <= Math.sqrt(n); i++) {
    if (n % i === 0) return false;
  }
  return true;
}

// Helper: Get MIME type from base64
function getMimeType(base64String) {
  const signatures = {
    '/9j/': 'image/jpeg',
    'iVBORw0KGgo': 'image/png',
    'R0lGOD': 'image/gif',
    'Qk02': 'image/bmp',
    'JVBERi0': 'application/pdf',
    'UEsDB': 'application/zip',
    '77u/': 'text/plain',
    'AAAB': 'image/webp'
  };
  
  for (const [sig, mime] of Object.entries(signatures)) {
    if (base64String.startsWith(sig)) return mime;
  }
  return 'application/octet-stream';
}

// Helper: Validate base64
function isValidBase64(str) {
  if (!str || typeof str !== 'string') return false;
  try {
    return btoa(atob(str)) === str;
  } catch (e) {
    return false;
  }
}

// GET endpoint
app.get('/bfhl', (req, res) => {
  res.status(200).json({ operation_code: 1 });
});

// POST endpoint
app.post('/bfhl', (req, res) => {
  try {
    const { data, file_b64 } = req.body;

    // Validate data array
    if (!data || !Array.isArray(data)) {
      return res.status(400).json({ 
        is_success: false, 
        message: 'Invalid input: data array required' 
      });
    }

    // Separate numbers and alphabets
    const numbers = [];
    const alphabets = [];
    
    for (const item of data) {
      const str = String(item).trim();
      if (str === '') continue;
      
      // Check if it's a number (can have optional - sign)
      if (/^-?\d+$/.test(str)) {
        numbers.push(str);
      } else if (/^[a-zA-Z]$/.test(str)) {
        alphabets.push(str);
      }
    }

    // Find highest lowercase alphabet
    const lowercaseAlphabets = alphabets.filter(c => c >= 'a' && c <= 'z');
    const highestLowercase = lowercaseAlphabets.length > 0 
      ? [lowercaseAlphabets.reduce((max, c) => c > max ? c : max)]
      : [];

    // Check for prime numbers
    const isPrimeFound = numbers.some(n => isPrime(n));

    // File handling
    let fileValid = false;
    let fileMimeType = '';
    let fileSizeKb = '';

    if (file_b64 && isValidBase64(file_b64)) {
      fileValid = true;
      fileMimeType = getMimeType(file_b64);
      // Calculate size: base64 is ~4/3 of actual size, convert to KB
      const sizeBytes = (file_b64.length * 3) / 4;
      fileSizeKb = Math.round(sizeBytes / 1024).toString();
    }

    // Build response
    const response = {
      is_success: true,
      user_id: `${USER_CONFIG.full_name}_${USER_CONFIG.dob}`,
      email: USER_CONFIG.email,
      roll_number: USER_CONFIG.roll_number,
      numbers: numbers,
      alphabets: alphabets,
      highest_lowercase_alphabet: highestLowercase,
      is_prime_found: isPrimeFound,
      file_valid: fileValid,
      ...(fileValid && {
        file_mime_type: fileMimeType,
        file_size_kb: fileSizeKb
      })
    };

    res.status(200).json(response);

  } catch (error) {
    res.status(500).json({ 
      is_success: false, 
      message: error.message 
    });
  }
});

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'BFHL API is running', endpoints: ['/bfhl'] });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
