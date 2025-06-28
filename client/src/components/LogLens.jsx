import React, { useState } from 'react';
import { FileText, Upload, Search, Loader2, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';
import { analyzeLogs, explainLogLine } from '../utils/api';
import AnalysisResults from './AnalysisResults';

const LogLens = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [explanations, setExplanations] = useState({});
  const [loadingExplanations, setLoadingExplanations] = useState({});

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.size > 10 * 1024 * 1024) { // 10MB limit
        toast.error('File size must be less than 10MB');
        return;
      }
      setFile(selectedFile);
      setResults(null);
      setExplanations({});
    }
  };

  const handleAnalyze = async () => {
    if (!file) {
      toast.error('Please select a log file to analyze');
      return;
    }

    setLoading(true);
    
    try {
      const analysisResults = await analyzeLogs(file);
      setResults(analysisResults);
      toast.success('Log analysis completed!');
    } catch (error) {
      toast.error(error.message || 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  const handleExplainLine = async (logLine, index) => {
    if (explanations[index]) {
      // Toggle explanation visibility
      setExplanations(prev => ({
        ...prev,
        [index]: prev[index] === logLine ? null : prev[index]
      }));
      return;
    }

    setLoadingExplanations(prev => ({ ...prev, [index]: true }));
    
    try {
      const explanation = await explainLogLine(logLine);
      setExplanations(prev => ({
        ...prev,
        [index]: explanation
      }));
    } catch (error) {
      toast.error('Failed to explain log line');
    } finally {
      setLoadingExplanations(prev => ({ ...prev, [index]: false }));
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="cyber-card">
        <div className="flex items-center mb-4">
          <FileText className="w-8 h-8 text-blue-400 mr-3" />
          <div>
            <h2 className="text-2xl font-bold text-white">LogLens</h2>
            <p className="text-slate-300">Security Log Analyzer</p>
          </div>
        </div>
        <p className="text-slate-400">
          Upload system logs for AI-powered security analysis.
        </p>
      </div>

      {/* File Upload Section */}
      <div className="cyber-card">
        <div className="space-y-6">
          <div>
            <label htmlFor="logFile" className="block text-sm font-medium text-slate-300 mb-2">
              Choose a log file
            </label>
            <div className="relative">
              <input
                type="file"
                id="logFile"
                accept=".log,.txt"
                onChange={handleFileChange}
                className="hidden"
                disabled={loading}
              />
              <label
                htmlFor="logFile"
                className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-600 rounded-xl cursor-pointer hover:border-blue-500 transition-colors bg-slate-800/30"
              >
                <Upload className="w-8 h-8 text-slate-400 mb-2" />
                <p className="text-slate-400">
                  {file ? file.name : 'Click to upload log file'}
                </p>
                <p className="text-slate-500 text-sm">
                  Supports .log, .txt files (max 10MB)
                </p>
              </label>
            </div>
          </div>

          {file && (
            <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
              <div className="flex items-center">
                <FileText className="w-5 h-5 text-green-400 mr-2" />
                <span className="text-green-400 font-medium">
                  {file.name} ({(file.size / 1024).toFixed(1)} KB)
                </span>
              </div>
            </div>
          )}

          <button
            onClick={handleAnalyze}
            disabled={loading || !file}
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
                Analyze Logs
              </div>
            )}
          </button>
        </div>
      </div>

      {/* Results */}
      {results && (
        <>
          <AnalysisResults results={results} />
          
          {/* Log Line Explanations */}
          {results.logLines && results.logLines.length > 0 && (
            <div className="cyber-card">
              <div className="flex items-center mb-6">
                <MessageSquare className="w-6 h-6 text-blue-400 mr-3" />
                <h3 className="text-xl font-bold text-white">Explain Log Lines</h3>
              </div>
              <p className="text-slate-400 mb-6">
                Click on any log line to get a plain-English explanation:
              </p>
              
              <div className="space-y-3">
                {results.logLines.map((line, index) => (
                  <div key={index} className="space-y-2">
                    <div
                      onClick={() => handleExplainLine(line, index)}
                      className="log-line group"
                    >
                      <div className="flex items-center justify-between">
                        <code className="flex-1 text-sm">
                          {line.length > 100 ? `${line.substring(0, 100)}...` : line}
                        </code>
                        <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          {loadingExplanations[index] ? (
                            <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
                          ) : (
                            <MessageSquare className="w-4 h-4 text-blue-400" />
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {explanations[index] && (
                      <div className="explanation-box">
                        <div className="flex items-start">
                          <MessageSquare className="w-5 h-5 text-blue-400 mr-2 mt-0.5 flex-shrink-0" />
                          <div>
                            <h4 className="font-semibold text-blue-300 mb-2">Explanation:</h4>
                            <p className="text-blue-100 leading-relaxed">{explanations[index]}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default LogLens;