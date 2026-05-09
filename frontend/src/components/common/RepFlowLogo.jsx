/**
 * RepFlow Through-Bar Logo (#10)
 * A barbell loaded across the "RepFlow" wordmark.
 * Used in Sidebar, LandingPage nav/footer, SignupPage, LoginPage.
 *
 * @param {boolean} showText - Show the "RepFlow" wordmark (default true). Set false for icon-only.
 * @param {number} height - Height of the logo in px (default 28).
 */
export default function RepFlowLogo({ showText = true, height = 28 }) {
  if (!showText) {
    // Icon-only: just the barbell (used at small sizes)
    return (
      <svg width={height} height={height} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Left plates */}
        <rect x="2" y="12" width="5" height="16" rx="1.5" fill="currentColor" />
        <rect x="8" y="8" width="6" height="24" rx="1.5" fill="currentColor" />
        {/* Bar */}
        <rect x="14" y="17" width="12" height="6" rx="1" fill="#C8FF3D" />
        {/* Right plates */}
        <rect x="26" y="8" width="6" height="24" rx="1.5" fill="#C8FF3D" />
        <rect x="33" y="12" width="5" height="16" rx="1.5" fill="#C8FF3D" />
      </svg>
    );
  }

  // Full Through-Bar wordmark
  const scale = height / 28;
  const width = Math.round(180 * scale);

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 180 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="RepFlow"
    >
      {/* "RepFlow" text */}
      <text
        x="24"
        y="21"
        fontFamily="'Inter Tight', 'Inter', sans-serif"
        fontSize="24"
        fontWeight="600"
        letterSpacing="-1"
        fill="currentColor"
      >
        RepFlow
      </text>

      {/* Barbell bar through the wordmark */}
      <rect x="4" y="11.5" width="172" height="3.5" rx="1" fill="#C8FF3D" />

      {/* Left collar + plate */}
      <rect x="4" y="8" width="8" height="12" rx="1.5" fill="#C8FF3D" />
      <rect x="13" y="9.5" width="5" height="9" rx="1" fill="#C8FF3D" />

      {/* Right collar + plate */}
      <rect x="163" y="9.5" width="5" height="9" rx="1" fill="#C8FF3D" />
      <rect x="169" y="8" width="8" height="12" rx="1.5" fill="#C8FF3D" />
    </svg>
  );
}
