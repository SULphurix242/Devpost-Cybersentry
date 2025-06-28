import { GoogleGenerativeAI } from '@google/generative-ai';

export class GeminiAnalyzer {
  constructor(apiKey) {
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is required');
    }
    
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    this.maxTokens = 2000;
  }

  chunkContent(content, maxSize = 1500) {
    const words = content.split(' ');
    const chunks = [];
    let currentChunk = [];
    let currentSize = 0;

    for (const word of words) {
      const wordSize = word.length + 1;
      if (currentSize + wordSize > maxSize && currentChunk.length > 0) {
        chunks.push(currentChunk.join(' '));
        currentChunk = [word];
        currentSize = wordSize;
      } else {
        currentChunk.push(word);
        currentSize += wordSize;
      }
    }

    if (currentChunk.length > 0) {
      chunks.push(currentChunk.join(' '));
    }

    return chunks;
  }

  getRiskLevel(score) {
    if (score <= 2) return 'LOW';
    if (score <= 5) return 'MEDIUM';
    if (score <= 7) return 'HIGH';
    return 'CRITICAL';
  }

  parseStructuredResponse(responseText) {
    const result = {
      riskScore: 5,
      summary: '',
      detailedAnalysis: '',
      indicators: [],
      anomalies: [],
      recommendations: []
    };

    const lines = responseText.split('\n');
    let currentSection = null;

    for (let line of lines) {
      line = line.trim();
      if (!line) continue;

      // Parse risk score
      if (line.toLowerCase().includes('risk score:') || line.toLowerCase().includes('score:')) {
        const scoreMatch = line.match(/(\d+)/);
        if (scoreMatch) {
          result.riskScore = Math.min(10, Math.max(1, parseInt(scoreMatch[1])));
        }
      }
      // Parse summary
      else if (line.toLowerCase().startsWith('summary:')) {
        result.summary = line.split(':', 1)[1]?.trim() || '';
        currentSection = 'summary';
      }
      // Parse detailed analysis
      else if (line.toLowerCase().includes('detailed analysis:') || line.toLowerCase().startsWith('analysis:')) {
        result.detailedAnalysis = line.split(':', 1)[1]?.trim() || '';
        currentSection = 'analysis';
      }
      // Parse indicators
      else if (line.toLowerCase().includes('indicator') && line.includes(':')) {
        currentSection = 'indicators';
      }
      // Parse anomalies
      else if (line.toLowerCase().includes('anomal') && line.includes(':')) {
        currentSection = 'anomalies';
      }
      // Parse recommendations
      else if (line.toLowerCase().includes('recommendation') && line.includes(':')) {
        currentSection = 'recommendations';
      }
      // Continue parsing based on current section
      else if (currentSection === 'summary' && !line.toLowerCase().match(/(detailed|analysis|indicator|anomal|recommendation)/)) {
        result.summary += ' ' + line;
      }
      else if (currentSection === 'analysis' && !line.toLowerCase().match(/(indicator|anomal|recommendation)/)) {
        result.detailedAnalysis += ' ' + line;
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
  }

  async analyzePhishingEmail(emailContent, includeHeaders = false) {
    const prompt = `
You are a cybersecurity expert analyzing emails for phishing indicators. Analyze the following email content and provide a structured assessment.

EMAIL CONTENT:
${emailContent.substring(0, 1500)}

ANALYSIS INSTRUCTIONS:
1. Examine the email for common phishing indicators:
   - Sender spoofing or suspicious domains
   - Urgent language and pressure tactics
   - Suspicious links or attachments
   - Grammar and spelling errors
   - Requests for sensitive information
   - Generic greetings or impersonal language

2. Provide your analysis in this exact format:

Risk Score: [number from 1-10]
Summary: [2-3 sentence overview of your findings]
Detailed Analysis: [Comprehensive explanation of what you found and why it's suspicious or legitimate]
Indicators Found:
- [List specific phishing indicators you identified]
Recommendations:
- [Specific actions the recipient should take]

Be thorough but concise. Focus on actionable insights.
`;

    try {
      const result = await this.model.generateContent(prompt);
      const analysisText = result.response.text();
      
      const parsed = this.parseStructuredResponse(analysisText);
      
      // Create indicators based on analysis
      const indicators = [];
      if (parsed.riskScore > 6) {
        if (/urgent|immediate|expire|suspend|verify now/i.test(emailContent)) {
          indicators.push({
            type: 'Urgency Tactics',
            description: 'Email uses urgent language to pressure immediate action',
            severity: 'HIGH',
            found: true
          });
        }
        
        if (/click here|verify account|update payment/i.test(emailContent)) {
          indicators.push({
            type: 'Suspicious Links',
            description: 'Email contains suspicious call-to-action links',
            severity: 'HIGH',
            found: true
          });
        }
      } else if (parsed.riskScore > 3) {
        if (/\b[A-Z]{2,}\b.*\b[A-Z]{2,}\b/.test(emailContent)) {
          indicators.push({
            type: 'Formatting Anomalies',
            description: 'Unusual capitalization patterns detected',
            severity: 'MEDIUM',
            found: true
          });
        }
      }

      return {
        analysisType: 'phishing_email',
        riskScore: parsed.riskScore,
        riskLevel: this.getRiskLevel(parsed.riskScore),
        summary: parsed.summary || 'Email phishing analysis completed',
        detailedAnalysis: parsed.detailedAnalysis || analysisText,
        indicators,
        recommendations: parsed.recommendations.length > 0 ? parsed.recommendations : [
          'Verify sender through alternative communication method',
          'Do not click on suspicious links',
          'Report suspicious emails to your IT security team'
        ],
        analysisTimestamp: new Date().toISOString()
      };
    } catch (error) {
      throw new Error(`Gemini API error: ${error.message}`);
    }
  }

  async analyzeSecurityLogs(logContent, filename = null) {
    const chunks = this.chunkContent(logContent);
    const primaryChunk = chunks[0] || logContent;

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
Anomalies Found:
- [List specific security concerns you identified]
Recommendations:
- [Security actions to take based on findings]

Focus on actionable security insights.
`;

    try {
      const result = await this.model.generateContent(prompt);
      const analysisText = result.response.text();
      
      const parsed = this.parseStructuredResponse(analysisText);
      
      // Create anomalies based on log content analysis
      const anomalies = [];
      
      // Check for failed authentication patterns
      const failedAuthMatches = logContent.match(/failed|failure|invalid|denied/gi) || [];
      if (failedAuthMatches.length > 5) {
        anomalies.push({
          type: 'Authentication Failures',
          description: `Multiple authentication failures detected (${failedAuthMatches.length} instances)`,
          severity: failedAuthMatches.length > 20 ? 'HIGH' : 'MEDIUM'
        });
      }
      
      // Check for suspicious IP patterns
      const ipMatches = logContent.match(/\b(?:\d{1,3}\.){3}\d{1,3}\b/g) || [];
      const uniqueIps = [...new Set(ipMatches)];
      if (uniqueIps.length > 10) {
        anomalies.push({
          type: 'Multiple IP Addresses',
          description: `High number of unique IP addresses detected (${uniqueIps.length} IPs)`,
          severity: 'MEDIUM'
        });
      }
      
      // Check for error patterns
      const errorMatches = logContent.match(/error|exception|critical|alert/gi) || [];
      if (errorMatches.length > 10) {
        anomalies.push({
          type: 'High Error Rate',
          description: `Elevated error rate detected (${errorMatches.length} errors)`,
          severity: 'MEDIUM'
        });
      }

      return {
        analysisType: 'security_logs',
        riskScore: parsed.riskScore,
        riskLevel: this.getRiskLevel(parsed.riskScore),
        summary: parsed.summary || 'Security log analysis completed',
        detailedAnalysis: parsed.detailedAnalysis || analysisText,
        anomalies,
        logLines: logContent.split('\n').filter(line => line.trim()).slice(0, 20), // First 20 lines
        recommendations: parsed.recommendations.length > 0 ? parsed.recommendations : [
          'Monitor authentication logs for patterns',
          'Review access patterns and IP addresses',
          'Implement additional monitoring for detected anomalies'
        ],
        analysisTimestamp: new Date().toISOString()
      };
    } catch (error) {
      throw new Error(`Gemini API error: ${error.message}`);
    }
  }

  async explainLogLine(logLine) {
    const prompt = `
Explain this system log entry in simple, clear language for a system administrator:

LOG LINE: ${logLine}

Provide a concise explanation that covers:
1. What this log entry means in plain English
2. Whether this indicates normal or suspicious activity
3. Any action that might be needed (if any)

Keep the explanation practical and easy to understand.
`;

    try {
      const result = await this.model.generateContent(prompt);
      return result.response.text().trim();
    } catch (error) {
      return `Unable to explain log line: ${error.message}`;
    }
  }
}