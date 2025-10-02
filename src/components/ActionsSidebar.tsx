'use client';

import { useGameStore } from '@/lib/gameStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Activity, Clock } from 'lucide-react';
import { TooltipProvider } from '@/components/ui/tooltip';

export default function ActionsSidebar() {
  const { eventLog } = useGameStore();

  // Get recent events from event log (all events, not just actions)
  const recentEvents = eventLog
    .slice(-30)  // Show more events since this is the only content now
    .reverse();

  return (
    <TooltipProvider>
      <div className="w-80 border-l bg-background h-full flex flex-col">
        {/* Header */}
        <div className="p-4 border-b">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            <h2 className="font-semibold">Event Log</h2>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Real-time events and agent activities
          </p>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-4">
            {/* Event Log */}
            <div className="space-y-2">
              {recentEvents.length > 0 ? (
                recentEvents.map((event) => (
                  <Card key={event.id} className="text-xs">
                    <CardContent className="p-3">
                      <div className="border-l-2 pl-2" style={{
                        borderColor: event.severity === 'constructive' ? '#10b981' :
                                  event.severity === 'info' ? '#3b82f6' : 
                                  event.severity === 'warning' ? '#f59e0b' :
                                  event.severity === 'destructive' ? '#ef4444' : '#6b7280'
                      }}>
                        <div className="flex items-center justify-between mb-1">
                          <Badge variant="outline" className="text-xs">
                            {event.agent}
                          </Badge>
                          <span className="text-muted-foreground">M{event.timestamp}</span>
                        </div>
                        <div className="font-medium mb-1">{event.title}</div>
                        {event.description && (
                          <div className="text-muted-foreground">
                            {event.description}
                          </div>
                        )}
                        {event.effects && Object.keys(event.effects).length > 0 && (
                          <div className="mt-2 pt-2 border-t text-xs">
                            <div className="flex flex-wrap gap-1">
                              {Object.entries(event.effects).slice(0, 3).map(([key, value]) => (
                                <Badge key={key} variant="secondary" className="text-xs">
                                  {key}: {typeof value === 'number' ? value.toFixed(2) : String(value)}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card>
                  <CardContent className="p-4">
                    <div className="text-xs text-muted-foreground text-center">
                      No events yet. Start the simulation to see agent activity.
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </ScrollArea>
      </div>
    </TooltipProvider>
  );
}
