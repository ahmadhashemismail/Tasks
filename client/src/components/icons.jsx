/**
 * TaskFlow icon set — small stroke icons that inherit `currentColor`,
 * so they adopt the text color of badges / buttons / links in both
 * themes. These replace the emoji glyphs previously used everywhere.
 */
function Svg({ size = 20, className = "", ...props }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      focusable="false"
      {...props}
    />
  );
}

export const Logo = (props) => (
  <Svg {...props}>
    <circle cx="10" cy="10" r="7.5" />
    <path d="M7 11l2 2 4-4" />
  </Svg>
);

export const Home = (props) => (
  <Svg {...props}>
    <path d="M3 11L10 5l7 6v9a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
  </Svg>
);

export const Clipboard = (props) => (
  <Svg {...props}>
    <rect x="3" y="5" width="14" height="14" rx="2" />
    <path d="M9 1h2a2 2 0 012 2v2H7V3a2 2 0 012-2z" />
  </Svg>
);

export const Check = (props) => (
  <Svg {...props}>
    <path d="M5 11l5 5 9-9" />
  </Svg>
);

export const Circle = (props) => (
  <Svg {...props}>
    <circle cx="10" cy="10" r="8" />
  </Svg>
);

export const Clock = (props) => (
  <Svg {...props}>
    <circle cx="10" cy="10" r="8" />
    <path d="M10 6v4l2 2" />
  </Svg>
);

export const List = (props) => (
  <Svg {...props}>
    <path d="M7 6h10M7 11h10M7 16h10" />
  </Svg>
);

export const Plus = (props) => (
  <Svg {...props}>
    <path d="M10 5v10M5 10h10" />
  </Svg>
);

export const Edit = (props) => (
  <Svg {...props}>
    <path d="M14.3 3.3a2.5 2.5 0 0 1 3.5 0l1.2 1.2a2.5 2.5 0 0 1 0 3.5l-9.5 9.5-5 1.5 1.5-5 9.5-9.5a2.5 2.5 0 0 1 3.5-.3z" />
  </Svg>
);

export const Trash = (props) => (
  <Svg {...props}>
    <path d="M6 7h12M9 7V3a2 2 0 012-2h2a2 2 0 012 2v3m-8 0l-1 9a2 2 0 01-2 2H6a2 2 0 01-2-2l-1-9m7-4H9a1 1 0 00-1 1v1h4V4a1 1 0 00-1-1z" />
  </Svg>
);

export const Clear = (props) => (
  <Svg {...props}>
    <circle cx="10" cy="10" r="8" />
    <path d="M7 7l6 6M13 7l-6 6" />
  </Svg>
);

export const ArrowLeft = (props) => (
  <Svg {...props}>
    <path d="M7 15l-5-5 5-5" />
    <path d="M4 10h14" />
  </Svg>
);

export const ArrowRight = (props) => (
  <Svg {...props}>
    <path d="M13 5l7 7-7 7" />
    <path d="M4 12h14" />
  </Svg>
);

export const Save = (props) => (
  <Svg {...props}>
    <path d="M6 2h8l4 4v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2z" />
    <path d="M15 2v5H9V2" />
  </Svg>
);
