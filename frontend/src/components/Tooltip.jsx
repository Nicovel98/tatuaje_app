

/**
 * Simple tooltip component that shows a small info icon with a hover title.
 * It also provides an accessible `aria-label` for screen readers.
 */
export const Tooltip = ({ text, children }) => (
  <span className="tooltip" aria-label={text} title={text} style={{ cursor: 'help', display: 'inline-flex', alignItems: 'center' }}>
    {children}
    <span style={{ marginLeft: 4, fontSize: '0.85rem', color: 'var(--accent-color)' }}>ℹ️</span>
  </span>
);
