/**
 * Audit Trail Component
 *
 * Shows history of all manual interventions in the simulation.
 */

'use client';

import { useState, useEffect } from 'react';
import { godMode } from '@/simulation/godMode/GodModeController';

export function AuditTrail() {
  const [auditLog, setAuditLog] = useState(godMode.getAuditLog());
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    // Refresh audit log periodically
    const interval = setInterval(() => {
      setAuditLog(godMode.getAuditLog());
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const filteredLog = filter === 'all'
    ? auditLog
    : auditLog.filter(entry => entry.category === filter);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'government':
        return 'text-blue-400';
      case 'ai':
        return 'text-purple-400';
      case 'society':
        return 'text-green-400';
      case 'environment':
        return 'text-emerald-400';
      case 'crisis':
        return 'text-red-400';
      case 'technology':
        return 'text-cyan-400';
      default:
        return 'text-white/60';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'government': return '🏛️';
      case 'ai': return '🤖';
      case 'society': return '🤝';
      case 'environment': return '🌍';
      case 'crisis': return '🚨';
      case 'technology': return '🔬';
      default: return '⚙️';
    }
  };

  return (
    <div className="space-y-4">
      {/* Filter Controls */}
      <div className="flex space-x-2 pb-4 border-b border-white/20">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1 text-xs uppercase tracking-wider rounded-sm
            transition-all duration-300
            ${filter === 'all'
              ? 'bg-cyan-400/20 text-cyan-400 border border-cyan-400/60'
              : 'text-white/40 border border-white/20 hover:border-white/40'
            }`}
        >
          ALL ({auditLog.length})
        </button>
        {['government', 'ai', 'society', 'environment', 'crisis', 'technology', 'meta'].map(cat => {
          const count = auditLog.filter(e => e.category === cat).length;
          if (count === 0) return null;

          return (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-3 py-1 text-xs uppercase tracking-wider rounded-sm
                transition-all duration-300 flex items-center space-x-1
                ${filter === cat
                  ? 'bg-cyan-400/20 text-cyan-400 border border-cyan-400/60'
                  : 'text-white/40 border border-white/20 hover:border-white/40'
                }`}
            >
              <span>{getCategoryIcon(cat)}</span>
              <span>{cat} ({count})</span>
            </button>
          );
        })}
      </div>

      {/* Clear Button */}
      <div className="flex justify-end">
        <button
          onClick={() => {
            godMode.clearAuditLog();
            setAuditLog([]);
          }}
          className="px-3 py-1 text-xs uppercase tracking-wider
            text-red-400/60 border border-red-400/40 rounded-sm
            hover:text-red-400 hover:border-red-400/60
            transition-all duration-300"
        >
          Clear Audit Log
        </button>
      </div>

      {/* Audit Entries */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {filteredLog.length === 0 ? (
          <div className="text-center py-8 text-white/30">
            No audit entries yet
          </div>
        ) : (
          filteredLog.reverse().map((entry, index) => (
            <div
              key={`${entry.timestamp}-${index}`}
              className="p-3 border border-white/10 rounded-sm bg-black/30
                hover:border-white/20 transition-all duration-300"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* Header */}
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-lg opacity-60">{getCategoryIcon(entry.category)}</span>
                    <span className={`text-xs uppercase tracking-wider ${getCategoryColor(entry.category)}`}>
                      {entry.category}
                    </span>
                    <span className="text-xs text-white/30">
                      Month {entry.month >= 0 ? entry.month : '—'}
                    </span>
                  </div>

                  {/* Decision Path */}
                  <div className="text-sm font-mono text-white/60 mb-1">
                    {entry.decision}
                  </div>

                  {/* Value Change */}
                  <div className="flex items-center space-x-2 text-xs">
                    <span className="text-white/40">Old:</span>
                    <span className="text-red-400/60">{JSON.stringify(entry.oldValue)}</span>
                    <span className="text-white/20">→</span>
                    <span className="text-white/40">New:</span>
                    <span className="text-green-400/60">{JSON.stringify(entry.newValue)}</span>
                  </div>
                </div>

                {/* Timestamp */}
                <div className="text-xs text-white/20 font-mono">
                  {new Date(entry.timestamp).toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Stats */}
      {auditLog.length > 0 && (
        <div className="pt-4 border-t border-white/20">
          <div className="grid grid-cols-3 gap-4 text-xs">
            <div>
              <span className="text-white/40">Total Interventions:</span>
              <span className="text-white/60 ml-2">{auditLog.length}</span>
            </div>
            <div>
              <span className="text-white/40">Most Modified:</span>
              <span className="text-white/60 ml-2">
                {(() => {
                  const counts = auditLog.reduce((acc, entry) => {
                    acc[entry.category] = (acc[entry.category] || 0) + 1;
                    return acc;
                  }, {} as Record<string, number>);
                  const max = Object.entries(counts).reduce((a, b) => counts[a[0]] > counts[b[0]] ? a : b);
                  return max ? `${max[0]} (${max[1]})` : '—';
                })()}
              </span>
            </div>
            <div>
              <span className="text-white/40">Active Overrides:</span>
              <span className="text-cyan-400/60 ml-2">
                {godMode['overrides']?.size || 0}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}