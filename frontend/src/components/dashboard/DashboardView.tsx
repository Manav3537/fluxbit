import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDashboardStore } from '../../store/dashboardStore';
import { useCollaborationStore } from '../../store/collaborationStore';
import { useAnnotationStore } from '../../store/annotationStore';
import { useAuthStore } from '../../store/authStore';
import { ArrowLeft, MessageSquarePlus } from 'lucide-react';
import LineChart from '../charts/LineChart';
import BarChart from '../charts/BarChart';
import PieChart from '../charts/PieChart';
import socketService from '../../services/socket';
import Cursor from '../collaboration/Cursor';
import ActiveUsers from '../collaboration/ActiveUsers';
import AnnotationMarker from '../collaboration/AnnotationMarker';
import AnnotationForm from '../collaboration/AnnotationForm';
import DataUpload from './DataUpload';
import { Upload } from 'lucide-react';

const sampleData = [
  { month: 'Jan', revenue: 4000 },
  { month: 'Feb', revenue: 3000 },
  { month: 'Mar', revenue: 5000 },
  { month: 'Apr', revenue: 4500 },
  { month: 'May', revenue: 6000 },
  { month: 'Jun', revenue: 5500 },
];

const sampleBarData = [
  { product: 'Product A', sales: 4000 },
  { product: 'Product B', sales: 3000 },
  { product: 'Product C', sales: 5000 },
  { product: 'Product D', sales: 2780 },
];

const samplePieData = [
  { name: 'Desktop', value: 400 },
  { name: 'Mobile', value: 300 },
  { name: 'Tablet', value: 200 },
];

const getRandomColor = () => {
  const colors = [
    '#3b82f6', '#ef4444', '#10b981', '#f59e0b', 
    '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

const DashboardView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentDashboard, fetchDashboard, isLoading } = useDashboardStore();
  const { cursors, addUser, removeUser, updateCursor, reset } = useCollaborationStore();
  const { annotations, fetchAnnotations, createAnnotation, deleteAnnotation } = useAnnotationStore();
  const { user } = useAuthStore();
  const [cursorColors] = useState<Map<string, string>>(new Map());
  const [isAnnotationMode, setIsAnnotationMode] = useState(false);
  const [annotationForm, setAnnotationForm] = useState<{ x: number; y: number } | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);

  useEffect(() => {
    if (id) {
      fetchDashboard(parseInt(id));
      fetchAnnotations(parseInt(id));
    }
  }, [id, fetchDashboard, fetchAnnotations]);

  useEffect(() => {
    if (!id) return;

    const socket = socketService.connect();
    socketService.joinDashboard(parseInt(id));

    socketService.onUserJoin((data) => {
      console.log('User joined:', data.socketId);
      addUser(data.socketId);
      if (!cursorColors.has(data.socketId)) {
        cursorColors.set(data.socketId, getRandomColor());
      }
    });

    socketService.onUserLeave((data) => {
      console.log('User left:', data.socketId);
      removeUser(data.socketId);
    });

    socketService.onCursorMove((data) => {
      updateCursor(data.socketId, data.x, data.y);
      if (!cursorColors.has(data.socketId)) {
        cursorColors.set(data.socketId, getRandomColor());
      }
    });

    socketService.onDashboardUpdate((data) => {
      console.log('Dashboard updated:', data);
      fetchDashboard(parseInt(id));
    });

    socketService.getSocket()?.on('annotation:add', () => {
      fetchAnnotations(parseInt(id));
    });

    const handleMouseMove = (e: MouseEvent) => {
      socketService.moveCursor(parseInt(id), e.clientX, e.clientY);
    };

    const handleClick = (e: MouseEvent) => {
      if (isAnnotationMode) {
        setAnnotationForm({ x: e.clientX, y: e.clientY });
        setIsAnnotationMode(false);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('click', handleClick);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('click', handleClick);
      socketService.leaveDashboard(parseInt(id));
      socketService.disconnect();
      reset();
    };
  }, [id, isAnnotationMode, addUser, removeUser, updateCursor, reset, fetchDashboard, fetchAnnotations]);

  const handleAnnotationSubmit = async (content: string) => {
    if (!id || !annotationForm) return;

    try {
      await createAnnotation(parseInt(id), content, annotationForm.x, annotationForm.y);
      socketService.getSocket()?.emit('annotation:add', { dashboardId: parseInt(id) });
      setAnnotationForm(null);
    } catch (error) {
      console.error('Failed to create annotation:', error);
    }
  };

  const handleAnnotationDelete = async (annotationId: number) => {
    try {
      await deleteAnnotation(annotationId);
      socketService.getSocket()?.emit('annotation:delete', { dashboardId: parseInt(id!) });
    } catch (error) {
      console.error('Failed to delete annotation:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!currentDashboard) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Dashboard not found</p>
          <button
            onClick={() => navigate('/dashboards')}
            className="text-blue-600 hover:text-blue-700"
          >
            Back to dashboards
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {Array.from(cursors.values()).map((cursor) => (
        <Cursor
          key={cursor.socketId}
          x={cursor.x}
          y={cursor.y}
          color={cursorColors.get(cursor.socketId) || '#3b82f6'}
          label={cursor.socketId.substring(0, 6)}
        />
      ))}

      {annotations.map((annotation) => (
        <AnnotationMarker
          key={annotation.id}
          id={annotation.id}
          content={annotation.content}
          userEmail={annotation.user_email || 'Unknown'}
          xPos={annotation.x_pos}
          yPos={annotation.y_pos}
          createdAt={annotation.created_at}
          onDelete={handleAnnotationDelete}
          canDelete={annotation.user_id === user?.id}
        />
      ))}

      {annotationForm && (
        <AnnotationForm
          xPos={annotationForm.x}
          yPos={annotationForm.y}
          onSubmit={handleAnnotationSubmit}
          onCancel={() => setAnnotationForm(null)}
        />
      )}

      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/dashboards')}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mr-4"
              >
                <ArrowLeft size={20} />
                Back
              </button>
              <h1 className="text-xl font-semibold text-gray-900">
                {currentDashboard.name}
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsAnnotationMode(!isAnnotationMode)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  isAnnotationMode
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <MessageSquarePlus size={16} />
                {isAnnotationMode ? 'Click to Annotate' : 'Add Annotation'}
              </button>

              <button
                onClick={() => setShowUploadModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
              <Upload size={16} />
                Upload Data
              </button>

              <ActiveUsers />
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <LineChart
              data={sampleData}
              xKey="month"
              yKey="revenue"
              title="Monthly Revenue"
            />
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <BarChart
              data={sampleBarData}
              xKey="product"
              yKey="sales"
              title="Product Sales"
            />
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <PieChart
              data={samplePieData}
              nameKey="name"
              valueKey="value"
              title="Traffic Sources"
            />
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">Dashboard Info</h3>
            <div className="text-sm text-gray-600 space-y-2">
              <p><strong>Created:</strong> {new Date(currentDashboard.created_at).toLocaleString()}</p>
              <p><strong>Last Updated:</strong> {new Date(currentDashboard.updated_at).toLocaleString()}</p>
              <p><strong>Version:</strong> {currentDashboard.version}</p>
              <p><strong>Annotations:</strong> {annotations.length}</p>
            </div>
          </div>
        </div>
      </div>
      {showUploadModal && (
      <DataUpload
        dashboardId={parseInt(id!)}
        onUploadSuccess={() => {
          fetchDashboard(parseInt(id!));
        }}
        onClose={() => setShowUploadModal(false)}
      />
    )}
    </div>
  );
};

export default DashboardView;