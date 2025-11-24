'use client';

import React from 'react';
import styles from './game-dashboard.module.css';

export interface Event {
  id: string;
  text: string;
  severity: 'critical' | 'warning' | 'success' | 'info';
}

export interface EventStreamProps {
  events: Event[];
  nextMonthPreview: string[];
}

/**
 * Right panel showing event stream and next month preview
 */
export function EventStream({ events, nextMonthPreview }: EventStreamProps) {
  const getEventClass = (severity: Event['severity']) => {
    switch (severity) {
      case 'critical':
        return styles.eventCritical;
      case 'warning':
        return styles.eventWarning;
      case 'success':
        return styles.eventSuccess;
      default:
        return '';
    }
  };

  const getEventIcon = (severity: Event['severity']) => {
    switch (severity) {
      case 'critical':
      case 'warning':
        return '⚠';
      case 'success':
        return '✓';
      default:
        return '';
    }
  };

  return (
    <div className={styles.eventStream}>
      <div className={styles.streamHeader}>
        <div className={styles.streamTitle}>Event Stream</div>
      </div>

      {/* Next Month Preview */}
      <div className={styles.nextMonthPreview}>
        <div className={styles.previewTitle}>Coming Next Month</div>
        {nextMonthPreview.map((item, index) => (
          <div
            key={index}
            className={styles.previewItem}
            style={item.includes('crisis') || item.includes('⚠') ? { color: '#FFB000' } : {}}
          >
            • {item}
          </div>
        ))}
      </div>

      {/* Recent Events */}
      <div className={styles.eventsList}>
        {events.map((event) => (
          <div
            key={event.id}
            className={`${styles.eventItem} ${getEventClass(event.severity)}`}
          >
            {getEventIcon(event.severity)} {event.text}
          </div>
        ))}
      </div>
    </div>
  );
}