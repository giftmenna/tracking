import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Package, MapPin, User, Phone, Mail, Save, X, Box } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { statusLabels } from "@/lib/supabase-types";
import type { Shipment } from "@/lib/supabase-types";

export default function EditShipment() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serviceLevel, setServiceLevel] = useState<string>('standard');
  const [status, setStatus] = useState<string>('created');
  const [length, setLength] = useState<string>("");
  const [width, setWidth] = useState<string>("");
  const [height, setHeight] = useState<string>("");

  // Helper function to parse dimensions string
  const parseDimensions = (dimensions: string | null) => {
    if (!dimensions) return { length: "", width: "", height: "" };
    
    const regex = /(\d+\.?\d*)\s*[x×*]\s*(\d+\.?\d*)\s*[x×*]\s*(\d+\.?\d*)/;
    const match = dimensions.match(regex);
    
    if (match) {
      return {
        length: match[1],
        width: match[2],
        height: match[3]
      };
    }
    
    return { length: "", width: "", height: "" };
  };

  // Helper function to format dimensions string
  const formatDimensions = (length: string, width: string, height: string) => {
    if (!length || !width || !height) return "";
    return `${length}×${width}×${height}`;
  };

  useEffect(() => {
    if (id) {
      fetchShipment();
    }
  }, [id]);

  const fetchShipment = async () => {
    try {
      const { data, error } = await supabase
        .from('shipments')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setShipment(data);
      setServiceLevel(data.service_level);
      setStatus(data.status);
      
      // Parse and set dimensions
      const dims = parseDimensions(data.dimensions);
      setLength(dims.length);
      setWidth(dims.width);
      setHeight(dims.height);
    } catch (error: any) {
      console.error('Error fetching shipment:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch shipment details",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!shipment) return;

    setIsSubmitting(true);

    try {
      const formData = new FormData(e.currentTarget);

      const senderName = (formData.get('senderName') ?? '').toString().trim();
      if (!senderName) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Sender name is required",
        });
        return;
      }

      const updatePayload = {
        sender_name: senderName,
        sender_phone: (formData.get('senderPhone') ?? '').toString(),
        sender_email: (formData.get('senderEmail') ?? '').toString(),
        sender_address: (formData.get('senderAddress') ?? '').toString(),
        sender_city: (formData.get('senderCity') ?? '').toString(),
        sender_state: (formData.get('senderState') ?? '').toString(),
        receiver_name: (formData.get('receiverName') ?? '').toString(),
        receiver_phone: (formData.get('receiverPhone') ?? '').toString(),
        receiver_email: (formData.get('receiverEmail') ?? '').toString(),
        receiver_address: (formData.get('receiverAddress') ?? '').toString(),
        receiver_city: (formData.get('receiverCity') ?? '').toString(),
        receiver_state: (formData.get('receiverState') ?? '').toString(),
        package_description: (formData.get('description') ?? '').toString(),
        weight: parseFloat((formData.get('weight') ?? '').toString()) || 0,
        dimensions: formatDimensions(length, width, height),
        declared_value: parseFloat((formData.get('declaredValue') ?? '').toString()) || 0,
        service_level: serviceLevel,
        status: status,
        notes: (formData.get('notes') ?? '').toString(),
      };

      console.log('Updating shipment payload:', updatePayload);
      
      const { data, error } = await supabase
        .from('shipments')
        .update(updatePayload)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const previousStatus = shipment.status;
      const nextStatus = status;
      
      console.log('Status comparison:', {
        previous: previousStatus,
        next: nextStatus,
        areDifferent: previousStatus !== nextStatus
      });
      
      if (previousStatus !== nextStatus) {
        console.log('🔄 Creating tracking event for status change...');
        
        const trackingEventData = {
          shipment_id: shipment.id,
          event_type: nextStatus,
          status: nextStatus,
          description: statusLabels[nextStatus] || `Status changed to ${nextStatus}`,
        };
        
        console.log('📝 Tracking event data to insert:', trackingEventData);
        
        const { error: eventError, data: eventData } = await supabase
          .from('tracking_events')
          .insert(trackingEventData)
          .select()
          .single();

        console.log('📤 Insert response:', { error: eventError, data: eventData });

        if (eventError) {
          console.error('❌ Error creating tracking event:', eventError);
          toast({
            variant: "destructive",
            title: "Tracking Event Failed",
            description: `Status updated but tracking event failed: ${eventError.message}`,
          });
        } else {
          console.log('✅ Tracking event created successfully:', eventData);
          toast({
            title: "✅ Tracking Event Created",
            description: `Status changed to ${statusLabels[nextStatus]}`,
          });
        }
      } else {
        console.log('⏭️ No status change detected, skipping tracking event creation');
      }

      toast({
        title: "Shipment Updated!",
        description: "The shipment has been updated successfully",
      });

      navigate(`/admin/shipments/${id}`);
    } catch (error: any) {
      console.error('Error updating shipment:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: `${error?.message || 'Failed to update shipment'}${error?.details ? ` (${error.details})` : ''}`,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 md:p-8">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading shipment details...</p>
        </div>
      </div>
    );
  }

  if (!shipment) {
    return (
      <div className="p-6 md:p-8">
        <div className="text-center py-12">
          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Shipment not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" onClick={() => navigate(`/admin/shipments/${id}`)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Details
        </Button>
        <h1 className="text-2xl font-bold">Edit Shipment</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Sender Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <User className="h-5 w-5 text-accent" />
              Sender Information
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="senderName">Full Name</Label>
              <Input id="senderName" name="senderName" defaultValue={shipment.sender_name} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="senderPhone">Phone Number</Label>
              <Input id="senderPhone" name="senderPhone" defaultValue={shipment.sender_phone} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="senderEmail">Email Address</Label>
              <Input id="senderEmail" name="senderEmail" type="email" defaultValue={shipment.sender_email || ''} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="senderAddress">Address</Label>
              <Input id="senderAddress" name="senderAddress" defaultValue={shipment.sender_address} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="senderCity">City</Label>
              <Input id="senderCity" name="senderCity" defaultValue={shipment.sender_city} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="senderState">State</Label>
              <Input id="senderState" name="senderState" defaultValue={shipment.sender_state || ''} />
            </div>
          </CardContent>
        </Card>

        {/* Receiver Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <MapPin className="h-5 w-5 text-accent" />
              Receiver Information
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="receiverName">Full Name</Label>
              <Input id="receiverName" name="receiverName" defaultValue={shipment.receiver_name} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="receiverPhone">Phone Number</Label>
              <Input id="receiverPhone" name="receiverPhone" defaultValue={shipment.receiver_phone} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="receiverEmail">Email Address</Label>
              <Input id="receiverEmail" name="receiverEmail" type="email" defaultValue={shipment.receiver_email || ''} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="receiverAddress">Address</Label>
              <Input id="receiverAddress" name="receiverAddress" defaultValue={shipment.receiver_address} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="receiverCity">City</Label>
              <Input id="receiverCity" name="receiverCity" defaultValue={shipment.receiver_city} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="receiverState">State</Label>
              <Input id="receiverState" name="receiverState" defaultValue={shipment.receiver_state || ''} />
            </div>
          </CardContent>
        </Card>

        {/* Package Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Package className="h-5 w-5 text-accent" />
              Package Details
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="weight">Weight (kg)</Label>
              <Input id="weight" name="weight" type="number" step="0.1" defaultValue={shipment.weight} required />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="dimensions">Dimensions (L×W×H cm)</Label>
              <div className="grid grid-cols-3 gap-2">
                <div className="relative">
                  <Input 
                    id="dimensions-length" 
                    placeholder="Length"
                    value={length}
                    onChange={(e) => setLength(e.target.value)}
                    className="pr-12"
                    step="0.1"
                    type="number"
                    min="0"
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground">cm</span>
                </div>
                <div className="relative">
                  <Input 
                    id="dimensions-width" 
                    placeholder="Width"
                    value={width}
                    onChange={(e) => setWidth(e.target.value)}
                    className="pr-12"
                    step="0.1"
                    type="number"
                    min="0"
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground">cm</span>
                </div>
                <div className="relative">
                  <Input 
                    id="dimensions-height" 
                    placeholder="Height"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    className="pr-12"
                    step="0.1"
                    type="number"
                    min="0"
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground">cm</span>
                </div>
              </div>
              {length && width && height && (
                <p className="text-sm text-muted-foreground">
                  Total: {length} × {width} × {height} cm
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="declaredValue">Declared Value ($)</Label>
              <Input id="declaredValue" name="declaredValue" type="number" step="0.01" defaultValue={shipment.declared_value || 0} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="service">Service Type</Label>
              <Select value={serviceLevel} onValueChange={setServiceLevel}>
                <SelectTrigger id="service">
                  <SelectValue placeholder="Select service" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Standard (3-5 days)</SelectItem>
                  <SelectItem value="express">Express (1-2 days)</SelectItem>
                  <SelectItem value="sameday">Same Day</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="created">Created</SelectItem>
                  <SelectItem value="received_at_origin">Received at Origin</SelectItem>
                  <SelectItem value="in_transit">In Transit</SelectItem>
                  <SelectItem value="arrived_at_destination">Arrived at Destination</SelectItem>
                  <SelectItem value="out_for_delivery">Out for Delivery</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="exception">Exception</SelectItem>
                  <SelectItem value="returned">Returned</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="description">Package Description</Label>
              <Textarea id="description" name="description" defaultValue={shipment.package_description || ''} rows={3} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" name="notes" defaultValue={shipment.notes || ''} rows={2} />
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-end">
          <Button type="button" variant="outline" onClick={() => navigate(`/admin/shipments/${id}`)}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            <Save className="h-4 w-4 mr-2" />
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </div>
  );
}
