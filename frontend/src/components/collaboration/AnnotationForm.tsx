import React, { useState } from 'react';
import { X } from 'lucide-react';

interface AnnotationFormProps {
  xPos: number;
  yPos: number;
  onSubmit: (content: string) => void;
  onCancel: () => void;
}

const AnnotationForm: React.FC<AnnotationFormProps> = ({
  xPos,
  yPos,
  onSubmit,
  onCancel,
}) => {
  const [content, setContent] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim()) {
      onSubmit(content);
      setContent('');
    }
  };

  return (
    <div
      className="absolute z-50"
      style={{
        left: `${xPos}px`,
        top: `${yPos}px`,
        transform: 'translate(-50%, -50%)',
      }}
    >
      <div className="bg-white rounded-lg shadow-xl p-4 border border-gray-200 w-72">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-sm font-semibold text-gray-900">Add Annotation</h3>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
            <X size={16} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Enter your annotation..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            rows={3}
            autoFocus
          />
          <div className="flex gap-2 mt-3">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Add
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AnnotationForm;