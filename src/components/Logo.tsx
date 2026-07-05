export default function Logo({ size = 32 }: { size?: number }) {
  return (
    <div className="flex items-center gap-2">
      <svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Book spine */}
        <rect x="4" y="6" width="32" height="28" rx="2" stroke="#1e40af" strokeWidth="2" fill="white" />
        {/* Book pages left */}
        <rect x="7" y="9" width="13" height="22" rx="1" fill="#dbeafe" />
        {/* Book pages right */}
        <rect x="20" y="9" width="13" height="22" rx="1" fill="#bfdbfe" />
        {/* Spine line */}
        <line x1="19" y1="8" x2="19" y2="32" stroke="#1e40af" strokeWidth="1.5" />
        {/* Letter M on left page */}
        <path d="M10 25V16L13 20L16 16V25" stroke="#1e40af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        {/* Small bookmark */}
        <path d="M30 12L33 14L36 12V28H30V12Z" stroke="#1e40af" strokeWidth="1.5" fill="#fef08a" />
      </svg>
      <span className="text-lg font-bold text-slate-800">Librería María</span>
    </div>
  );
}
