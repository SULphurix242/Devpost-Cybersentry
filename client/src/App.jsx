import React, { useState } from 'react';
import { Shield, Mail, FileText, Key, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import ApiKeySetup from './components/ApiKeySetup';
import PhishSentry from './components/PhishSentry';
import LogLens from './components/LogLens';
import { checkApiConnection } from './utils/api';

function App() {
  const [apiKeyConfigured, setApiKeyConfigured] = useState(false);
  const [activeTab, setActiveTab] = useState('phishing');
  const [apiConnected, setApiConnected] = useState(false);

  React.useEffect(() => {
    const checkConnection = async () => {
      const connected = await checkApiConnection();
      setApiConnected(connected);
      if (!connected) {
        // For Netlify deployment, we don't need a backend server running
        const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        if (isLocal) {
          toast.error('Backend connection failed. Make sure the server is running on port 8000.');
        } else {
          // On Netlify, assume connection is working
          setApiConnected(true);
        }
      }
    };
    
    checkConnection();
    const interval = setInterval(checkConnection, 30000); // Check every 30 seconds
    
    return () => clearInterval(interval);
  }, []);

  const handleApiKeyConfigured = () => {
    setApiKeyConfigured(true);
    toast.success('🚀 CyberSentry initialized successfully!');
  };

  // For Netlify deployment, skip backend connection check
  const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  
  if (isLocal && !apiConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="cyber-card max-w-md w-full text-center">
          <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-red-400 mb-2">Backend Connection Error</h2>
          <p className="text-slate-300 mb-4">
            Cannot connect to CyberSentry API. Make sure the backend is running:
          </p>
          <div className="bg-slate-800/50 rounded-lg p-4 font-mono text-sm text-left">
            <code className="text-green-400">npm run server</code>
          </div>
          <p className="text-slate-400 text-sm mt-4">
            Server should be running on http://localhost:8000
          </p>
        </div>
      </div>
    );
  }

  if (!apiKeyConfigured) {
    return <ApiKeySetup onConfigured={handleApiKeyConfigured} />;
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-cyan-600/20 to-blue-600/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 py-16 text-center">
          <div className="flex items-center justify-center mb-6">
            <Shield className="w-16 h-16 text-blue-400 mr-4" />
            <h1 className="text-6xl font-bold bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
              CyberSentry
            </h1>
          </div>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            AI-Powered Cybersecurity Analysis Platform
          </p>
          <div className="flex items-center justify-center mt-4 space-x-2">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <span className="text-green-400 font-medium">
              {isLocal ? 'API Connected' : 'Netlify Functions Ready'}
            </span>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 mb-8">
        <div className="flex space-x-1 bg-slate-800/30 p-1 rounded-2xl backdrop-blur-lg border border-slate-600/30">
          <button
            onClick={() => setActiveTab('phishing')}
            className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
              activeTab === 'phishing'
                ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <Mail className="w-5 h-5" />
            <span>PhishSentry</span>
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
              activeTab === 'logs'
                ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <FileText className="w-5 h-5" />
            <span>LogLens</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 pb-16">
        {activeTab === 'phishing' && <PhishSentry />}
        {activeTab === 'logs' && <LogLens />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-700/50 bg-slate-900/50 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-4 py-8 text-center">
          <p className="text-slate-400">
            <strong className="text-white">CyberSentry v2.0</strong> | Powered by Gemini AI | Built with React & Netlify Functions
          </p>
          <p className="text-slate-500 text-sm mt-2">
            ⚠️ For demonstration purposes only. Always verify findings with security experts.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;