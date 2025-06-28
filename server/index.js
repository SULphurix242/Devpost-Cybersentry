import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import multer from 'multer';
import dotenv from 'dotenv';
import { GeminiAnalyzer } from './gemini-utils.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// File upload configuration
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Global analyzer instance
let geminiAnalyzer = null;

// Routes
app.get('/', (req, res) => {
  res.json({ 
    message: 'CyberSentry API is running', 
    status: 'healthy',
    version: '1.0.0'
  });
});

app.post('/api/set-api-key', async (req, res) => {
  try {
    const { apiKey } = req.body;
    
    if (!apiKey) {
      return res.status(400).json({ error: 'API key is required' });
    }

    geminiAnalyzer = new GeminiAnalyzer(apiKey);
    res.json({ message: 'API key configured successfully' });
  } catch (error) {
    console.error('API key configuration error:', error);
    res.status(400).json({ error: `Invalid API key: ${error.message}` });
  }
});

app.post('/api/analyze/phishing', async (req, res) => {
  try {
    if (!geminiAnalyzer) {
      return res.status(400).json({ error: 'API key not configured' });
    }

    const { emailContent, includeHeaders = false } = req.body;
    
    if (!emailContent) {
      return res.status(400).json({ error: 'Email content is required' });
    }

    const result = await geminiAnalyzer.analyzePhishingEmail(emailContent, includeHeaders);
    res.json(result);
  } catch (error) {
    console.error('Phishing analysis error:', error);
    res.status(500).json({ error: `Analysis failed: ${error.message}` });
  }
});

app.post('/api/analyze/logs', upload.single('file'), async (req, res) => {
  try {
    if (!geminiAnalyzer) {
      return res.status(400).json({ error: 'API key not configured' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'Log file is required' });
    }

    const logContent = req.file.buffer.toString('utf-8');
    const filename = req.file.originalname || 'uploaded_log.log';

    const result = await geminiAnalyzer.analyzeSecurityLogs(logContent, filename);
    res.json(result);
  } catch (error) {
    console.error('Log analysis error:', error);
    res.status(500).json({ error: `Log analysis failed: ${error.message}` });
  }
});

app.post('/api/explain/log-line', async (req, res) => {
  try {
    if (!geminiAnalyzer) {
      return res.status(400).json({ error: 'API key not configured' });
    }

    const { logLine } = req.body;
    
    if (!logLine) {
      return res.status(400).json({ error: 'Log line is required' });
    }

    const explanation = await geminiAnalyzer.explainLogLine(logLine);
    res.json({ explanation });
  } catch (error) {
    console.error('Log line explanation error:', error);
    res.status(500).json({ error: `Explanation failed: ${error.message}` });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 CyberSentry API running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/`);
});