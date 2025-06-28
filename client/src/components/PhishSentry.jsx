import React, { useState } from 'react';
import { Mail, Search, AlertTriangle, CheckCircle, Info, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { analyzePhishing } from '../utils/api';
import AnalysisResults from './AnalysisResults';

const PhishSentry = () => {
  const [emailContent, setEmailContent] = useState('');
  const [includeHeaders, setIncludeHeaders] = useState(true);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);

  const handleAnalyze = async () => {
    if (!emailContent.trim()) {
      toast.error('Please enter email content to analyze');
      return;
    }

    setLoading(true);
    
    try {
      const analysisResults = await analyzePhishing(emailContent, includeHeaders);
      setResults(analysisResults);
      toast.success('Email analysis completed!');
    } catch (error) {
      toast.error(error.message || 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="cyber-card">
        <div className="flex items-center mb-4">
          <Mail className="w-8 h-8 text-blue-400 mr-3" />
          <div>
            <h2 className="text-2xl font-bold text-white">PhishSentry</h2>
            <p className="text-slate-300">Email Phishing Analyzer</p>
          </div>
        </div>
        <p className="text-slate-400">
          Paste suspicious email content below for AI-powered phishing analysis.
        </p>
      </div>

      {/* Input Section */}
      <div className="cyber-card">
        <div className="space-y-6">
          <div>
            <label htmlFor="emailContent" className="block text-sm font-medium text-slate-300 mb-2">
              Email Content (including headers if available)
            </label>
            <textarea
              id="emailContent"
              value={emailContent}
              onChange={(e) => setEmailContent(e.target.value)}
              placeholder="Paste the raw email content here, including headers if you want header analysis...

Example:
From: security@bank.com
To: you@email.com
Subject: URGENT: Verify your account

Dear Customer,
Your account will be suspended unless you verify immediately..."
              className="cyber-input w-full h-64 font-mono text-sm resize-none"
              disabled={loading}
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={includeHeaders}
                onChange={(e) => setIncludeHeaders(e.target.checked)}
                className="rounded border-slate-600 bg-slate-800 text-blue-600 focus:ring-blue-500 focus:ring-offset-0"
                disabled={loading}
              />
              <span className="text-slate-300">Include header analysis</span>
            </label>

            <button
              onClick={handleAnalyze}
              disabled={loading || !emailContent.trim()}
              className="cyber-button disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? (
                <div className="flex items-center">
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Analyzing...
                </div>
              ) : (
                <div className="flex items-center">
                  <Search className="w-5 h-5 mr-2" />
                  Analyze Email
                </div>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Results */}
      {results && <AnalysisResults results={results} />}
    </div>
  );
};

export default PhishSentry;