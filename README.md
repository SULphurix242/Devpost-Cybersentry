# CyberSentry - AI-Powered Cybersecurity Analysis Platform

A modern cybersecurity analysis platform powered by Google's Gemini AI, built with React and Node.js.

## Features

### 🛡️ PhishSentry - Email Phishing Analyzer
- AI-powered phishing detection
- Email header analysis
- Risk scoring and detailed explanations
- Actionable security recommendations

### 📊 LogLens - Security Log Analyzer
- Automated log analysis for security threats
- **Interactive log line explanations** - Click any log line for plain-English explanations
- Anomaly detection and pattern recognition
- Support for various log formats (.log, .txt)

## Tech Stack

### Backend
- **Node.js** with Express.js
- **Google Gemini AI** for analysis
- **Multer** for file uploads
- **CORS** and security middleware

### Frontend
- **React 18** with Vite
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **Axios** for API communication
- **React Hot Toast** for notifications

## Quick Start

### Prerequisites
- Node.js 18+ 
- Google Gemini API key ([Get one here](https://makersuite.google.com/app/apikey))

### Installation

1. **Clone and install dependencies:**
```bash
git clone <repository-url>
cd cybersentry-js
npm install
cd client && npm install && cd ..
```

2. **Set up environment variables:**
```bash
cp .env.example .env
# Edit .env and add your GEMINI_API_KEY
```

3. **Start the application:**
```bash
# Start both backend and frontend
npm run dev

# Or start them separately:
npm run server  # Backend on http://localhost:8000
npm run client  # Frontend on http://localhost:5173
```

4. **Configure API key:**
   - Open http://localhost:5173
   - Enter your Gemini API key when prompted
   - Start analyzing!

## Usage

### PhishSentry (Email Analysis)
1. Navigate to the PhishSentry tab
2. Paste suspicious email content (including headers)
3. Choose whether to include header analysis
4. Click "Analyze Email"
5. Review risk score, indicators, and recommendations

### LogLens (Log Analysis)
1. Navigate to the LogLens tab
2. Upload a log file (.log or .txt, max 10MB)
3. Click "Analyze Logs"
4. Review security anomalies and recommendations
5. **Click on any log line** to get a plain-English explanation

## Key Features

### 🔍 Interactive Log Line Explanations
The standout feature of LogLens is the ability to click on any individual log line to receive an AI-generated explanation in plain English. This helps system administrators and security analysts quickly understand:
- What each log entry means
- Whether it indicates normal or suspicious activity  
- What actions might be needed

### 🎨 Modern UI/UX
- Cybersecurity-themed design with glassmorphism effects
- Responsive layout that works on all devices
- Real-time loading states and error handling
- Toast notifications for user feedback

### 🔒 Security Features
- Rate limiting on API endpoints
- File size restrictions for uploads
- Input validation and sanitization
- Secure API key handling

## API Endpoints

- `GET /` - Health check
- `POST /api/set-api-key` - Configure Gemini API key
- `POST /api/analyze/phishing` - Analyze email for phishing
- `POST /api/analyze/logs` - Analyze uploaded log files
- `POST /api/explain/log-line` - Explain individual log lines

## Development

### Project Structure
```
cybersentry-js/
├── server/                 # Node.js backend
│   ├── index.js           # Express server
│   └── gemini-utils.js    # AI analysis utilities
├── client/                # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── utils/         # API utilities
│   │   └── App.jsx        # Main app component
│   └── public/            # Static assets
├── package.json           # Root package.json
└── README.md
```

### Available Scripts
- `npm run dev` - Start both backend and frontend
- `npm run server` - Start backend only
- `npm run client` - Start frontend only  
- `npm run build` - Build for production
- `npm run install-all` - Install all dependencies

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is for demonstration purposes. Always verify security findings with cybersecurity experts.

## Support

For issues and questions:
1. Check the console for error messages
2. Ensure the backend is running on port 8000
3. Verify your Gemini API key is valid
4. Check network connectivity

---

**⚠️ Disclaimer:** This tool is for educational and demonstration purposes only. Always consult with cybersecurity professionals for production security analysis.