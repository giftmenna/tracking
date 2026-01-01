import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Package, MapPin, Calendar, User, Phone, Mail, Scale, DollarSign, Clock, Edit, Trash2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import type { Shipment } from "@/lib/supabase-types";

export default function ShipmentDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [trackingEvents, setTrackingEvents] = useState<Array<{
    id: string;
    status: string;
    description: string;
    location: string | null;
    created_at: string;
  }>>([]);
  const [loading, setLoading] = useState(true);
  const [isEditingPayment, setIsEditingPayment] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState('');
  const [amountPaid, setAmountPaid] = useState('');

  const fetchShipment = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('shipments')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setShipment(data);
      setPaymentStatus(data.payment_status || 'unpaid');
      setAmountPaid(data.amount_paid?.toString() || '');
    } catch (error: unknown) {
      console.error('Error fetching shipment:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch shipment details",
      });
    }
  }, [id, toast]);

  const fetchTrackingEvents = useCallback(async () => {
    try {
      console.log('🔍 Fetching tracking events for shipment:', id);
      const { data, error } = await supabase
        .from('tracking_events')
        .select('*')
        .eq('shipment_id', id)
        .order('created_at', { ascending: true });

      console.log('📊 Tracking events response:', { 
        count: data?.length || 0, 
        events: data,
        error: error 
      });

      if (error) throw error;
      setTrackingEvents(data || []);
      console.log('✅ Tracking events set:', data?.length || 0, 'events');
    } catch (error: unknown) {
      console.error('❌ Error fetching tracking events:', error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchShipment();
      fetchTrackingEvents();
    }
  }, [id, fetchShipment, fetchTrackingEvents]);

  // Also refresh tracking events when shipment data changes
  useEffect(() => {
    if (shipment && id) {
      // Add small delay to ensure database has processed the new tracking event
      const timer = setTimeout(() => {
        fetchTrackingEvents();
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [shipment?.status, id, fetchTrackingEvents]);

  // Refresh tracking events when window gains focus (user navigates back from edit page)
  useEffect(() => {
    const handleFocus = () => {
      if (id) {
        fetchTrackingEvents();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [id, fetchTrackingEvents]);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this shipment?')) return;

    try {
      const { error } = await supabase
        .from('shipments')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: "Shipment deleted",
        description: "The shipment has been deleted successfully",
      });
      
      navigate("/admin/shipments");
    } catch (error: unknown) {
      console.error('Error deleting shipment:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete shipment",
      });
    }
  };

  const handleUpdatePayment = async () => {
    if (!shipment) return;

    try {
      const updateData: {
        payment_status: string;
        amount_paid?: number | null;
      } = {
        payment_status: paymentStatus,
      };

      if (paymentStatus === 'paid' && amountPaid) {
        updateData.amount_paid = parseFloat(amountPaid);
      } else if (paymentStatus === 'unpaid') {
        updateData.amount_paid = null;
      }

      const { error } = await supabase
        .from('shipments')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Payment Updated",
        description: "Payment status has been updated successfully",
      });

      setIsEditingPayment(false);
      fetchShipment(); // Refresh shipment data
    } catch (error: unknown) {
      console.error('Error updating payment:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update payment status",
      });
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
        <Button variant="ghost" onClick={() => navigate("/admin/shipments")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Shipments
        </Button>
        <h1 className="text-2xl font-bold">Shipment Details</h1>
      </div>

      {/* Shipment Info */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-xl mb-2">{shipment.tracking_number}</CardTitle>
              <Badge variant="outline">
                {shipment.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </Badge>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link to={`/admin/shipments/${id}/edit`}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Link>
              </Button>
              <Button variant="destructive" size="sm" onClick={handleDelete}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Sender & Receiver */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <User className="h-4 w-4" />
                Sender Information
              </h3>
              <div className="space-y-2 text-sm">
                <p><strong>Name:</strong> {shipment.sender_name}</p>
                <p><strong>Phone:</strong> {shipment.sender_phone}</p>
                <p><strong>Email:</strong> {shipment.sender_email || 'N/A'}</p>
                <p><strong>Address:</strong> {shipment.sender_address}</p>
                <p><strong>City:</strong> {shipment.sender_city}</p>
                <p><strong>State:</strong> {shipment.sender_state || 'N/A'}</p>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Receiver Information
              </h3>
              <div className="space-y-2 text-sm">
                <p><strong>Name:</strong> {shipment.receiver_name}</p>
                <p><strong>Phone:</strong> {shipment.receiver_phone}</p>
                <p><strong>Email:</strong> {shipment.receiver_email || 'N/A'}</p>
                <p><strong>Address:</strong> {shipment.receiver_address}</p>
                <p><strong>City:</strong> {shipment.receiver_city}</p>
                <p><strong>State:</strong> {shipment.receiver_state || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Delivery Location */}
          {(shipment.receiver_address || shipment.receiver_city) && (
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-success" />
                Final Delivery Location
              </h3>
              <div className="space-y-2 text-sm">
                <p><strong>Address:</strong> {shipment.receiver_address || 'N/A'}</p>
                <p><strong>City:</strong> {shipment.receiver_city || 'N/A'}</p>
                <p><strong>State:</strong> {shipment.receiver_state || 'N/A'}</p>
              </div>
            </div>
          )}

          {/* Package & Pricing */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Package className="h-4 w-4" />
                Package Details
              </h3>
              <div className="space-y-2 text-sm">
                <p><strong>Description:</strong> {shipment.package_description || 'N/A'}</p>
                <p><strong>Weight:</strong> {shipment.weight} kg</p>
                <p><strong>Dimensions:</strong> {shipment.dimensions || 'N/A'}</p>
                <p><strong>Service Level:</strong> {shipment.service_level}</p>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Pricing Details
              </h3>
              <div className="space-y-2 text-sm">
                <p><strong>Base Price:</strong> ${shipment.base_price}</p>
                <p><strong>Weight Charge:</strong> ${shipment.weight_charge}</p>
                <p><strong>Service Charge:</strong> ${shipment.service_charge}</p>
                <p><strong>Insurance:</strong> ${shipment.insurance_fee}</p>
                <p><strong>Total Amount:</strong> ${shipment.total_amount}</p>
                <div className="flex items-center justify-between">
                  <div>
                    <strong>Payment Status:</strong>
                    <Badge 
                      variant={
                        shipment.payment_status === 'paid' ? 'default' :
                        shipment.payment_status === 'partial' ? 'secondary' : 'destructive'
                      }
                      className="ml-2"
                    >
                      {shipment.payment_status?.replace('_', ' ').toUpperCase() || 'UNPAID'}
                    </Badge>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setIsEditingPayment(true)}
                  >
                    Edit
                  </Button>
                </div>
                {typeof shipment.amount_paid === 'number' && (
                  <p><strong>Amount Paid:</strong> ${shipment.amount_paid}</p>
                )}
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Timeline
              </h3>
              <Button 
                variant="default" 
                size="sm"
                onClick={() => {
                  fetchTrackingEvents();
                  toast({
                    title: "Timeline Refreshed",
                    description: "Tracking events have been refreshed",
                  });
                }}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Timeline
              </Button>
            </div>
            <div className="space-y-4">
              {trackingEvents.length > 0 ? (
                trackingEvents.map((event, index) => (
                  <div key={event.id} className="flex gap-4 p-3 border-l-4 border-muted-foreground pl-4">
                    <div className="flex-shrink-0">
                      <div className="w-3 h-3 rounded-full bg-accent/10 flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-accent"></div>
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{event.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(event.created_at).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{event.description}</p>
                      {event.location && (
                        <p className="text-xs text-muted-foreground">
                          📍 {event.location}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No tracking events available</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Edit Dialog */}
      <Dialog open={isEditingPayment} onOpenChange={setIsEditingPayment}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Payment Status</DialogTitle>
            <DialogDescription>
              Update the payment status and amount for this shipment
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="paymentStatus">Payment Status</Label>
              <Select value={paymentStatus} onValueChange={setPaymentStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select payment status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unpaid">Unpaid</SelectItem>
                  <SelectItem value="partial">Partial</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {(paymentStatus === 'paid' || paymentStatus === 'partial') && (
              <div className="space-y-2">
                <Label htmlFor="amountPaid">Amount Paid ($)</Label>
                <Input
                  id="amountPaid"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={amountPaid}
                  onChange={(e) => setAmountPaid(e.target.value)}
                />
              </div>
            )}
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsEditingPayment(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdatePayment}>
                Update Payment
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
