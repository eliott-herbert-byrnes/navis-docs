import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export default function favicon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 24,
          background: 'white',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 0,
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="100%"
          height="100%"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* LucideShip SVG path */}
          <path d="M2 21c.6.5 1.6 1 3 1h14c1.4 0 2.4-.5 3-1M3 7h18M3 7c0-1 .75-2 2-2h14c1.25 0 2 1 2 2M3 7v10c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V7M8 7v10M12 7v10M16 7v10" />
        </svg>
      </div>
    ),
    {
      width: 32,
      height: 32,
    },
  );
}