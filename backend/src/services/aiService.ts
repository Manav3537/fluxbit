import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface NaturalLanguageQueryResult {
  sql?: string;
  explanation: string;
  insights?: string[];
}

export interface InsightResult {
  insights: string[];
  recommendations: string[];
}

export interface AnomalyResult {
  anomalies: Array<{
    dataPoint: string;
    value: number;
    expectedRange: string;
    severity: 'low' | 'medium' | 'high';
    explanation: string;
  }>;
  summary: string;
}

// National language to data query convertion
export const processNaturalLanguageQuery = async (
  query: string,
  dataHeaders: string[],
  sampleData: any[]
): Promise<NaturalLanguageQueryResult> => {
  try {
    const prompt = `
You are a data analyst assistant. Given a dataset with the following columns: ${dataHeaders.join(', ')}

Sample data:
${JSON.stringify(sampleData.slice(0, 3), null, 2)}

User query: "${query}"

Provide:
1. A clear explanation of what data would answer this query
2. Key insights based on the query
3. If applicable, suggest filters or groupings

Respond in JSON format:
{
  "explanation": "explanation of what we're looking for",
  "insights": ["insight 1", "insight 2", "insight 3"]
}
`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are a helpful data analyst assistant.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' }
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error('No response from AI');
    }

    const result = JSON.parse(content);

    return {
      explanation: result.explanation,
      insights: result.insights || []
    };
  } catch (error) {
    console.error('AI Query Error:', error);
    throw new Error('Failed to process natural language query');
  }
};

// Insight generation
export const generateInsights = async (
  data: any[],
  headers: string[]
): Promise<InsightResult> => {
  try {
    const prompt = `
Analyze this dataset and provide actionable insights.

Dataset columns: ${headers.join(', ')}
Number of records: ${data.length}

Sample data:
${JSON.stringify(data.slice(0, 10), null, 2)}

Provide:
1. 3-5 key insights about trends, patterns, or notable observations
2. 2-3 actionable recommendations based on the data

Respond in JSON format:
{
  "insights": ["insight 1", "insight 2", ...],
  "recommendations": ["recommendation 1", "recommendation 2", ...]
}
`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are a data analyst providing business insights.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' }
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error('No response from AI');
    }

    const result = JSON.parse(content);

    return {
      insights: result.insights || [],
      recommendations: result.recommendations || []
    };
  } catch (error) {
    console.error('Insight Generation Error:', error);
    throw new Error('Failed to generate insights');
  }
};

// Anomaly detection
export const detectAnomalies = async (
  data: any[],
  headers: string[]
): Promise<AnomalyResult> => {
  try {
    const numericColumns = headers.filter(header => {
      const sample = data.find(row => row[header] != null);
      return sample && !isNaN(Number(sample[header]));
    });

    const prompt = `
Analyze this dataset for anomalies and outliers.

Dataset columns: ${headers.join(', ')}
Numeric columns to analyze: ${numericColumns.join(', ')}
Number of records: ${data.length}

Sample data:
${JSON.stringify(data.slice(0, 15), null, 2)}

Identify:
1. Unusual values or outliers
2. Unexpected patterns
3. Data quality issues

For each anomaly, specify:
- Which data point/column
- The unusual value
- Expected range
- Severity (low/medium/high)
- Brief explanation

Respond in JSON format:
{
  "anomalies": [
    {
      "dataPoint": "column name or description",
      "value": numeric value,
      "expectedRange": "expected range description",
      "severity": "low|medium|high",
      "explanation": "why this is anomalous"
    }
  ],
  "summary": "overall summary of data quality"
}
`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are a data quality analyst detecting anomalies.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.5,
      response_format: { type: 'json_object' }
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error('No response from AI');
    }

    const result = JSON.parse(content);

    return {
      anomalies: result.anomalies || [],
      summary: result.summary || 'No anomalies detected'
    };
  } catch (error) {
    console.error('Anomaly Detection Error:', error);
    throw new Error('Failed to detect anomalies');
  }
};

// Chart recommendation
export const recommendCharts = async (
  data: any[],
  headers: string[]
): Promise<string[]> => {
  try {
    const prompt = `
Given a dataset with these columns: ${headers.join(', ')}

Sample data:
${JSON.stringify(data.slice(0, 5), null, 2)}

Recommend the 3 most appropriate chart types for visualizing this data and explain why each would be useful.

Respond in JSON format:
{
  "recommendations": [
    "Chart type 1: Explanation",
    "Chart type 2: Explanation",
    "Chart type 3: Explanation"
  ]
}
`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are a data visualization expert.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' }
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error('No response from AI');
    }

    const result = JSON.parse(content);

    return result.recommendations || [];
  } catch (error) {
    console.error('Chart Recommendation Error:', error);
    throw new Error('Failed to recommend charts');
  }
};