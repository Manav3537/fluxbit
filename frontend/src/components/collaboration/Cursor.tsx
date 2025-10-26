import React from 'react';
import { MousePointer } from 'lucide-react';

interface CursorProps {
  x: number;
  y: number;
  color: string;
  label?: string;
}

const Cursor: React.FC<CursorProps> = ({ x, y, color, label }) => {
  return (
    <div
      className="fixed pointer-events-none z-50 transition-all duration-100"
      style={{
        left: `${x}px`,
        top: `${y}px`,
        transform: 'translate(-2px, -2px)',
      }}
    >
      <MousePointer
        size={20}
        fill={color}
        color={color}
        className="drop-shadow-md"
      />
      {label && (
        <div
          className="mt-1 px-2 py-1 rounded text-xs text-white whitespace-nowrap"
          style={{ backgroundColor: color }}
        >
          {label}
        </div>
      )}
    </div>
  );
};

export default Cursor;