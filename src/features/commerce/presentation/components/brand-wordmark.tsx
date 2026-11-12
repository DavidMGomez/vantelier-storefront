export function BrandSymbol({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 30 25"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M0 0h9l2.5 7.1L4 10Z" />
      <path d="m5.1 12.9 7.4-2.9 2.5 7L21 0h9L20 25H10Z" />
      <path
        className="brand-wordmark-accent"
        d="m4.4 11.1 7.5-2.9.3.9-7.5 2.9Z"
      />
    </svg>
  );
}
export function BrandWordmark({
  registered = false,
}: {
  registered?: boolean;
}) {
  return (
    <span className="brand-wordmark" role="img" aria-label="Vantelier">
      <BrandSymbol className="brand-wordmark-v" />
      <span aria-hidden="true">ANTELIER</span>
      {registered && <sup aria-hidden="true">®</sup>}
    </span>
  );
}
