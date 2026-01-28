import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { economicEvents } from '@/data/mockGoldData';
import type { EconomicEvent, EventImpact } from '@/types/gold';
import { format, isToday, isTomorrow, isThisWeek, addDays } from 'date-fns';
import { Calendar, Clock, MapPin, TrendingUp, AlertCircle } from 'lucide-react';

const impactStyles: Record<EventImpact, string> = {
  'High': 'bg-loss text-loss-foreground',
  'Medium': 'bg-yellow-500 text-black',
  'Low': 'bg-muted text-muted-foreground'
};

const impactDots: Record<EventImpact, string> = {
  'High': 'bg-loss',
  'Medium': 'bg-yellow-500',
  'Low': 'bg-muted-foreground'
};

function EventCard({ event }: { event: EconomicEvent }) {
  const dateLabel = isToday(event.date) 
    ? 'Today' 
    : isTomorrow(event.date) 
      ? 'Tomorrow' 
      : format(event.date, 'MMM dd');

  return (
    <div className="p-4 rounded-lg border border-border hover:border-accent/50 transition-colors">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <Badge className={impactStyles[event.impact]} variant="secondary">
            {event.impact}
          </Badge>
          <Badge variant="outline">{event.country}</Badge>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium text-foreground">{dateLabel}</p>
          <p className="text-xs text-muted-foreground">{event.time}</p>
        </div>
      </div>
      
      <h4 className="font-semibold text-foreground mb-1">{event.title}</h4>
      <p className="text-sm text-muted-foreground mb-3">{event.description}</p>
      
      {(event.previous || event.forecast) && (
        <div className="flex gap-4 pt-2 border-t border-border">
          {event.previous && (
            <div>
              <p className="text-xs text-muted-foreground">Previous</p>
              <p className="font-mono text-sm">{event.previous}</p>
            </div>
          )}
          {event.forecast && (
            <div>
              <p className="text-xs text-muted-foreground">Forecast</p>
              <p className="font-mono text-sm text-accent">{event.forecast}</p>
            </div>
          )}
          {event.actual && (
            <div>
              <p className="text-xs text-muted-foreground">Actual</p>
              <p className="font-mono text-sm font-bold">{event.actual}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function EconomicCalendar() {
  const [filter, setFilter] = useState<'all' | 'high'>('all');
  
  const filteredEvents = economicEvents
    .filter(e => filter === 'all' || e.impact === 'High')
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  const upcomingHigh = economicEvents.filter(e => 
    e.impact === 'High' && e.date >= new Date()
  ).length;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Economic Calendar
          </CardTitle>
          {upcomingHigh > 0 && (
            <Badge variant="destructive" className="gap-1">
              <AlertCircle className="h-3 w-3" />
              {upcomingHigh} High Impact Events
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2 mb-4">
          <Button 
            variant={filter === 'all' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setFilter('all')}
          >
            All Events
          </Button>
          <Button 
            variant={filter === 'high' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setFilter('high')}
          >
            High Impact Only
          </Button>
        </div>

        <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
          {filteredEvents.map(event => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>

        <div className="mt-4 p-3 bg-muted rounded-lg">
          <div className="flex items-center gap-4 text-xs">
            <span className="text-muted-foreground">Impact:</span>
            <div className="flex items-center gap-1">
              <div className={`w-2 h-2 rounded-full ${impactDots['High']}`} />
              <span>High</span>
            </div>
            <div className="flex items-center gap-1">
              <div className={`w-2 h-2 rounded-full ${impactDots['Medium']}`} />
              <span>Medium</span>
            </div>
            <div className="flex items-center gap-1">
              <div className={`w-2 h-2 rounded-full ${impactDots['Low']}`} />
              <span>Low</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
