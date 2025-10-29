import React, { useEffect, useState } from 'react';
import { FileSpreadsheet, Trash2 } from 'lucide-react';
import api from '../../services/api';

interface DataSource {
  id: number;
  name: string;
  type: string;
  metadata: {
    rowCount: number;
    headers: string[];
  };
  created_at: string;
}

interface DataSourceListProps {
  dashboardId: number;
  onSelectDataSource: (id: number) => void;
  selectedDataSourceId: number | null;
}

const DataSourceList: React.FC<DataSourceListProps> = ({
  dashboardId,
  onSelectDataSource,
  selectedDataSourceId
}) => {
  const [dataSources, setDataSources] = useState<DataSource[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadDataSources();
  }, [dashboardId]);

  const loadDataSources = async () => {
    setIsLoading(true);
    try {
      const response = await api.get(`/data/sources/${dashboardId}`);
      setDataSources(response.data.dataSources);
    } catch (error) {
      console.error('Failed to load data sources:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
  if (!window.confirm('Are you sure you want to delete this data source?')) {
    return;
  }

  try {
    await api.delete(`/data/source/${id}`);
    const remainingDataSources = dataSources.filter(ds => ds.id !== id);
    setDataSources(remainingDataSources);
    
    if (selectedDataSourceId === id) {
      const nextDataSource = remainingDataSources[0];
      if (nextDataSource) {
        onSelectDataSource(nextDataSource.id);
      }
    }
  } catch (error) {
    console.error('Failed to delete data source:', error);
  }
};

  if (isLoading) {
    return <div className="text-center py-4 text-gray-500">Loading...</div>;
  }

  if (dataSources.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <FileSpreadsheet size={48} className="mx-auto mb-2 text-gray-400" />
        <p>No data sources yet. Upload a file to get started.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">Data Sources</h3>
      {dataSources.map((ds) => (
        <div
          key={ds.id}
          onClick={() => onSelectDataSource(ds.id)}
          className={`p-3 rounded-lg border cursor-pointer transition-all ${
            selectedDataSourceId === ds.id
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3 flex-1">
              <FileSpreadsheet size={20} className="text-blue-600 mt-1" />
              <div className="flex-1">
                <h4 className="font-medium text-gray-900 text-sm">{ds.name}</h4>
                <p className="text-xs text-gray-500 mt-1">
                  {ds.metadata.rowCount} rows • {ds.metadata.headers.length} columns
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(ds.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(ds.id);
              }}
              className="text-gray-400 hover:text-red-600 p-1"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DataSourceList;