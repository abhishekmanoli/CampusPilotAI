import React from 'react';

export const CuteGhostWithPumpkin: React.FC<{ className?: string; size?: number }> = ({ 
  className = '', 
  size = 140 
}) => {
  return (
    <div className={`relative inline-block cute-float select-none ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 160 160"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Soft magical glow */}
        <circle cx="80" cy="80" r="65" fill="#FFF0E5" fillOpacity="0.7" />

        {/* Floating Stars */}
        <path d="M25 45L27 50L32 52L27 54L25 59L23 54L18 52L23 50L25 45Z" fill="#FFB347" />
        <path d="M135 35L136.5 39L141 40L136.5 41.5L135 46L133.5 41.5L129 40L133.5 39L135 35Z" fill="#7C5CE7" fillOpacity="0.6" />
        <path d="M130 115L131.5 118L135 119.5L131.5 121L130 124L128.5 121L125 119.5L128.5 118L130 115Z" fill="#FF8A3D" />

        {/* Cute Smiling Ghost Body */}
        <path
          d="M80 28C56 28 42 45 42 72C42 102 46 122 52 122C57 122 60 114 66 114C72 114 74 122 80 122C86 122 88 114 94 114C100 114 103 122 108 122C114 122 118 102 118 72C118 45 104 28 80 28Z"
          fill="#FFFFFF"
          stroke="#F0EAF3"
          strokeWidth="3"
        />

        {/* Ghost Friendly Face */}
        {/* Big Happy Eyes */}
        <ellipse cx="68" cy="62" rx="4.5" ry="6" fill="#282433" />
        <ellipse cx="92" cy="62" rx="4.5" ry="6" fill="#282433" />
        {/* Eye sparkles */}
        <circle cx="66.5" cy="59.5" r="1.5" fill="#FFFFFF" />
        <circle cx="90.5" cy="59.5" r="1.5" fill="#FFFFFF" />

        {/* Rosy Cheeks */}
        <circle cx="61" cy="71" r="5" fill="#FFA5A5" fillOpacity="0.65" />
        <circle cx="99" cy="71" r="5" fill="#FFA5A5" fillOpacity="0.65" />

        {/* Sweet Smile */}
        <path
          d="M75 70C77 74 83 74 85 70"
          stroke="#282433"
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        {/* Cute Little Ghost Arms */}
        {/* Left Arm waving */}
        <path
          d="M45 74C34 70 30 78 37 84C41 87 46 82 46 80"
          fill="#FFFFFF"
          stroke="#F0EAF3"
          strokeWidth="2.5"
        />
        {/* Right Arm holding pumpkin */}
        <path
          d="M115 75C122 73 126 80 120 86C116 89 112 85 113 81"
          fill="#FFFFFF"
          stroke="#F0EAF3"
          strokeWidth="2.5"
        />

        {/* Little Cute Pumpkin held by Ghost */}
        {/* Stem */}
        <path d="M102 85C102 81 106 79 105 76" stroke="#48BB78" strokeWidth="3" strokeLinecap="round" />
        {/* Pumpkin Body */}
        <ellipse cx="95" cy="94" rx="9" ry="11" fill="#FF8A3D" />
        <ellipse cx="109" cy="94" rx="9" ry="11" fill="#FF8A3D" />
        <ellipse cx="102" cy="95" rx="11" ry="12" fill="#FFA35E" />
        {/* Pumpkin Face */}
        <polygon points="98,92 101,95 95,95" fill="#4A1E00" />
        <polygon points="106,92 109,95 103,95" fill="#4A1E00" />
        <path d="M98 100C100 103 104 103 106 100" stroke="#4A1E00" strokeWidth="2" strokeLinecap="round" />
      </svg>
    </div>
  );
};

export const CutePumpkinIcon: React.FC<{ className?: string; size?: number }> = ({ 
  className = '', 
  size = 28 
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Stem */}
      <path d="M16 5C16 3 18 2 17.5 1" stroke="#38A169" strokeWidth="2" strokeLinecap="round" />
      {/* Pumpkin Body */}
      <ellipse cx="11" cy="18" rx="8" ry="10" fill="#FF8A3D" />
      <ellipse cx="21" cy="18" rx="8" ry="10" fill="#FF8A3D" />
      <ellipse cx="16" cy="19" rx="9" ry="11" fill="#FFA35E" />
      {/* Friendly Eyes */}
      <circle cx="13" cy="17" r="1.5" fill="#282433" />
      <circle cx="19" cy="17" r="1.5" fill="#282433" />
      {/* Smile */}
      <path d="M14 21C15 23 17 23 18 21" stroke="#282433" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
};

export const CuteBatIcon: React.FC<{ className?: string; size?: number }> = ({ 
  className = '', 
  size = 24 
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M12 9C10 5 6 4 3 6C2 10 4 14 7 15C9 14 10 16 12 16C14 16 15 14 17 15C20 14 22 10 21 6C18 4 14 5 12 9Z"
        fill="#7C5CE7"
        fillOpacity="0.85"
      />
      <circle cx="10.5" cy="10" r="0.75" fill="#FFFFFF" />
      <circle cx="13.5" cy="10" r="0.75" fill="#FFFFFF" />
    </svg>
  );
};
