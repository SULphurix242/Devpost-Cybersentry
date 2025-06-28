import React, { useState } from 'react';
import { Key, Shield, ExternalLink, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { setApiKey } from '../utils/api';

const ApiKeySetup = ({ onConfigured }) => {
  const [apiKey, setApiKeyValue] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!apiKey.trim()) {
      toast.error('Please enter a valid API key');
      return;
    }

    setLoading(true);
    
    try {
      await setApiKey(apiKey);
      onConfigured();
    } catch (error) {
      toast.error(error.message || 'Failed to configure API key');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="cyber-card max-w-md w-full">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Shield className="w-12 h-12 text-blue-400 mr-3" />
            <Key className="w-8 h-8 text-cyan-400" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">API Key Required</h2>
          <p className="text-slate-300">
            To use CyberSentry, you need a Google Gemini API key
          </p>
        </div>

        <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-xl p-4 mb-6">
          <h3 className="text-blue-400 font-semibold mb-2">Get your API key:</h3>
          <a
            href="https://makersuite.google.com/app/apikey"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            Google AI Studio
            <ExternalLink className="w-4 h-4 ml-1" />
          </a>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="apiKey" className="block text-sm font-medium text-slate-300 mb-2">
              Gemini API Key
            </label>
            <input
              type="password"
              id="apiKey"
              value={apiKey}
              onChange={(e) => setApiKeyValue(e.target.value)}
              placeholder="AIza..."
              className="cyber-input w-full"
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading || !apiKey.trim()}
            className="cyber-button w-full disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                Initializing...
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <Shield className="w-5 h-5 mr-2" />
                Initialize CyberSentry
              </div>
            )}
          </button>
        </form>

        <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
          <p className="text-yellow-400 text-sm">
            <strong>Note:</strong> Your API key is only stored temporarily and is not saved permanently.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ApiKeySetup;