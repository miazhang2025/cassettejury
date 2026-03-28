'use client';

import React from 'react';

interface TopBarProps {
  onMenuClick: () => void;
  style?: React.CSSProperties;
}

export const TopBar: React.FC<TopBarProps> = ({ onMenuClick, style }) => {
  return (
    <div
      className="fixed top-0 left-0 w-full h-16 md:h-20 px-4 md:px-6 lg:px-12 flex items-center justify-between"
      style={style}
    >
      {/* Menu button */}
      <button
        onClick={onMenuClick}
        className="p-2 rounded-lg hover:bg-gray-200 transition mt-2 cursor-pointer"
        style={{ backgroundColor: 'transparent' }}
        aria-label="Open menu"
      >
        <img
          src="/menu.svg"
          alt="Menu"
          className="w-8 h-8 md:w-10 md:h-10"
        />
      </button>

      {/* Spacer */}

    </div>
  );
};
