import { CheckCircle2, Circle, MapPin, Truck, Package, Home, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

// Helper function to format status names
const formatStatusName = (status: string) => {
  return status
    .replace(/_/g, ' ')           // Replace underscores with spaces
    .replace(/\b\w/g, l => l.toUpperCase()); // Capitalize first letter of each word
};

export interface TrackingEvent {
  id: string;
  status: string;
  location: string;
  timestamp: string;
  description: string;
  isCompleted: boolean;
  isCurrent: boolean;
  type: "created" | "received" | "transit" | "hub" | "out_for_delivery" | "delivered" | "exception";
}

const eventIcons = {
  created: Package,
  received: Package,
  transit: Truck,
  hub: MapPin,
  out_for_delivery: Truck,
  delivered: Home,
  exception: AlertCircle,
};

interface TrackingTimelineProps {
  events: TrackingEvent[];
}

export function TrackingTimeline({ events }: TrackingTimelineProps) {
  return (
    <div className="relative">
      {events.map((event, index) => {
        const Icon = eventIcons[event.type] || Circle;
        const isLast = index === events.length - 1;
        const isCurrent = event.isCurrent;

        return (
          <div
            key={event.id}
            className={cn(
              "relative flex gap-4 pb-8",
              isLast && "pb-0"
            )}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            {/* Timeline line */}
            {!isLast && (
              <div
                className={cn(
                  "absolute left-5 top-10 w-0.5 h-[calc(100%-2rem)]",
                  event.isCompleted ? "bg-success" : "bg-border"
                )}
              />
            )}

            {/* Icon */}
            <div
              className={cn(
                "relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-300",
                // Highlight current event with special styling - changed to purple/indigo theme
                isCurrent && "ring-4 ring-purple-300 border-purple-600 bg-purple-600 text-white scale-110 shadow-xl shadow-purple-300",
                event.isCompleted && !isCurrent && "border-purple-600 bg-purple-100 text-purple-600",
                !event.isCompleted && !isCurrent && "border-border bg-muted text-muted-foreground",
                event.type === "exception" && "border-destructive bg-destructive/10 text-destructive"
              )}
            >
              {event.isCompleted ? (
                <CheckCircle2 className="h-6 w-6" />
              ) : (
                <Icon className="h-6 w-6" />
              )}
            </div>

            {/* Content */}
            <div
              className={cn(
                "flex-1 pt-2",
                // Add special background for current event - changed to lighter purple for better contrast
                isCurrent && "bg-gradient-to-r from-purple-400 to-purple-100 border-purple-200 rounded-lg p-4 -m-4"
              )}
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                <div>
                  <h4
                    className={cn(
                      "font-semibold text-lg",
                      // Enhanced styling for current event - changed to purple theme
                      isCurrent && "text-purple-500",
                      event.type === "exception" && "text-destructive"
                    )}
                  >
                    {formatStatusName(event.status)}
                    {/* Add "CURRENT" badge for current event */}
                    {isCurrent && (
                      <span className="ml-2 px-2 py-1 bg-purple-400 text-white text-xs font-semibold rounded-full">
                        CURRENT
                      </span>
                    )}
                  </h4>
                  <p className={cn(
                    "text-sm",
                    isCurrent ? "text-purple-500/90 font-medium" : "text-muted-foreground"
                  )}>
                    {event.description}
                  </p>
                </div>
                <div className="text-sm text-muted-foreground sm:text-right shrink-0">
                  <div className="font-medium">{event.timestamp}</div>
                  <div className="flex items-center gap-2 sm:justify-end mt-1">
                    <MapPin className="h-4 w-4" />
                    <span className={cn(
                      "text-xs",
                      isCurrent && "text-purple-500 font-medium"
                    )}>
                      {event.location}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
