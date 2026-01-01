import { useState, useRef, useEffect } from 'react';
import {
  QrCode,
  Search,
  Package,
  MapPin,
  CheckCircle2,
  ArrowRight,
  Camera,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { statusLabels, statusBadgeVariant, type Shipment, type ShipmentStatus, type Branch } from '@/lib/supabase-types';

const statusOptions: { value: ShipmentStatus; label: string }[] = [
  { value: 'received_at_origin', label: 'Received at Origin' },
  { value: 'in_transit', label: 'In Transit' },
  { value: 'arrived_at_destination', label: 'Arrived at Destination' },
  { value: 'out_for_delivery', label: 'Out for Delivery' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'exception', label: 'Exception' },
  { value: 'returned', label: 'Returned' },
];

export default function ScanPackage() {
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);

  const [updateForm, setUpdateForm] = useState({
    status: '' as ShipmentStatus | '',
    location: '',
    branch_id: '',
    notes: '',
  });

  useEffect(() => {
    fetchBranches();
    // Focus input on mount
    inputRef.current?.focus();
  }, []);

  const fetchBranches = async () => {
    try {
      const { data, error } = await supabase
        .from('branches')
        .select('*')
        .eq('is_active', true);

      if (error) throw error;
      setBranches(data || []);
    } catch (error) {
      console.error('Error fetching branches:', error);
    }
  };

  const searchShipment = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!trackingNumber.trim()) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('shipments')
        .select('*')
        .eq('tracking_number', trackingNumber.toUpperCase())
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setShipment(data);
        setUpdateForm({
          status: '',
          location: data.current_location || '',
          branch_id: data.current_branch_id || '',
          notes: '',
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Not Found',
          description: 'No shipment found with this tracking number.',
        });
        setShipment(null);
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const updateShipment = async () => {
    if (!shipment || !updateForm.status) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please select a status update.',
      });
      return;
    }

    setUpdating(true);
    try {
      // Update shipment
      const shipmentUpdate: Partial<Shipment> = {
        status: updateForm.status,
        current_location: updateForm.location || null,
        current_branch_id: updateForm.branch_id || null,
      };

      if (updateForm.status === 'delivered') {
        shipmentUpdate.delivered_at = new Date().toISOString();
      }

      const { error: shipmentError } = await supabase
        .from('shipments')
        .update(shipmentUpdate)
        .eq('id', shipment.id);

      if (shipmentError) throw shipmentError;

      // Create tracking event
      const { error: eventError } = await supabase
        .from('tracking_events')
        .insert([{
          shipment_id: shipment.id,
          event_type: updateForm.status,
          status: updateForm.status,
          location: updateForm.location || null,
          branch_id: updateForm.branch_id || null,
          description: statusLabels[updateForm.status],
          notes: updateForm.notes || null,
        }]);

      if (eventError) throw eventError;

      toast({
        title: 'Success!',
        description: `Shipment updated to: ${statusLabels[updateForm.status]}`,
      });

      // Reset for next scan
      setShipment(null);
      setTrackingNumber('');
      setUpdateForm({ status: '', location: '', branch_id: '', notes: '' });
      inputRef.current?.focus();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message,
      });
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold">Scan Package</h1>
        <p className="text-muted-foreground">
          Scan or enter tracking number to update shipment status
        </p>
      </div>

      {/* Search */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5 text-accent" />
            Enter Tracking Number
          </CardTitle>
          <CardDescription>
            Scan barcode or type the tracking number manually
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={searchShipment} className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                ref={inputRef}
                placeholder="SS2412310A1B2C..."
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value.toUpperCase())}
                className="pl-10 font-mono"
              />
            </div>
            <Button type="submit" variant="accent" disabled={loading}>
              {loading ? 'Searching...' : 'Search'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Shipment Details & Update */}
      {shipment && (
        <div className="space-y-6 animate-slide-up">
          {/* Current Status */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-accent" />
                    {shipment.tracking_number}
                  </CardTitle>
                  <CardDescription>
                    {shipment.sender_city} → {shipment.receiver_city}
                  </CardDescription>
                </div>
                <Badge variant={statusBadgeVariant[shipment.status] as any}>
                  {statusLabels[shipment.status]}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Sender:</span>
                  <p className="font-medium">{shipment.sender_name}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Receiver:</span>
                  <p className="font-medium">{shipment.receiver_name}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Weight:</span>
                  <p className="font-medium">{shipment.weight} kg</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Service:</span>
                  <p className="font-medium capitalize">{shipment.service_level.replace('_', ' ')}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Update Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowRight className="h-5 w-5 text-accent" />
                Update Status
              </CardTitle>
              <CardDescription>
                Select the new status and location for this shipment
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>New Status *</Label>
                  <Select
                    value={updateForm.status}
                    onValueChange={(value) => setUpdateForm({ ...updateForm, status: value as ShipmentStatus })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Branch / Hub</Label>
                  <Select
                    value={updateForm.branch_id}
                    onValueChange={(value) => {
                      const branch = branches.find((b) => b.id === value);
                      setUpdateForm({
                        ...updateForm,
                        branch_id: value,
                        location: branch ? `${branch.name}, ${branch.city}` : '',
                      });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select branch" />
                    </SelectTrigger>
                    <SelectContent>
                      {branches.map((branch) => (
                        <SelectItem key={branch.id} value={branch.id}>
                          {branch.name} ({branch.city})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <Label>Location Description</Label>
                  <Input
                    value={updateForm.location}
                    onChange={(e) => setUpdateForm({ ...updateForm, location: e.target.value })}
                    placeholder="e.g., Lagos Distribution Center"
                  />
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <Label>Notes (optional)</Label>
                  <Textarea
                    value={updateForm.notes}
                    onChange={(e) => setUpdateForm({ ...updateForm, notes: e.target.value })}
                    placeholder="Any additional notes about this scan..."
                    rows={2}
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setShipment(null);
                    setTrackingNumber('');
                    inputRef.current?.focus();
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="accent"
                  className="flex-1"
                  onClick={updateShipment}
                  disabled={updating || !updateForm.status}
                >
                  {updating ? 'Updating...' : (
                    <>
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Confirm Update
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
