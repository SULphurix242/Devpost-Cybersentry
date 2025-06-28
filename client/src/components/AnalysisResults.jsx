import React from 'react';
import { Shield, AlertTriangle, CheckCircle, Info, TrendingUp, Clock } from 'lucide-react';

const AnalysisResults = ({ results }) => {
  const getRiskIcon = (level) => {
    switch (level.toLowerCase()) {
      case 'low': return <CheckCircle className="w-5 h-5" />;
      case 'medium': return <Info className="w-5 h-5" />;
      case 'high': return <AlertTriangle className="w-5 h-5" />;
      case 'critical': return <Shield className="w-5 h-5" />;
      default: return <Info className="w-5 h-5" />;
    }
  };

  const getRiskClass = (level) => {
    switch (level.toLowerCase()) {
      case 'low': return 'risk-low';
      case 'medium': return 'risk-medium';
      case 'high': return 'risk-high';
      case 'critical': return 'risk-critical';
      default: return 'risk-medium';
    }
  };

  const getSeverityClass = (severity) => {
    switch (severity.toLowerCase()) {
      case 'low': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'high': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'critical': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <div className="space-y-6">
      {/* Risk Score and Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="cyber-card text-center">
          <div className={`risk-indicator ${getRiskClass(results.riskLevel)} text-4xl font-bold mb-2`}>
            <div className="flex items-center justify-center mb-2">
              {getRiskIcon(results.riskLevel)}
            </div>
            <div>{results.riskScore}/10</div>
            <div className="text-lg font-semibold mt-2">{results.riskLevel}</div>
          </div>
        </div>

        <div className="lg:col-span-2 cyber-card">
          <div className="flex items-center mb-4">
            <TrendingUp className="w-6 h-6 text-blue-400 mr-2" />
            <h3 className="text-xl font-bold text-white">Analysis Summary</h3>
          </div>
          <p className="text-slate-300 leading-relaxed">{results.summary}</p>
        </div>
      </div>

      {/* Detailed Analysis */}
      <div className="cyber-card">
        <div className="flex items-center mb-4">
          <Shield className="w-6 h-6 text-blue-400 mr-2" />
          <h3 className="text-xl font-bold text-white">Detailed Analysis</h3>
        </div>
        <p className="text-slate-300 leading-relaxed">{results.detailedAnalysis}</p>
      </div>

      {/* Indicators */}
      {results.indicators && results.indicators.length > 0 && (
        <div className="cyber-card">
          <div className="flex items-center mb-6">
            <AlertTriangle className="w-6 h-6 text-orange-400 mr-2" />
            <h3 className="text-xl font-bold text-white">Phishing Indicators</h3>
          </div>
          <div className="space-y-4">
            {results.indicators.map((indicator, index) => (
              <div key={index} className="bg-slate-800/30 border border-slate-600/30 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-blue-400">{indicator.type}</h4>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getSeverityClass(indicator.severity)}`}>
                    {indicator.severity}
                  </span>
                </div>
                <p className="text-slate-300">{indicator.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Anomalies */}
      {results.anomalies && results.anomalies.length > 0 && (
        <div className="cyber-card">
          <div className="flex items-center mb-6">
            <AlertTriangle className="w-6 h-6 text-red-400 mr-2" />
            <h3 className="text-xl font-bold text-white">Security Anomalies</h3>
          </div>
          <div className="space-y-4">
            {results.anomalies.map((anomaly, index) => (
              <div key={index} className="bg-slate-800/30 border border-slate-600/30 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-blue-400">{anomaly.type}</h4>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getSeverityClass(anomaly.severity)}`}>
                    {anomaly.severity}
                  </span>
                </div>
                <p className="text-slate-300">{anomaly.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {results.recommendations && results.recommendations.length > 0 && (
        <div className="cyber-card">
          <div className="flex items-center mb-6">
            <CheckCircle className="w-6 h-6 text-green-400 mr-2" />
            <h3 className="text-xl font-bold text-white">Recommendations</h3>
          </div>
          <div className="space-y-3">
            {results.recommendations.map((recommendation, index) => (
              <div key={index} className="flex items-start">
                <div className="w-2 h-2 bg-green-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <p className="text-slate-300">{recommendation}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Timestamp */}
      <div className="cyber-card">
        <div className="flex items-center text-slate-400 text-sm">
          <Clock className="w-4 h-4 mr-2" />
          <span>Analysis completed: {new Date(results.analysisTimestamp).toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
};

export default AnalysisResults;