import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface TrackingSearchProps {
  variant?: "hero" | "compact";
  className?: string;
}

export function TrackingSearch({ variant = "hero", className }: TrackingSearchProps) {
  const [trackingNumber, setTrackingNumber] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (trackingNumber.trim()) {
      navigate(`/track/${trackingNumber.trim()}`);
    }
  };

  if (variant === "compact") {
    return (
      <form onSubmit={handleSubmit} className={`flex gap-2 ${className}`}>
        <div className="relative flex-1">
          <Package className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Enter tracking number"
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button type="submit" size="default">
          <Search className="h-4 w-4" />
          Track
        </Button>
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={`w-full max-w-2xl ${className}`}>
      <div className="flex flex-col sm:flex-row gap-3 p-2 bg-card rounded-2xl shadow-xl border border-border/50">
        <div className="relative flex-1">
          <Package className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Enter your tracking number (e.g., SS1K4M8NX7Y9Z2)"
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
            className="h-14 pl-12 text-base text-foreground border-2 border-input bg-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-ring"
          />
        </div>
        <Button type="submit" variant="accent" size="xl" className="sm:w-auto w-full">
          <Search className="h-5 w-5" />
          Track Shipment
        </Button>
      </div>
    </form>
  );
}
