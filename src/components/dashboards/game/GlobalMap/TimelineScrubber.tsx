'use client';

import React, { useCallback, useRef, useState, useEffect, useMemo } from 'react';
import styles from './GlobalMap.module.css';
import type {
  TimelineScrubberProps,
  TimelineEvent,
  TickMark,
  TimelineEventType,
} from './types';

/**
 * Generate default tick marks for the timeline
 */
function generateTickMarks(totalMonths: number): TickMark[] {
  const ticks: TickMark[] = [];
  const majorInterval = 30; // Major tick every 30 months (2.5 years)

  for (let month = 0; month <= totalMonths; month += 10) {
    const isMajor = month % majorInterval === 0;
    ticks.push({
      month,
      isMajor,
      label: isMajor ? String(month) : undefined,
    });
  }

  return ticks;
}

/**
 * Get event marker class based on type
 */
function getEventMarkerClass(type: TimelineEventType): string {
  switch (type) {
    case 'crisis':
      return styles.eventMarkerCrisis;
    case 'breakthrough':
      return styles.eventMarkerBreakthrough;
    case 'normal':
    default:
      return styles.eventMarkerNormal;
  }
}

/**
 * TimelineScrubber - Historical timeline with draggable marker
 *
 * Provides timeline navigation with:
 * - Draggable position marker
 * - Year/month tick marks
 * - Event markers (crises, breakthroughs)
 * - Play/pause controls
 * - Speed adjustment
 * - Compare mode button
 *
 * Far-future aesthetic with glowing marker and smooth animations.
 */
export function TimelineScrubber({
  currentMonth,
  totalMonths,
  events = [],
  tickMarks,
  isPlaying = false,
  playbackSpeed = 1,
  onPositionChange,
  onPlayToggle,
  onSpeedChange,
  onCompare,
}: TimelineScrubberProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragPosition, setDragPosition] = useState<number | null>(null);

  // Generate tick marks if not provided
  const ticks = useMemo(
    () => tickMarks || generateTickMarks(totalMonths),
    [tickMarks, totalMonths]
  );

  // Calculate marker position as percentage
  const markerPosition = useMemo(() => {
    const position = dragPosition ?? currentMonth;
    return (position / totalMonths) * 100;
  }, [currentMonth, totalMonths, dragPosition]);

  // Handle mouse down on marker
  const handleMarkerMouseDown = useCallback((event: React.MouseEvent) => {
    event.preventDefault();
    setIsDragging(true);
  }, []);

  // Handle mouse move during drag
  useEffect(() => {
    if (!isDragging) return;

    function handleMouseMove(event: MouseEvent) {
      if (!trackRef.current) return;

      const rect = trackRef.current.getBoundingClientRect();
      const trackWidth = rect.width - 20; // Account for padding
      let x = event.clientX - rect.left - 10;
      x = Math.max(0, Math.min(x, trackWidth));

      const month = Math.round((x / trackWidth) * totalMonths);
      setDragPosition(month);
    }

    function handleMouseUp() {
      if (dragPosition !== null) {
        onPositionChange?.(dragPosition);
      }
      setIsDragging(false);
      setDragPosition(null);
    }

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragPosition, totalMonths, onPositionChange]);

  // Handle track click
  const handleTrackClick = useCallback(
    (event: React.MouseEvent) => {
      if (!trackRef.current) return;

      const rect = trackRef.current.getBoundingClientRect();
      const trackWidth = rect.width - 20;
      let x = event.clientX - rect.left - 10;
      x = Math.max(0, Math.min(x, trackWidth));

      const month = Math.round((x / trackWidth) * totalMonths);
      onPositionChange?.(month);
    },
    [totalMonths, onPositionChange]
  );

  // Handle play toggle
  const handlePlayClick = useCallback(() => {
    onPlayToggle?.();
  }, [onPlayToggle]);

  // Handle speed change
  const handleSpeedClick = useCallback(() => {
    const speeds = [1, 2, 4, 8];
    const currentIndex = speeds.indexOf(playbackSpeed);
    const nextIndex = (currentIndex + 1) % speeds.length;
    onSpeedChange?.(speeds[nextIndex]);
  }, [playbackSpeed, onSpeedChange]);

  // Handle compare click
  const handleCompareClick = useCallback(() => {
    onCompare?.();
  }, [onCompare]);

  // Display month
  const displayMonth = dragPosition ?? currentMonth;

  return (
    <div className={styles.timelineContainer}>
      {/* Header */}
      <div className={styles.timelineHeader}>
        <span className={styles.timelineLabel}>Timeline</span>
        <div className={styles.timelineControls}>
          <button
            className={styles.timelineBtn}
            onClick={handlePlayClick}
            aria-label={isPlaying ? 'Pause' : 'Play'}
            aria-pressed={isPlaying}
          >
            {isPlaying ? '||' : '>'}
          </button>
          <button
            className={styles.timelineBtn}
            onClick={handleSpeedClick}
            aria-label={`Playback speed: ${playbackSpeed}x`}
          >
            {playbackSpeed}x
          </button>
          <button
            className={styles.timelineBtn}
            onClick={handleCompareClick}
            aria-label="Compare timelines"
          >
            Compare
          </button>
        </div>
      </div>

      {/* Track */}
      <div
        ref={trackRef}
        className={styles.timelineTrack}
        onClick={handleTrackClick}
        role="slider"
        aria-label="Timeline position"
        aria-valuemin={0}
        aria-valuemax={totalMonths}
        aria-valuenow={displayMonth}
      >
        {/* Event markers */}
        <div className={styles.timelineEvents}>
          {events.map((event, index) => (
            <div
              key={`event-${index}-${event.month}`}
              className={`${styles.eventMarker} ${getEventMarkerClass(event.type)}`}
              style={{ left: `${(event.month / totalMonths) * 100}%` }}
              title={event.description}
            />
          ))}
        </div>

        {/* Progress line */}
        <div className={styles.timelineProgress}>
          <div
            className={styles.timelineProgressFill}
            style={{ width: `${markerPosition}%` }}
          />
        </div>

        {/* Draggable marker */}
        <div
          className={`${styles.timelineMarker} ${isDragging ? styles.timelineMarkerDragging : ''}`}
          style={{ left: `calc(${markerPosition}% + 10px)` }}
          onMouseDown={handleMarkerMouseDown}
          role="button"
          tabIndex={0}
          aria-label={`Current position: Month ${displayMonth}`}
        />

        {/* Month display */}
        <div className={styles.monthDisplay}>
          Month {displayMonth} / {totalMonths}
        </div>

        {/* Tick marks */}
        <div className={styles.timelineTicks}>
          {ticks.map((tick) => (
            <div
              key={`tick-${tick.month}`}
              className={`${styles.timelineTick} ${tick.isMajor ? styles.timelineTickMajor : ''}`}
              style={{ left: `${(tick.month / totalMonths) * 100}%` }}
            >
              {tick.label && (
                <span className={styles.timelineTickLabel}>{tick.label}</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default TimelineScrubber;
