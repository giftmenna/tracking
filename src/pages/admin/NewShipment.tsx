import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Package, User, MapPin, Scale, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DimensionPicker } from "@/components/ui/dimension-picker-simple";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

export default function NewShipment() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // State for form data
  const [formData, setFormData] = useState({
    weight: '',
    dimensions: '',
    service: 'standard',
    transportMode: 'road',
    declaredValue: '',
    pickupDate: '',
    pickupTime: '',
    estimatedDeliveryDate: '',
    notes: ''
  });
  
  // State for pricing rules
  const [pricingRules, setPricingRules] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Create refs for form elements
  const senderNameRef = useRef<HTMLInputElement>(null);
  const senderPhoneRef = useRef<HTMLInputElement>(null);
  const senderEmailRef = useRef<HTMLInputElement>(null);
  const senderAddressRef = useRef<HTMLInputElement>(null);
  const senderCityRef = useRef<HTMLInputElement>(null);
  const senderStateRef = useRef<HTMLInputElement>(null);
  const receiverNameRef = useRef<HTMLInputElement>(null);
  const receiverPhoneRef = useRef<HTMLInputElement>(null);
  const receiverEmailRef = useRef<HTMLInputElement>(null);
  const receiverAddressRef = useRef<HTMLInputElement>(null);
  const receiverCityRef = useRef<HTMLInputElement>(null);
  const receiverStateRef = useRef<HTMLInputElement>(null);
  const deliveryAddressRef = useRef<HTMLInputElement>(null);
  const deliveryCityRef = useRef<HTMLInputElement>(null);
  const deliveryStateRef = useRef<HTMLInputElement>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);

  // Fetch pricing rules on component mount
  useEffect(() => {
    const fetchPricingRules = async () => {
      try {
        const { data, error } = await supabase
          .from('pricing_rules')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        setPricingRules(data || []);
      } catch (error) {
        console.error('Error fetching pricing rules:', error);
      }
    };
    
    fetchPricingRules();
  }, []);

  // Calculate pricing in real-time using database rules
  const calculatePricing = () => {
    const weight = parseFloat(formData.weight) || 0;
    const serviceLevel = formData.service;
    const declaredValue = parseFloat(formData.declaredValue) || 0;
    
    // Get pricing rules from database or use defaults
    let basePrice = 15; // Default base price
    let pricePerKg = 5; // Default price per kg
    
    // Try to find matching pricing rule
    if (pricingRules.length > 0) {
      const defaultRule = pricingRules.find(rule => !rule.origin_zone && !rule.destination_zone);
      if (defaultRule) {
        basePrice = defaultRule.base_price;
        pricePerKg = defaultRule.price_per_kg || 5;
      }
    }
    
    const weightCharge = weight * pricePerKg;
    let serviceMultiplier = 1;
    
    if (serviceLevel === 'express') serviceMultiplier = 1.5;
    if (serviceLevel === 'sameday') serviceMultiplier = 2.0;
    
    const serviceCharge = (basePrice + weightCharge) * (serviceMultiplier - 1);
    const insuranceFee = declaredValue * 0.02; // 2% insurance
    const totalAmount = basePrice + weightCharge + serviceCharge + insuranceFee;
    
    return {
      basePrice,
      weightCharge,
      serviceCharge,
      insuranceFee,
      totalAmount
    };
  };

  const pricing = calculatePricing();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const senderName = senderNameRef.current?.value?.trim() ?? '';
      if (!senderName) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Sender name is required",
        });
        return;
      }

      const receiverName = receiverNameRef.current?.value?.trim() ?? '';
      if (!receiverName) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Receiver name is required",
        });
        return;
      }

      // Generate a simple tracking number without database function
      const timestamp = new Date().getTime().toString(36).toUpperCase();
      const random = Math.random().toString(36).substring(2, 8).toUpperCase();
      const trackingNumber = `SS${timestamp}${random}`;

      // Calculate pricing using current form state
      const weight = parseFloat(formData.weight) || 0;
      const serviceLevel = formData.service;
      const declaredValue = parseFloat(formData.declaredValue) || 0;
      
      const basePrice = 15; // Base price in dollars
      const weightCharge = weight * 5; // 5 dollars per kg
      let serviceMultiplier = 1;
      
      if (serviceLevel === 'express') serviceMultiplier = 1.5;
      if (serviceLevel === 'sameday') serviceMultiplier = 2.0;
      
      const serviceCharge = (basePrice + weightCharge) * (serviceMultiplier - 1);
      const insuranceFee = declaredValue * 0.02; // 2% insurance
      const totalAmount = basePrice + weightCharge + serviceCharge + insuranceFee;

      const estimatedDelivery = formData.estimatedDeliveryDate 
        ? new Date(formData.estimatedDeliveryDate).toISOString() 
        : new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(); // 3 days from now

      // Combine pickup date and time for pickup timestamp
      let pickupTimestamp = null;
      if (formData.pickupDate && formData.pickupTime) {
        const [hours, minutes] = formData.pickupTime.split(':');
        const pickupDate = new Date(formData.pickupDate);
        pickupDate.setHours(parseInt(hours), parseInt(minutes));
        pickupTimestamp = pickupDate.toISOString();
      }

      console.log('Creating shipment with tracking number:', trackingNumber);
      console.log('Form data:', {
        senderName: senderNameRef.current?.value,
        senderPhone: senderPhoneRef.current?.value,
        weight: weight,
        serviceLevel: serviceLevel
      });

      // Create shipment using refs
      const { data: shipmentData, error: shipmentError } = await supabase
        .from('shipments')
        .insert({
          tracking_number: trackingNumber,
          sender_name: senderName,
          sender_phone: senderPhoneRef.current?.value?.trim() ?? '',
          sender_email: senderEmailRef.current?.value?.trim() ?? '',
          sender_address: senderAddressRef.current?.value?.trim() ?? '',
          sender_city: senderCityRef.current?.value?.trim() ?? '',
          sender_state: senderStateRef.current?.value?.trim() ?? '',
          receiver_name: receiverName,
          receiver_phone: receiverPhoneRef.current?.value?.trim() ?? '',
          receiver_email: receiverEmailRef.current?.value?.trim() ?? '',
          receiver_address: receiverAddressRef.current?.value?.trim() ?? '',
          receiver_city: receiverCityRef.current?.value?.trim() ?? '',
          receiver_state: receiverStateRef.current?.value?.trim() ?? '',
          delivery_address: deliveryAddressRef.current?.value?.trim() ?? '',
          delivery_city: deliveryCityRef.current?.value?.trim() ?? '',
          delivery_state: deliveryStateRef.current?.value?.trim() ?? '',
          package_description: descriptionRef.current?.value?.trim() ?? '',
          weight: weight,
          dimensions: formData.dimensions,
          declared_value: declaredValue,
          service_level: serviceLevel,
          transport_mode: formData.transportMode,
          base_price: basePrice,
          weight_charge: weightCharge,
          service_charge: serviceCharge,
          insurance_fee: insuranceFee,
          total_amount: totalAmount,
          payment_status: 'unpaid',
          status: 'created',
          current_location: senderCityRef.current?.value?.trim() ?? '',
          estimated_delivery: estimatedDelivery,
          notes: descriptionRef.current?.value?.trim() ?? '',
          pickup_date: pickupTimestamp,
          created_by: null, // Use null instead of invalid UUID
          customer_id: null
        })
        .select()
        .single();

      console.log('Shipment insert result:', { shipmentData, shipmentError });

      if (shipmentError) {
        console.error('Shipment insertion error:', shipmentError);
        throw shipmentError;
      }

      // Create initial tracking event
      const { error: eventError } = await supabase
        .from('tracking_events')
        .insert({
          shipment_id: shipmentData.id,
          event_type: 'created',
          status: 'created',
          description: 'Shipment created and awaiting pickup',
          created_by: null // Use null instead of invalid UUID
        });

      if (eventError) {
        console.error('Tracking event error:', eventError);
        // Don't throw error for tracking event - shipment is still created
      }

      toast({
        title: "Shipment Created!",
        description: `Tracking number: ${trackingNumber}`,
      });

      navigate("/admin/shipments");
    } catch (error: any) {
      console.error('Error creating shipment:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to create shipment",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <Button
          variant="ghost"
          className="mb-4"
          onClick={() => navigate("/admin/shipments")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Shipments
        </Button>
        <h1 className="text-2xl md:text-3xl font-bold">Create New Shipment</h1>
        <p className="text-muted-foreground">
          Fill in the shipment details below
        </p>
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
              <Input id="senderName" placeholder="John Doe" ref={senderNameRef} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="senderPhone">Phone Number</Label>
              <Input id="senderPhone" placeholder="+1 (555) 800-0000" ref={senderPhoneRef} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="senderEmail">Email Address</Label>
              <Input id="senderEmail" type="email" placeholder="john@example.com" ref={senderEmailRef} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="senderAddress">Address</Label>
              <Input id="senderAddress" placeholder="123 Main St" ref={senderAddressRef} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="senderCity">City</Label>
              <Input id="senderCity" placeholder="San Francisco" ref={senderCityRef} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="senderZip">ZIP Code</Label>
              <Input id="senderZip" placeholder="94102" ref={senderStateRef} required />
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
              <Input id="receiverName" placeholder="Jane Smith" ref={receiverNameRef} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="receiverPhone">Phone Number</Label>
              <Input
                id="receiverPhone"
                placeholder="+1 (555) 987-6543"
                ref={receiverPhoneRef}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="receiverEmail">Email</Label>
              <Input
                id="receiverEmail"
                type="email"
                placeholder="jane@example.com"
                ref={receiverEmailRef}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="receiverAddress">Address</Label>
              <Input id="receiverAddress" placeholder="456 Oak Ave" ref={receiverAddressRef} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="receiverCity">City</Label>
              <Input id="receiverCity" placeholder="Tokyo" ref={receiverCityRef} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="receiverZip">ZIP Code</Label>
              <Input id="receiverZip" placeholder="100-0001" ref={receiverStateRef} required />
            </div>
          </CardContent>
        </Card>

        {/* Delivery Location */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <MapPin className="h-5 w-5 text-success" />
              Final Delivery Location
            </CardTitle>
            <CardDescription>
              Where the package will actually be delivered (if different from receiver address)
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="deliveryAddress">Delivery Address</Label>
              <Input id="deliveryAddress" placeholder="123 Sukhumvit Road, Suite 100" ref={deliveryAddressRef} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="deliveryCity">Delivery City</Label>
              <Input id="deliveryCity" placeholder="Bangkok" ref={deliveryCityRef} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="deliveryState">Delivery State</Label>
              <Input id="deliveryState" placeholder="Thailand" ref={deliveryStateRef} />
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
              <Input
                id="weight"
                type="number"
                step="0.1"
                placeholder="2.5"
                value={formData.weight}
                onChange={(e) => setFormData({...formData, weight: e.target.value})}
                required
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="dimensions">Package Dimensions</Label>
              <DimensionPicker
                id="dimensions"
                placeholder="Select package dimensions"
                value={formData.dimensions}
                onChange={(value) => setFormData({...formData, dimensions: value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="service">Service Type</Label>
              <Select 
                value={formData.service}
                onValueChange={(value) => setFormData({...formData, service: value})}
              >
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
              <Label htmlFor="transportMode">Transport Mode</Label>
              <Select 
                value={formData.transportMode}
                onValueChange={(value) => setFormData({...formData, transportMode: value})}
              >
                <SelectTrigger id="transportMode">
                  <SelectValue placeholder="Select transport mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="road">🚗 Road (Truck)</SelectItem>
                  <SelectItem value="sea">🚢 Sea (Ship)</SelectItem>
                  <SelectItem value="air">✈️ Air (Plane)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="declaredValue">Declared Value ($)</Label>
              <Input
                id="declaredValue"
                type="number"
                step="0.01"
                placeholder="100.00"
                value={formData.declaredValue}
                onChange={(e) => setFormData({...formData, declaredValue: e.target.value})}
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="description">Package Description</Label>
              <Textarea
                id="description"
                placeholder="Describe the contents of the package..."
                rows={3}
                ref={descriptionRef}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pickupDate">Pickup Date</Label>
              <Input 
                id="pickupDate" 
                type="date" 
                value={formData.pickupDate}
                onChange={(e) => setFormData({...formData, pickupDate: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pickupTime">Pickup Time</Label>
              <Input 
                id="pickupTime" 
                type="time" 
                value={formData.pickupTime}
                onChange={(e) => setFormData({...formData, pickupTime: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="estimatedDelivery">Estimated Delivery Date</Label>
              <Input 
                id="estimatedDelivery" 
                type="date" 
                value={formData.estimatedDeliveryDate}
                onChange={(e) => setFormData({...formData, estimatedDeliveryDate: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Additional notes about this shipment..."
                rows={2}
              />
            </div>
          </CardContent>
        </Card>

        {/* Pricing Summary */}
        <Card className="bg-secondary/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Scale className="h-5 w-5 text-accent" />
              Pricing Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Base Rate</span>
                <span>${pricing.basePrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Weight Charge</span>
                <span>${pricing.weightCharge.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Service Fee</span>
                <span>${pricing.serviceCharge.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Insurance</span>
                <span>${pricing.insuranceFee.toLocaleString()}</span>
              </div>
              <div className="border-t border-border pt-2 mt-2 flex justify-between font-semibold text-base">
                <span>Total</span>
                <span className="text-accent">${pricing.totalAmount.toLocaleString()}</span>
              </div>
            </div>
            
            {/* Pricing Breakdown */}
            <div className="mt-4 pt-4 border-t border-border">
              <div className="text-xs text-muted-foreground space-y-1">
                <div>• Base Rate: ${pricing.basePrice} (flat fee)</div>
                <div>• Weight: {formData.weight || '0'} kg × $200 = ${pricing.weightCharge}</div>
                <div>• Service Level: {formData.service === 'standard' ? 'Standard (no extra)' : formData.service === 'express' ? 'Express (×1.5)' : 'Same Day (×2.0)'}</div>
                <div>• Insurance: {formData.declaredValue || '0'} × 2% = ${pricing.insuranceFee}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex flex-col sm:flex-row gap-3 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/admin/shipments")}
          >
            Cancel
          </Button>
          <Button type="submit" variant="accent" disabled={isSubmitting}>
            {isSubmitting ? (
              <>Creating...</>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Create Shipment
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
