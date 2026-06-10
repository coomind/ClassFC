function JerseyIcon({ number, color, size }) {
  const lineColor = color || "#ffffff";
  const iconSize = size || 100;

  return (
    <svg
      width={iconSize}
      height={iconSize}
      viewBox="0 0 100 100"
      className="jersey-icon"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* 유니폼 외곽선 */}
      <path
        d="M 35 8 C 40 16 60 16 65 8 L 73 12 L 93 22 L 95 38 L 80 40 L 80 90 L 20 90 L 20 40 L 5 38 L 7 22 L 27 12 Z"
        fill="none"
        stroke={lineColor}
        strokeWidth="3"
        strokeLinejoin="round"
        strokeLinecap="round"
      />

      <line
        x1="22"
        y1="83"
        x2="78"
        y2="83"
        stroke={lineColor}
        strokeWidth="2"
      />

      {/* 등번호 */}
      <text
        x="50"
        y="60"
        textAnchor="middle"
        fontFamily="'NEXON Football Gothic', sans-serif"
        fontWeight="800"
        fontSize="34"
        fill={lineColor}
      >
        {number}
      </text>
    </svg>
  );
}

export default JerseyIcon;
