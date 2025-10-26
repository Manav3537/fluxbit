import React from 'react';
import { MessageSquare, X } from 'lucide-react';

interface AnnotationMarkerProps {
  id: number;
  content: string;
  userEmail: string;
  xPos: number;
  yPos: number;
  createdAt: string;
  onDelete?: (id: number) => void;
  canDelete: boolean;
}

const AnnotationMarker: React.FC<AnnotationMarkerProps> = ({
  id,
  content,
  userEmail,
  xPos,
  yPos,
  createdAt,
  onDelete,
  canDelete,
}) => {
  const [isExpanded, setIsExpanded] = React.useState(false);

  return (
    <div
      className="absolute z-40"
      style={{
        left: `${xPos}px`,
        top: `${yPos}px`,
        transform: 'translate(-50%, -50%)',
      }}
    >
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="bg-yellow-400 hover:bg-yellow-500 rounded-full p-2 shadow-lg transition-all"
      >
        <MessageSquare size={16} className="text-yellow-900" />
      </button>

      {isExpanded && (
        <div className="absolute left-8 top-0 w-64 bg-white rounded-lg shadow-xl p-4 border border-gray-200">
          <div className="flex justify-between items-start mb-2">
            <div className="flex-1">
              <p className="text-xs font-semibold text-gray-700">{userEmail}</p>
              <p className="text-xs text-gray-500">
                {new Date(createdAt).toLocaleString()}
              </p>
            </div>
            {canDelete && onDelete && (
              <button
                onClick={() => onDelete(id)}
                className="text-gray-400 hover:text-red-600"
              >
                <X size={16} />
              </button>
            )}
          </div>
          <p className="text-sm text-gray-800">{content}</p>
        </div>
      )}
    </div>
  );
};

export default AnnotationMarker;