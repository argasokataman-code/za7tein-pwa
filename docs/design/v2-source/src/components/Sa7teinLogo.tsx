import React from 'react';

interface Sa7teinLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  textColor?: string;
  haColor?: string;
}

export const Sa7teinLogo: React.FC<Sa7teinLogoProps> = ({
  className = '',
  size = 'md',
  textColor = '#FFFFFF',
  haColor = '#1D648B',
}) => {
  // Height presets
  const heightMap = {
    sm: 30,
    md: 40,
    lg: 52,
    xl: 64,
  };

  const height = heightMap[size] || 40;
  const width = Math.round(height * 3.8); // Aspect ratio ~ 3.8 : 1

  return (
    <div className={`inline-flex items-center select-none ${className}`}>
      <svg
        viewBox="0 0 455 125"
        width={width}
        height={height}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="overflow-visible"
        aria-label="sa7tein logo"
      >
        {/* Letter 's' */}
        <path
          d="M 58 48 C 58 37, 49 33, 39 33 C 27 33, 20 40, 20 49 C 20 59, 28 64, 38 67 C 50 70, 58 75, 58 86 C 58 97, 48 103, 36 103 C 24 103, 16 96, 16 85"
          stroke={textColor}
          strokeWidth="13.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Letter 'a' */}
        {/* 'a' vertical stem */}
        <path
          d="M 124 38 L 124 101"
          stroke={textColor}
          strokeWidth="13.5"
          strokeLinecap="round"
        />
        {/* 'a' round circular bowl */}
        <path
          d="M 124 55 C 117 41, 102 33, 87 33 C 69 33, 56 47, 56 68 C 56 89, 69 103, 87 103 C 102 103, 117 95, 124 81"
          stroke={textColor}
          strokeWidth="13.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* The iconic Arabic letter 'ح' (ha / 7) in petroleum blue #1D648B */}
        {/* Upper closed triangular ribbon loop + lower sweeping crescent tail */}
        <path
          d="M 166 56
             C 152 28, 150 14, 166 14
             C 178 14, 196 14, 202 24
             C 208 34, 196 46, 166 56
             C 182 66, 188 78, 184 94
             C 178 110, 158 118, 134 116
             C 124 115, 116 112, 112 110"
          stroke={haColor}
          strokeWidth="13.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Letter 't' */}
        {/* 't' vertical stem and bottom right hook */}
        <path
          d="M 230 18 L 230 92 C 230 100, 237 103, 248 101"
          stroke={textColor}
          strokeWidth="13.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* 't' crossbar */}
        <path
          d="M 214 36 L 247 36"
          stroke={textColor}
          strokeWidth="13.5"
          strokeLinecap="round"
        />

        {/* Letter 'e' */}
        {/* 'e' horizontal bar and circular contour */}
        <path
          d="M 265 68 L 306 68 C 306 48, 296 33, 283 33 C 267 33, 256 47, 256 68 C 256 89, 267 103, 283 103 C 298 103, 306 94, 306 85"
          stroke={textColor}
          strokeWidth="13.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Letter 'i' */}
        {/* 'i' dot */}
        <circle
          cx="338"
          cy="23"
          r="7.5"
          fill={textColor}
        />
        {/* 'i' stem */}
        <path
          d="M 338 50 L 338 101"
          stroke={textColor}
          strokeWidth="13.5"
          strokeLinecap="round"
        />

        {/* Letter 'n' */}
        {/* 'n' left stem */}
        <path
          d="M 372 40 L 372 101"
          stroke={textColor}
          strokeWidth="13.5"
          strokeLinecap="round"
        />
        {/* 'n' curved arch and right stem */}
        <path
          d="M 372 58 C 382 42, 396 33, 408 33 C 420 33, 428 42, 428 58 L 428 101"
          stroke={textColor}
          strokeWidth="13.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};

