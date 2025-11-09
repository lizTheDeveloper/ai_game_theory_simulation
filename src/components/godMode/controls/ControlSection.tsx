/**
 * Control Section Component
 *
 * Container for grouping related controls with a header.
 */

'use client';

interface ControlSectionProps {
  title: string;
  icon?: string;
  children: React.ReactNode;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function ControlSection({
  title,
  icon,
  children,
  collapsed = false,
  onToggleCollapse
}: ControlSectionProps) {
  return (
    <div className="border border-white/20 rounded-sm bg-black/50 backdrop-blur-sm
      hover:border-cyan-400/30 transition-all duration-300">
      {/* Header */}
      <div
        className={`px-4 py-3 border-b border-white/10 flex items-center justify-between
          ${onToggleCollapse ? 'cursor-pointer hover:bg-white/5' : ''}`}
        onClick={onToggleCollapse}
      >
        <div className="flex items-center space-x-3">
          {icon && <span className="text-xl opacity-60">{icon}</span>}
          <h3 className="text-sm font-light uppercase tracking-widest text-white/80">
            {title}
          </h3>
        </div>

        {onToggleCollapse && (
          <button
            className="text-white/40 hover:text-white/60 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              onToggleCollapse();
            }}
          >
            <svg
              className={`w-4 h-4 transition-transform duration-200 ${collapsed ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        )}
      </div>

      {/* Content */}
      {!collapsed && (
        <div className="p-4">
          {children}
        </div>
      )}
    </div>
  );
}