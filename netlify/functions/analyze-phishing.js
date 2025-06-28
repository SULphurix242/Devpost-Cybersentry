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
    indicators: [],
    anomalies: [],
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
    else if (currentSection === 'summary' && !line.toLowerCase().match(/(detailed|analysis|recommendation)/)) {
      result.summary += ' ' + line;
    }
    else if (currentSection === 'analysis' && !line.toLowerCase().match(/(recommendation)/)) {
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
    const { emailContent, includeHeaders = false, apiKey } = JSON.parse(event.body);
    
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

    if (!emailContent) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ error: 'Email content is required' })
      };
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

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
Recommendations:
- [Specific actions the recipient should take]

Be thorough but concise. Focus on actionable insights.
`;

    const result = await model.generateContent(prompt);
    const analysisText = result.response.text();
    
    const parsed = parseStructuredResponse(analysisText);
    
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
    }

    const response = {
      analysisType: 'phishing_email',
      riskScore: parsed.riskScore,
      riskLevel: getRiskLevel(parsed.riskScore),
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
      body: JSON.stringify({ error: `Analysis failed: ${error.message}` })
    };
  }
};