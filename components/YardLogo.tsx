export function YardLogo({
  className,
}: {
  className?: string;
}) {
  // Uses currentColor so it automatically becomes black on yellow.
  return (
    <svg
      viewBox="0 0 640 220"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="The Yard logo"
      role="img"
    >
      {/* Ankh */}
      <g fill="currentColor">
        <path d="M320 20c-26 0-47 18-47 42 0 18 11 31 24 40-12 5-22 13-22 30v8h-38c-8 0-14 6-14 14s6 14 14 14h38v24c0 8 6 14 14 14s14-6 14-14v-24h34v24c0 8 6 14 14 14s14-6 14-14v-24h38c8 0 14-6 14-14s-6-14-14-14h-38v-8c0-17-10-25-22-30 13-9 24-22 24-40 0-24-21-42-47-42Zm0 28c11 0 19 7 19 14 0 13-10 22-19 28-9-6-19-15-19-28 0-7 8-14 19-14Z" />
      </g>

      {/* Wordmark */}
      <g fill="currentColor">
        <text
          x="320"
          y="165"
          textAnchor="middle"
          fontSize="84"
          fontWeight="900"
          letterSpacing="6"
          fontFamily="ui-serif, Georgia, 'Times New Roman', Times, serif"
        >
          YARD
        </text>
        <text
          x="320"
          y="110"
          textAnchor="middle"
          fontSize="18"
          fontWeight="800"
          letterSpacing="8"
          fontFamily="ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto"
        >
          THE
        </text>
      </g>

      {/* Thin underline accents */}
      <path
        d="M120 182h120M400 182h120"
        stroke="currentColor"
        strokeWidth="6"
        strokeLinecap="round"
        opacity="0.9"
      />
    </svg>
  );
}
