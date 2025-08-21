import React from 'react';
interface BracketTextProps {
  children: React.ReactNode;
  active?: boolean;
  className?: string;
}
export const BracketText: React.FC<BracketTextProps> = ({
  children,
  active = false,
  className = ''
}) => {
  return <div className={`flex items-center ${className}`}>
      <span className={`text-lg mr-1 ${active ? 'text-blue-500' : 'text-gray-400'}`}>
        [
      </span>
      <span>{children}</span>
      <span className={`text-lg ml-1 ${active ? 'text-blue-500' : 'text-gray-400'}`}>
        ]
      </span>
    </div>;
};