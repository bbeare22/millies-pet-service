type PawIconProps = {
  className?: string;
};

export default function PawIcon({
  className = "h-5 w-5 text-brand-dark",
}: PawIconProps) {
  return (
    <svg
      viewBox="0 0 64 64"
      aria-hidden="true"
      className={className}
      fill="currentColor"
    >
      {/* Toes */}
      <circle cx="20" cy="18" r="6" />
      <circle cx="32" cy="14" r="6" />
      <circle cx="44" cy="18" r="6" />
      <circle cx="26" cy="30" r="7" />
      <circle cx="38" cy="30" r="7" />
      {/* Main pad */}
      <path d="M22 38c0 6 5 11 10 11s10-5 10-11c0-4-3-7-10-7s-10 3-10 7z" />
    </svg>
  );
}
