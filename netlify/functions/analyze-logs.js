import { GoogleGenerativeAI } from '@google/generative-ai';

const getRiskLevel = (score) => {
  if (score <= 2) return 'LOW';
  if (score <= 5) return 'MEDIUM';
  if (score <= 7) return 'HIGH';
  return 'CRITICAL';
};

const parseStructuredResponse = (responseText) => {
  const result = {
    riskScore: 5,
    summary: '',
    detailedAnalysis: '',
    recommendations: []
  };

  const lines = responseText.split('\n');
  let currentSection = null;

  for (let line of lines) {
    line = line.trim();
    if (!line) continue;

    if (line.toLowerCase().includes('risk score:') || line.toLowerCase().includes('score:')) {
      const scoreMatch = line.match(/(\d+)/);
      if (scoreMatch) {
        result.riskScore = Math.min(10, Math.max(1, parseInt(scoreMatch[1])));
      }
    }
    else if (line.toLowerCase().startsWith('summary:')) {
      result.summary = line.split(':', 1)[1]?.trim() || '';
      currentSection = 'summary';
    }
    else if (line.toLowerCase().includes('detailed analysis:') || line.toLowerCase().startsWith('analysis:')) {
      result.detailedAnalysis = line.split(':', 1)[1]?.trim() || '';
      currentSection = 'analysis';
    }
    else if (line.toLowerCase().includes('recommendation') && line.includes(':')) {
      currentSection = 'recommendations';
    }
    else if (currentSection === 'recommendations') {
      if (line.match(/^[-•*\d.\s]/)) {
        const cleanRec = line.replace(/^[-•*\d.\s]+/, '').trim();
        if (cleanRec) {
          result.recommendations.push(cleanRec);
        }
      }
    }
  }

  return result;
};

export const handler = async (event, context) => {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      }
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { logContent, filename, apiKey } = JSON.parse(event.body);
    
    if (!apiKey) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ error: 'API key is required' })
      };
    }

    if (!logContent) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ error: 'Log content is required' })
      };
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const primaryChunk = logContent.substring(0, 1500);

    const prompt = `
You are a cybersecurity analyst reviewing system logs for security anomalies. Analyze the following log entries for potential security threats.

LOG FILE: ${filename || 'system.log'}
LOG CONTENT:
${primaryChunk}

ANALYSIS INSTRUCTIONS:
1. Look for security-relevant patterns:
   - Failed authentication attempts
   - Unusual IP addresses or geographic locations
   - Privilege escalation attempts
   - Suspicious network connections
   - Error patterns indicating attacks
   - Brute force attempts
   - Unusual timing patterns

2. Provide your analysis in this exact format:

Risk Score: [number from 1-10]
Summary: [Brief overview of security findings]
Detailed Analysis: [Explain notable patterns, anomalies, and their significance]
Recommendations:
- [Security actions to take based on findings]

Focus on actionable security insights.
`;

    const result = await model.generateContent(prompt);
    const analysisText = result.response.text();
    
    const parsed = parseStructuredResponse(analysisText);
    
    // Create anomalies based on log content analysis
    const anomalies = [];
    
    const failedAuthMatches = logContent.match(/failed|failure|invalid|denied/gi) || [];
    if (failedAuthMatches.length > 5) {
      anomalies.push({
        type: 'Authentication Failures',
        description: `Multiple authentication failures detected (${failedAuthMatches.length} instances)`,
        severity: failedAuthMatches.length > 20 ? 'HIGH' : 'MEDIUM'
      });
    }
    
    const ipMatches = logContent.match(/\b(?:\d{1,3}\.){3}\d{1,3}\b/g) || [];
    const uniqueIps = [...new Set(ipMatches)];
    if (uniqueIps.length > 10) {
      anomalies.push({
        type: 'Multiple IP Addresses',
        description: `High number of unique IP addresses detected (${uniqueIps.length} IPs)`,
        severity: 'MEDIUM'
      });
    }
    
    const errorMatches = logContent.match(/error|exception|critical|alert/gi) || [];
    if (errorMatches.length > 10) {
      anomalies.push({
        type: 'High Error Rate',
        description: `Elevated error rate detected (${errorMatches.length} errors)`,
        severity: 'MEDIUM'
      });
    }

    const response = {
      analysisType: 'security_logs',
      riskScore: parsed.riskScore,
      riskLevel: getRiskLevel(parsed.riskScore),
      summary: parsed.summary || 'Security log analysis completed',
      detailedAnalysis: parsed.detailedAnalysis || analysisText,
      anomalies,
      logLines: logContent.split('\n').filter(line => line.trim()).slice(0, 20),
      recommendations: parsed.recommendations.length > 0 ? parsed.recommendations : [
        'Monitor authentication logs for patterns',
        'Review access patterns and IP addresses',
        'Implement additional monitoring for detected anomalies'
      ],
      analysisTimestamp: new Date().toISOString()
    };

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(response)
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: `Log analysis failed: ${error.message}` })
    };
  }
};