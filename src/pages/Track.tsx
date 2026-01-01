import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  Package, 
  MapPin, 
  Calendar, 
  Truck,
  ArrowLeft,
  Copy,
  CheckCircle2,
  AlertCircle,
  Download,
  Car,
  Ship,
  Plane,
  Route
} from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { TrackingSearch } from "@/components/TrackingSearch";
import { TrackingTimeline, TrackingEvent } from "@/components/TrackingTimeline";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { generateTrackingPDF } from "@/lib/pdf-generator";
import { supabase } from "@/lib/supabase";
import type { Shipment } from "@/lib/supabase-types";

// Mock data for demonstration
const mockShipmentData = {
  trackingNumber: "SHP-2024-ABC123",
  status: "In Transit",
  statusType: "transit" as const,
  estimatedDelivery: "Dec 31, 2024",
  origin: "New York, NY",
  destination: "Los Angeles, CA",
  service: "Express",
  weight: "2.5 kg",
  sender: "John Doe",
  receiver: "Jane Smith",
  events: [
    {
      id: "1",
      status: "Delivered",
      location: "Los Angeles, CA",
      timestamp: "Dec 31, 2024 - 2:30 PM",
      description: "Package delivered successfully. Signed by: J. Smith",
      isCompleted: false,
      isCurrent: false,
      type: "delivered" as const,
    },
    {
      id: "2",
      status: "Out for Delivery",
      location: "Los Angeles, CA",
      timestamp: "Dec 31, 2024 - 8:00 AM",
      description: "Package is out for delivery with courier",
      isCompleted: true,
      isCurrent: true,
      type: "out_for_delivery" as const,
    },
    {
      id: "3",
      status: "Arrived at Destination Hub",
      location: "Los Angeles Distribution Center",
      timestamp: "Dec 30, 2024 - 11:45 PM",
      description: "Package arrived at destination facility",
      isCompleted: true,
      isCurrent: false,
      type: "hub" as const,
    },
    {
      id: "4",
      status: "In Transit",
      location: "Phoenix, AZ",
      timestamp: "Dec 30, 2024 - 3:20 PM",
      description: "Package in transit to next facility",
      isCompleted: true,
      isCurrent: false,
      type: "transit" as const,
    },
    {
      id: "5",
      status: "Departed Origin Hub",
      location: "New York Distribution Center",
      timestamp: "Dec 29, 2024 - 10:00 AM",
      description: "Package has left the origin facility",
      isCompleted: true,
      isCurrent: false,
      type: "transit" as const,
    },
    {
      id: "6",
      status: "Received at Origin",
      location: "New York, NY",
      timestamp: "Dec 29, 2024 - 8:30 AM",
      description: "Package received at origin facility",
      isCompleted: true,
      isCurrent: false,
      type: "received" as const,
    },
    {
      id: "7",
      status: "Shipment Created",
      location: "New York, NY",
      timestamp: "Dec 28, 2024 - 4:15 PM",
      description: "Shipping label created, awaiting pickup",
      isCompleted: true,
      isCurrent: false,
      type: "created" as const,
    },
  ] as TrackingEvent[],
};

// Helper function to format status names with spaces instead of hyphens
const formatStatusName = (status: string) => {
  return status
    .replace(/_/g, ' ')           // Replace underscores with spaces
    .replace(/\b\w/g, l => l.toUpperCase()); // Capitalize first letter of each word
};

const statusBadgeVariant = {
  "Created": "pending",
  "Received": "pending", 
  "In Transit": "transit",
  "Out for Delivery": "transit",
  "Delivered": "delivered",
  "Exception": "exception",
} as const;

export default function Track() {
  const { trackingNumber } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [trackingEvents, setTrackingEvents] = useState<TrackingEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  // Function to get transport icon based on transport mode
  const getTransportIcon = (transportMode?: string, completed?: boolean) => {
    const colorClass = completed ? "text-blue-500" : "text-muted-foreground";
    switch (transportMode) {
      case 'road':
        return <Car className={`h-6 w-6 ${colorClass}`} />;
      case 'sea':
        return <Ship className={`h-6 w-6 ${colorClass}`} />;
      case 'air':
        return <Plane className={`h-6 w-6 ${colorClass}`} />;
      default:
        return <Truck className={`h-6 w-6 ${colorClass}`} />;
    }
  };

  // Function to calculate progress percentage
  const getProgressPercentage = () => {
    if (!shipment) return 0;
    
    const statusProgress = {
      'created': 10,
      'received_at_origin': 25,
      'in_transit': 50,
      'arrived_at_destination': 75,
      'out_for_delivery': 90,
      'delivered': 100
    };
    
    return statusProgress[shipment.status as keyof typeof statusProgress] || 0;
  };

  // Function to get current progress point based on status
  const getCurrentProgressPoint = () => {
    if (!shipment) return 100;
    
    switch (shipment.status) {
      case 'created': return 10;
      case 'received_at_origin': return 25;
      case 'in_transit': return 50;
      case 'arrived_at_destination': return 75;
      case 'out_for_delivery': return 90;
      case 'delivered': return 100;
      default: return 100;
    }
  };

  // Function to get intermediate stops based on transport mode and tracking events
  const getIntermediateStops = () => {
    if (!shipment) return [];
    
    const stops = [];
    
    // Add stops based on transport mode
    if (shipment.transport_mode === 'sea') {
      stops.push(
        {
          type: 'Port Departure',
          location: 'Origin Port',
          description: 'Container loaded onto vessel',
          transport_mode: 'sea',
          completed: shipment.status !== 'created',
          timestamp: shipment.status !== 'created' ? new Date().toLocaleString() : undefined
        },
        {
          type: 'Transit Hub',
          location: 'International Waters',
          description: 'In transit via ocean freight',
          transport_mode: 'sea',
          completed: ['in_transit', 'arrived_at_destination', 'out_for_delivery', 'delivered'].includes(shipment.status),
          timestamp: ['in_transit', 'arrived_at_destination', 'out_for_delivery', 'delivered'].includes(shipment.status) ? new Date().toLocaleString() : undefined
        },
        {
          type: 'Port Arrival',
          location: 'Destination Port',
          description: 'Container unloaded at destination port',
          transport_mode: 'sea',
          completed: ['arrived_at_destination', 'out_for_delivery', 'delivered'].includes(shipment.status),
          timestamp: ['arrived_at_destination', 'out_for_delivery', 'delivered'].includes(shipment.status) ? new Date().toLocaleString() : undefined
        }
      );
    } else if (shipment.transport_mode === 'air') {
      stops.push(
        {
          type: 'Airport Departure',
          location: 'Origin Airport',
          description: 'Package loaded onto aircraft',
          transport_mode: 'air',
          completed: shipment.status !== 'created',
          timestamp: shipment.status !== 'created' ? new Date().toLocaleString() : undefined
        },
        {
          type: 'Transit Hub',
          location: 'In Flight',
          description: 'Air freight in transit',
          transport_mode: 'air',
          completed: ['in_transit', 'arrived_at_destination', 'out_for_delivery', 'delivered'].includes(shipment.status),
          timestamp: ['in_transit', 'arrived_at_destination', 'out_for_delivery', 'delivered'].includes(shipment.status) ? new Date().toLocaleString() : undefined
        },
        {
          type: 'Airport Arrival',
          location: 'Destination Airport',
          description: 'Package arrived at destination airport',
          transport_mode: 'air',
          completed: ['arrived_at_destination', 'out_for_delivery', 'delivered'].includes(shipment.status),
          timestamp: ['arrived_at_destination', 'out_for_delivery', 'delivered'].includes(shipment.status) ? new Date().toLocaleString() : undefined
        }
      );
    } else if (shipment.transport_mode === 'road') {
      stops.push(
        {
          type: 'Transit Hub',
          location: 'Distribution Center',
          description: 'Package at sorting facility',
          transport_mode: 'road',
          completed: ['in_transit', 'arrived_at_destination', 'out_for_delivery', 'delivered'].includes(shipment.status),
          timestamp: ['in_transit', 'arrived_at_destination', 'out_for_delivery', 'delivered'].includes(shipment.status) ? new Date().toLocaleString() : undefined
        },
        {
          type: 'Transit Hub',
          location: 'Regional Hub',
          description: 'Package at regional distribution center',
          transport_mode: 'road',
          completed: ['arrived_at_destination', 'out_for_delivery', 'delivered'].includes(shipment.status),
          timestamp: ['arrived_at_destination', 'out_for_delivery', 'delivered'].includes(shipment.status) ? new Date().toLocaleString() : undefined
        }
      );
    }
    
    return stops;
  };

  useEffect(() => {
    if (trackingNumber) {
      fetchShipmentData();
    }
  }, [trackingNumber]);

  const fetchShipmentData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Validate tracking number format
      if (!trackingNumber || trackingNumber.trim().length < 6) {
        throw new Error('Tracking number must be at least 6 characters long');
      }

      // Fetch shipment by tracking number
      const { data: shipmentData, error: shipmentError } = await supabase
        .from('shipments')
        .select('*')
        .eq('tracking_number', trackingNumber.trim())
        .single();

      if (shipmentError) {
        console.error('Shipment fetch error:', shipmentError);
        // Don't show error for development - just log it
        console.log('Development mode: Tracking number not found in database');
        setError('Tracking number not found. Please run the database setup script first.');
        return;
      }

      setShipment(shipmentData);

      // Fetch tracking events for this shipment
      const { data: eventsData, error: eventsError } = await supabase
        .from('tracking_events')
        .select('*')
        .eq('shipment_id', shipmentData.id)
        .order('created_at', { ascending: true });

      if (eventsError) {
        console.error('Tracking events fetch error:', eventsError);
        // Don't show error for tracking events - shipment details are still shown
      } else {
        // Transform tracking events to match TrackingEvent interface and identify latest
        const transformedEvents: TrackingEvent[] = (eventsData || []).map(event => ({
          id: event.id,
          status: event.status as any,
          location: event.location || '',
          timestamp: new Date(event.created_at).toLocaleString(),
          description: event.description || '',
          isCompleted: event.status === 'delivered',
          isCurrent: false, // Will be updated below
          type: 'created' as any,
        }));

        // Sort events by timestamp (newest first) to find latest
        const sortedEvents = [...transformedEvents].sort((a, b) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );

        // Mark the most recent event as current
        if (sortedEvents.length > 0) {
          sortedEvents[0].isCurrent = true;
        }

        setTrackingEvents(sortedEvents);
      }

      // Show success message
      toast({
        title: "Shipment Found!",
        description: `Tracking number ${trackingNumber} is valid and active`,
      });

    } catch (error: any) {
      console.error('Error fetching shipment data:', error);
      setError(error.message || 'Failed to fetch shipment information');
      toast({
        variant: "destructive",
        title: "Tracking Error",
        description: error.message || "Failed to fetch shipment information",
      });
    } finally {
      setLoading(false);
    }
  };

  const copyTrackingNumber = () => {
    if (shipment) {
      navigator.clipboard.writeText(shipment.tracking_number);
      setCopied(true);
      toast({
        title: "Copied!",
        description: "Tracking number copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownloadPDF = async () => {
    if (!shipment) return;
    
    setIsGeneratingPDF(true);
    try {
      await generateTrackingPDF({
        trackingNumber: shipment.tracking_number,
        status: shipment.status,
        estimatedDelivery: shipment.estimated_delivery ? new Date(shipment.estimated_delivery).toLocaleDateString() : undefined,
        origin: shipment.sender_city,
        originAddress: shipment.sender_address,
        destination: shipment.receiver_city,
        destinationAddress: shipment.receiver_address,
        finalDestination: shipment.delivery_city || undefined,
        finalDestinationAddress: shipment.delivery_address || undefined,
        service: shipment.service_level,
        transportMode: shipment.transport_mode,
        weight: shipment.weight.toString(),
        dimensions: shipment.dimensions || undefined,
        declaredValue: shipment.declared_value?.toString() || undefined,
        totalAmount: shipment.total_amount.toString(),
        paymentStatus: shipment.payment_status,
        amountPaid: shipment.amount_paid?.toString() || undefined,
        sender: shipment.sender_name,
        senderPhone: shipment.sender_phone,
        senderEmail: shipment.sender_email || undefined,
        receiver: shipment.receiver_name,
        receiverPhone: shipment.receiver_phone,
        receiverEmail: shipment.receiver_email || undefined,
        currentLocation: shipment.current_location || undefined,
        pickupDate: shipment.pickup_date ? new Date(shipment.pickup_date).toLocaleDateString() : undefined,
        deliveredAt: shipment.delivered_at ? new Date(shipment.delivered_at).toLocaleDateString() : undefined,
        notes: shipment.notes || undefined,
        packageDescription: shipment.package_description || undefined,
        events: trackingEvents,
      });
      toast({
        title: "PDF Generated!",
        description: "Tracking report downloaded successfully",
      });
    } catch (error) {
      console.error('PDF generation error:', error);
      console.error('Error generating PDF:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to generate PDF report",
      });
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 bg-background">
        {/* Search Header */}
        <section className="bg-hero text-primary-foreground py-12">
          <div className="container">
            <div className="max-w-2xl mx-auto text-center space-y-6">
              <h1 className="text-3xl md:text-4xl font-bold">Track Your Shipment</h1>
              <p className="text-primary-foreground/80">
                Enter your tracking number to see real-time status and delivery updates
              </p>
              <TrackingSearch />
            </div>
          </div>
        </section>

        {/* Results */}
        {shipment ? (
          <section className="py-8 md:py-12">
            <div className="container max-w-4xl">
              {/* Back button */}
              <Button 
                variant="ghost" 
                className="mb-6"
                onClick={() => navigate("/track")}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                New Search
              </Button>

              {/* Shipment Overview Card */}
              <div className="bg-card rounded-2xl border border-border shadow-card overflow-hidden mb-8 animate-slide-up">
                <div className="p-6 md:p-8 border-b border-border">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <Badge variant={statusBadgeVariant[formatStatusName(shipment.status) as keyof typeof statusBadgeVariant] || "pending"}>
                          {formatStatusName(shipment.status)}
                        </Badge>
                        <span className="text-sm text-muted-foreground">{shipment.service_level}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-xl font-bold font-mono">{shipment.tracking_number}</h2>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={copyTrackingNumber}
                        >
                          {copied ? (
                            <CheckCircle2 className="h-4 w-4 text-success" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">Estimated Delivery</div>
                      <div className="text-lg font-semibold flex items-center gap-2 justify-end">
                        <Calendar className="h-5 w-5 text-accent" />
                        {shipment.estimated_delivery ? new Date(shipment.estimated_delivery).toLocaleDateString() : 'N/A'}
                      </div>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-3 mt-6">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={copyTrackingNumber}
                      className="flex items-center gap-2"
                    >
                      {copied ? (
                        <>
                          <CheckCircle2 className="h-4 w-4 text-success" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4" />
                          Copy Tracking Number
                        </>
                      )}
                    </Button>
                    <Button
                      variant="accent"
                      size="sm"
                      onClick={handleDownloadPDF}
                      disabled={isGeneratingPDF}
                      className="flex items-center gap-2"
                    >
                      {isGeneratingPDF ? (
                        <>
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                          Generating PDF...
                        </>
                      ) : (
                        <>
                          <Download className="h-4 w-4" />
                          Download PDF Report
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {/* Route Info with Progress Line */}
              <div className="bg-card rounded-2xl border border-border shadow-card p-6 md:p-8 animate-slide-up">
                <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                  <Route className="h-5 w-5 text-accent" />
                  Shipment Route
                </h3>
                
                {/* Mobile Timeline Layout */}
                <div className="md:hidden">
                  <div className="relative">
                    {/* Progress Line */}
                    <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-border">
                      <div 
                        className="absolute top-0 left-0 w-0.5 bg-blue-500 transition-all duration-500"
                        style={{ height: `${getProgressPercentage()}%` }}
                      />
                    </div>
                    
                    {/* Route Points */}
                    <div className="space-y-6">
                      {/* Origin */}
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-success/10 flex items-center justify-center relative z-10">
                          <MapPin className="h-6 w-6 text-success" />
                        </div>
                        <div className="flex-1">
                          <div className="text-xs text-muted-foreground uppercase tracking-wide">Origin</div>
                          <div className="font-medium">{shipment.sender_city}</div>
                          <div className="text-xs text-muted-foreground">{shipment.sender_address}</div>
                        </div>
                      </div>
                      
                      {/* Intermediate Stops */}
                      {getIntermediateStops().map((stop, index) => (
                        <div key={index} className="flex items-center gap-4">
                          <div className={`h-12 w-12 rounded-full flex items-center justify-center relative z-10 ${
                            stop.completed ? 'bg-blue-500/10' : 'bg-muted/10'
                          }`}>
                            {getTransportIcon(stop.transport_mode, stop.completed)}
                          </div>
                          <div className="flex-1">
                            <div className="text-xs text-muted-foreground uppercase tracking-wide">{stop.type}</div>
                            <div className="font-medium">{stop.location}</div>
                            <div className="text-xs text-muted-foreground">{stop.description}</div>
                            {stop.timestamp && (
                              <div className="text-xs text-muted-foreground">{stop.timestamp}</div>
                            )}
                          </div>
                        </div>
                      ))}
                      
                      {/* Destination */}
                      <div className="flex items-center gap-4">
                        <div className={`h-12 w-12 rounded-full flex items-center justify-center relative z-10 ${
                          shipment.status === 'delivered' ? 'bg-success/10' : 'bg-muted/10'
                        }`}>
                          <MapPin className={`h-6 w-6 ${shipment.status === 'delivered' ? 'text-success' : 'text-muted-foreground'}`} />
                        </div>
                        <div className="flex-1">
                          <div className="text-xs text-muted-foreground uppercase tracking-wide">Final Destination</div>
                          <div className="font-medium">{shipment.delivery_city || shipment.receiver_city}</div>
                          {shipment.delivery_address && (
                            <div className="text-xs text-muted-foreground">{shipment.delivery_address}</div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Desktop Vertical Layout */}
                <div className="hidden lg:block">
                  <div className="relative">
                    {/* Progress Line */}
                    <div className="absolute left-8 top-8 bottom-8 w-0.5 bg-border">
                      <div 
                        className="absolute top-0 left-0 w-0.5 bg-blue-500 transition-all duration-500"
                        style={{ height: `${getProgressPercentage()}%` }}
                      />
                    </div>
                    
                    {/* Route Points */}
                    <div className="space-y-8">
                      {/* Origin */}
                      <div className="flex items-center gap-6">
                        <div className="h-16 w-16 rounded-full bg-success/10 flex items-center justify-center relative z-10 border-2 border-success/20">
                          <MapPin className="h-8 w-8 text-success" />
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-semibold text-success uppercase tracking-wide mb-1">Origin</div>
                          <div className="font-medium text-lg">{shipment.sender_city}</div>
                          <div className="text-sm text-muted-foreground">{shipment.sender_address}</div>
                        </div>
                      </div>

                      {/* Intermediate Stops */}
                      {getIntermediateStops().map((stop, index) => (
                        <div key={index} className="flex items-center gap-6">
                          <div className={`h-14 w-14 rounded-full flex items-center justify-center relative z-10 border-2 ${
                            stop.completed ? 'bg-blue-500/10 border-blue-500/20' : 'bg-muted/10 border-muted/20'
                          }`}>
                            {getTransportIcon(stop.transport_mode, stop.completed)}
                          </div>
                          <div className="flex-1">
                            <div className="text-sm font-semibold uppercase tracking-wide mb-1">{stop.type}</div>
                            <div className="font-medium">{stop.location}</div>
                            <div className="text-sm text-muted-foreground">{stop.description}</div>
                            {stop.timestamp && (
                              <div className="text-sm text-muted-foreground">{stop.timestamp}</div>
                            )}
                          </div>
                        </div>
                      ))}

                      {/* Destination */}
                      <div className="flex items-center gap-6">
                        <div className={`h-16 w-16 rounded-full flex items-center justify-center relative z-10 border-2 ${
                          shipment.status === 'delivered' ? 'bg-success/10 border-success/20' : 'bg-accent/10 border-accent/20'
                        }`}>
                          <MapPin className={`h-8 w-8 ${shipment.status === 'delivered' ? 'text-success' : 'text-accent'}`} />
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-semibold text-accent uppercase tracking-wide mb-1">Final Destination</div>
                          <div className="font-medium text-lg">
                            {shipment.delivery_city || shipment.receiver_city}
                          </div>
                          {shipment.delivery_address && (
                            <div className="text-sm text-muted-foreground">
                              {shipment.delivery_address}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              </div>

              {/* Timeline */}
              <div className="bg-card rounded-2xl border border-border shadow-card p-6 md:p-8 animate-slide-up" style={{ animationDelay: "100ms" }}>
                <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                  <Package className="h-5 w-5 text-accent" />
                  Tracking History
                </h3>
                <TrackingTimeline events={trackingEvents} />
              </div>

              {/* Admin Notes */}
              {shipment.notes && (
                <div className="bg-card rounded-2xl border border-border shadow-card p-6 md:p-8 animate-slide-up" style={{ animationDelay: "150ms" }}>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-info" />
                    Notes
                  </h3>
                  <div className="bg-muted/50 rounded-lg p-4">
                    <p className="text-sm leading-relaxed">{shipment.notes}</p>
                  </div>
                </div>
              )}

              {/* Shipment Details */}
              <div className="mt-8 grid md:grid-cols-3 gap-6 animate-slide-up" style={{ animationDelay: "200ms" }}>
                <div className="bg-card rounded-xl border border-border p-6">
                  <h4 className="font-semibold mb-4">Shipping Charges</h4>
                  <dl className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Service Cost</dt>
                      <dd className="font-medium">${shipment.total_amount}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Payment Status</dt>
                      <dd className="font-medium capitalize">{shipment.payment_status}</dd>
                    </div>
                    {shipment.amount_paid && (
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">Amount Paid</dt>
                        <dd className="font-medium">${shipment.amount_paid}</dd>
                      </div>
                    )}
                  </dl>
                  
                  <div className="mt-6 pt-4 border-t border-border">
                    <h5 className="font-medium mb-3 text-sm text-muted-foreground">Package Information</h5>
                    <dl className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">Tracking Number</dt>
                        <dd className="font-medium">{shipment.tracking_number}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">Weight</dt>
                        <dd className="font-medium">{shipment.weight} kg</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">Service Type</dt>
                        <dd className="font-medium capitalize">{shipment.service_level}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">Transport Mode</dt>
                        <dd className="font-medium capitalize">{shipment.transport_mode}</dd>
                      </div>
                      {shipment.dimensions && (
                        <div className="flex justify-between">
                          <dt className="text-muted-foreground">Dimensions</dt>
                          <dd className="font-medium">{shipment.dimensions}</dd>
                        </div>
                      )}
                      {shipment.estimated_delivery && (
                        <div className="flex justify-between">
                          <dt className="text-muted-foreground">Estimated Delivery</dt>
                          <dd className="font-medium">{new Date(shipment.estimated_delivery).toLocaleDateString()}</dd>
                        </div>
                      )}
                    </dl>
                  </div>
                </div>

                <div className="bg-card rounded-xl border border-border p-6">
                  <h4 className="font-semibold mb-4">Package Value</h4>
                  <div className="space-y-4">
                    {shipment.declared_value && (
                      <div className="bg-muted/50 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-sm font-medium">Declared Value</div>
                            <div className="text-xs text-muted-foreground mt-1">For insurance & customs purposes</div>
                          </div>
                          <div className="text-lg font-semibold text-primary">${shipment.declared_value}</div>
                        </div>
                      </div>
                    )}
                    <div className="text-xs text-muted-foreground">
                      <p>The declared value is the insured value of your package contents and is not included in the shipping cost.</p>
                    </div>
                  </div>
                  
                  {/* Overall Total Section */}
                  <div className="mt-6 pt-4 border-t border-border">
                    <h5 className="font-medium mb-3 text-sm text-muted-foreground">Overall Summary</h5>
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Shipping Cost:</span>
                          <span className="font-medium">${shipment.total_amount}</span>
                        </div>
                        {shipment.declared_value && (
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Package Value:</span>
                            <span className="font-medium">${shipment.declared_value}</span>
                          </div>
                        )}
                        <div className="flex justify-between pt-2 border-t border-border/50">
                          <span className="font-semibold text-sm">Overall Total:</span>
                          <span className="font-bold text-lg text-primary">
                            ${(shipment.declared_value ? shipment.declared_value + shipment.total_amount : shipment.total_amount).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground mt-2">
                      <p>Overall total includes shipping cost plus declared package value.</p>
                    </div>
                  </div>
                  
                  <div className="mt-6 pt-4 border-t border-border">
                    <h5 className="font-medium mb-3 text-sm text-muted-foreground">Package Information</h5>
                    <div className="space-y-3 text-sm">
                      {shipment.package_description && (
                        <div>
                          <dt className="text-muted-foreground">Description</dt>
                          <dd className="font-medium mt-1">{shipment.package_description}</dd>
                        </div>
                      )}
                      <div>
                        <dt className="text-muted-foreground">Current Location</dt>
                        <dd className="font-medium mt-1">{shipment.current_location || 'In transit'}</dd>
                      </div>
                      {shipment.pickup_date && (
                        <div>
                          <dt className="text-muted-foreground">Pickup Date</dt>
                          <dd className="font-medium mt-1">{new Date(shipment.pickup_date).toLocaleDateString()}</dd>
                        </div>
                      )}
                      {shipment.delivered_at && (
                        <div>
                          <dt className="text-muted-foreground">Delivered At</dt>
                          <dd className="font-medium mt-1">{new Date(shipment.delivered_at).toLocaleDateString()}</dd>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-card rounded-xl border border-border p-6">
                  <h4 className="font-semibold mb-4">Addresses</h4>
                  <div className="space-y-4">
                    <div>
                      <h5 className="font-medium mb-2 text-sm text-muted-foreground">Sender</h5>
                      <div className="space-y-1 text-sm">
                        <p className="font-medium">{shipment.sender_name}</p>
                        <p>{shipment.sender_phone}</p>
                        {shipment.sender_email && <p>{shipment.sender_email}</p>}
                        <p>{shipment.sender_address}</p>
                        <p>{shipment.sender_city}, {shipment.sender_state || 'N/A'}</p>
                      </div>
                    </div>
                    <div>
                      <h5 className="font-medium mb-2 text-sm text-muted-foreground">Receiver</h5>
                      <div className="space-y-1 text-sm">
                        <p className="font-medium">{shipment.receiver_name}</p>
                        <p>{shipment.receiver_phone}</p>
                        {shipment.receiver_email && <p>{shipment.receiver_email}</p>}
                        <p>{shipment.receiver_address}</p>
                        <p>{shipment.receiver_city}, {shipment.receiver_state || 'N/A'}</p>
                      </div>
                    </div>
                    {(shipment.delivery_address || shipment.delivery_city) && (
                      <div>
                        <h5 className="font-medium mb-2 text-sm text-muted-foreground">Final Delivery Location</h5>
                        <div className="space-y-1 text-sm">
                          <p>{shipment.delivery_address || shipment.receiver_address}</p>
                          <p>{shipment.delivery_city || shipment.receiver_city}, {shipment.delivery_state || 'N/A'}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-card rounded-xl border border-border p-6">
                  <h4 className="font-semibold mb-4">Package Information</h4>
                  <div className="space-y-3 text-sm">
                    {shipment.package_description && (
                      <div>
                        <dt className="text-muted-foreground">Description</dt>
                        <dd className="font-medium mt-1">{shipment.package_description}</dd>
                      </div>
                    )}
                    <div>
                      <dt className="text-muted-foreground">Current Location</dt>
                      <dd className="font-medium mt-1">{shipment.current_location || 'In transit'}</dd>
                    </div>
                    {shipment.pickup_date && (
                      <div>
                        <dt className="text-muted-foreground">Pickup Date</dt>
                        <dd className="font-medium mt-1">{new Date(shipment.pickup_date).toLocaleDateString()}</dd>
                      </div>
                    )}
                    {shipment.delivered_at && (
                      <div>
                        <dt className="text-muted-foreground">Delivered At</dt>
                        <dd className="font-medium mt-1">{new Date(shipment.delivered_at).toLocaleDateString()}</dd>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Support Card */}
              <div className="bg-card rounded-xl border border-border p-6">
                <h4 className="font-semibold mb-4">Need Help?</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  If you have questions about your shipment or need assistance, 
                  our support team is here to help.
                </p>
                <Button variant="outline" className="w-full" asChild>
                  <a href="/support">Contact Support</a>
                </Button>
              </div>
            </div>
          </section>
        ) : (
          <section className="py-20">
            <div className="container text-center">
              <div className="max-w-md mx-auto">
                {loading ? (
                  <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
                    <div className="h-8 w-8 rounded-full border-2 border-current border-t-transparent animate-spin"></div>
                  </div>
                ) : error ? (
                  <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-6">
                    <AlertCircle className="h-8 w-8 text-destructive" />
                  </div>
                ) : (
                  <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
                    <Package className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
                
                <h2 className="text-xl font-semibold mb-2">
                  {loading ? 'Searching...' : error ? 'Tracking Error' : 'Enter a Tracking Number'}
                </h2>
                <p className="text-muted-foreground">
                  {loading 
                    ? 'Please wait while we find your shipment...' 
                    : error 
                      ? error
                      : 'Use the search box above to enter your tracking number and view real-time shipment status.'
                  }
                </p>
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
