import React from 'react';
import { Users } from 'lucide-react';
import { useCollaborationStore } from '../../store/collaborationStore';

const ActiveUsers: React.FC = () => {
  const { connectedUsers } = useCollaborationStore();

  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg shadow-sm">
      <Users size={16} className="text-gray-600" />
      <span className="text-sm text-gray-700">
        {connectedUsers.size + 1} active
      </span>
    </div>
  );
};

export default ActiveUsers;