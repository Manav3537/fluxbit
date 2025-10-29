import React, { useState } from 'react';
import { Sparkles, TrendingUp, AlertTriangle, BarChart3, Loader2 } from 'lucide-react';
import api from '../../services/api';

interface AIQueryPanelProps {
  dataSourceId: number | null;
  onClose: () => void;
}

interface Insight {
  insights: string[];
  recommendations: string[];
}

interface Anomaly {
  anomalies: Array<{
    dataPoint: string;
    value: number;
    expectedRange: string;
    severity: 'low' | 'medium' | 'high';
    explanation: string;
  }>;
  summary: string;
}

const AIQueryPanel: React.FC<AIQueryPanelProps> = ({ dataSourceId, onClose }) => {
  const [activeTab, setActiveTab] = useState<'query' | 'insights' | 'anomalies' | 'charts'>('query');
  const [query, setQuery] = useState('');
  const [queryResult, setQueryResult] = useState<any>(null);
  const [insights, setInsights] = useState<Insight | null>(null);
  const [anomalies, setAnomalies] = useState<Anomaly | null>(null);
  const [chartRecs, setChartRecs] = useState<string[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleQuery = async () => {
    if (!dataSourceId || !query.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await api.post('/ai/query', {
        dataSourceId,
        query
      });
      setQueryResult(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to process query');
    } finally {
      setIsLoading(false);
    }
  };

  const loadInsights = async () => {
    if (!dataSourceId) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await api.get(`/ai/insights/${dataSourceId}`);
      setInsights(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to generate insights');
    } finally {
      setIsLoading(false);
    }
  };

  const loadAnomalies = async () => {
    if (!dataSourceId) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await api.get(`/ai/anomalies/${dataSourceId}`);
      setAnomalies(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to detect anomalies');
    } finally {
      setIsLoading(false);
    }
  };

  const loadChartRecommendations = async () => {
    if (!dataSourceId) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await api.get(`/ai/chart-recommendations/${dataSourceId}`);
      setChartRecs(response.data.recommendations);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to get recommendations');
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    if (activeTab === 'insights' && !insights) {
      loadInsights();
    } else if (activeTab === 'anomalies' && !anomalies) {
      loadAnomalies();
    } else if (activeTab === 'charts' && !chartRecs) {
      loadChartRecommendations();
    }
  }, [activeTab]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  if (!dataSourceId) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <p className="text-gray-500 text-center">Please upload data first to use AI features</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="border-b border-gray-200">
        <nav className="flex -mb-px">
          <button
            onClick={() => setActiveTab('query')}
            className={`px-6 py-4 text-sm font-medium border-b-2 ${
              activeTab === 'query'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <Sparkles size={16} />
              Natural Language Query
            </div>
          </button>
          <button
            onClick={() => setActiveTab('insights')}
            className={`px-6 py-4 text-sm font-medium border-b-2 ${
              activeTab === 'insights'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <TrendingUp size={16} />
              Insights
            </div>
          </button>
          <button
            onClick={() => setActiveTab('anomalies')}
            className={`px-6 py-4 text-sm font-medium border-b-2 ${
              activeTab === 'anomalies'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <AlertTriangle size={16} />
              Anomalies
            </div>
          </button>
          <button
            onClick={() => setActiveTab('charts')}
            className={`px-6 py-4 text-sm font-medium border-b-2 ${
              activeTab === 'charts'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <BarChart3 size={16} />
              Chart Suggestions
            </div>
          </button>
        </nav>
      </div>

      <div className="p-6">
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-600">
            {error}
          </div>
        )}

        {activeTab === 'query' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ask a question about your data
              </label>
              <textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g., What are the trends in revenue over time?"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
            </div>
            <button
              onClick={handleQuery}
              disabled={isLoading || !query.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  Ask AI
                </>
              )}
            </button>

            {queryResult && (
              <div className="mt-6 space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">Explanation:</h4>
                  <p className="text-gray-700">{queryResult.explanation}</p>
                </div>

                {queryResult.insights && queryResult.insights.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Insights:</h4>
                    <ul className="space-y-2">
                      {queryResult.insights.map((insight: string, index: number) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-blue-600 mt-1">•</span>
                          <span className="text-gray-700">{insight}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'insights' && (
          <div>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 size={32} className="animate-spin text-blue-600" />
              </div>
            ) : insights ? (
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <TrendingUp size={20} className="text-blue-600" />
                    Key Insights
                  </h4>
                  <ul className="space-y-3">
                    {insights.insights.map((insight, index) => (
                      <li key={index} className="p-3 bg-blue-50 rounded-lg text-gray-700">
                        {insight}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Recommendations</h4>
                  <ul className="space-y-3">
                    {insights.recommendations.map((rec, index) => (
                      <li key={index} className="p-3 bg-green-50 rounded-lg text-gray-700 flex items-start gap-2">
                        <span className="text-green-600 font-bold">→</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : null}
          </div>
        )}

        {activeTab === 'anomalies' && (
          <div>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 size={32} className="animate-spin text-blue-600" />
              </div>
            ) : anomalies ? (
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-700">{anomalies.summary}</p>
                </div>

                {anomalies.anomalies.length > 0 ? (
                  <div className="space-y-3">
                    {anomalies.anomalies.map((anomaly, index) => (
                      <div
                        key={index}
                        className={`p-4 rounded-lg border ${getSeverityColor(anomaly.severity)}`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h5 className="font-semibold">{anomaly.dataPoint}</h5>
                          <span className="text-xs font-medium px-2 py-1 rounded-full uppercase">
                            {anomaly.severity}
                          </span>
                        </div>
                        <p className="text-sm mb-2">
                          <strong>Value:</strong> {anomaly.value}
                        </p>
                        <p className="text-sm mb-2">
                          <strong>Expected Range:</strong> {anomaly.expectedRange}
                        </p>
                        <p className="text-sm">{anomaly.explanation}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-4">No anomalies detected</p>
                )}
              </div>
            ) : null}
          </div>
        )}

        {activeTab === 'charts' && (
  <div>
    {isLoading ? (
      <div className="flex items-center justify-center py-8">
        <Loader2 size={32} className="animate-spin text-blue-600" />
      </div>
    ) : chartRecs ? (
      <div className="space-y-3">
        <h4 className="font-semibold text-gray-900 mb-3">Recommended Visualizations</h4>
        {chartRecs.map((rec, index) => {
          if (typeof rec === 'string') {
            return (
              <div key={index} className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <p className="text-gray-700">{rec}</p>
              </div>
            );
          } else if (typeof rec === 'object' && rec !== null) {
            const chartRec = rec as any;
            return (
              <div key={index} className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <h5 className="font-semibold text-purple-900 mb-2">
                  {chartRec.chart_type || chartRec.chartType || 'Chart Recommendation'}
                </h5>
                <p className="text-gray-700">
                  {chartRec.explanation || chartRec.reason || JSON.stringify(chartRec)}
                </p>
              </div>
            );
          }
          return null;
        })}
      </div>
    ) : null}
  </div>
)}
      </div>
    </div>
  );
};

export default AIQueryPanel;