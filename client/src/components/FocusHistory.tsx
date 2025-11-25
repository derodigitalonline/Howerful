import { FocusSession } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, CheckCircle2, XCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface FocusHistoryProps {
  sessions: FocusSession[];
}

export default function FocusHistory({ sessions }: FocusHistoryProps) {
  // Sort sessions by most recent first
  const sortedSessions = [...sessions].sort((a, b) => b.startedAt - a.startedAt);

  // Limit to last 10 sessions
  const recentSessions = sortedSessions.slice(0, 10);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case 'work':
        return 'text-primary';
      case 'shortBreak':
        return 'text-blue-500';
      case 'longBreak':
        return 'text-purple-500';
      default:
        return 'text-muted-foreground';
    }
  };

  const getPhaseName = (phase: string) => {
    switch (phase) {
      case 'work':
        return 'Work';
      case 'shortBreak':
        return 'Short Break';
      case 'longBreak':
        return 'Long Break';
      default:
        return phase;
    }
  };

  if (sessions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Session History</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            No focus sessions yet. Start a session to see your history!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Recent Sessions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {recentSessions.map((session) => (
            <div
              key={session.id}
              className="flex items-start justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  {session.wasCompleted ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-orange-500" />
                  )}
                  <span className={`text-sm font-medium ${getPhaseColor(session.phase)}`}>
                    {getPhaseName(session.phase)}
                  </span>
                </div>
                {session.itemText && (
                  <p className="text-xs text-muted-foreground ml-6 mb-1">
                    {session.itemText}
                  </p>
                )}
                <div className="flex items-center gap-3 ml-6 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{formatDuration(session.actualDuration || session.targetDuration)}</span>
                  </div>
                  <span>•</span>
                  <span>{formatDistanceToNow(session.startedAt, { addSuffix: true })}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
