// Import types from supabase.ts
import type {
  ShipmentStatus,
  ServiceLevel,
  AppRole,
  Branch,
  Customer,
  Driver,
  PricingRule,
  Settings,
  TrackingEvent,
} from './supabase';

// Add TransportMode type
export type TransportMode = 'road' | 'sea' | 'air';

// Re-export all types
export type {
  ShipmentStatus,
  ServiceLevel,
  AppRole,
  Branch,
  Customer,
  PricingRule,
  Settings,
  TrackingEvent,
};

// Re-export statusLabels
export { statusLabels } from './supabase';

// Badge variants for different shipment statuses
export const statusBadgeVariant: Record<ShipmentStatus, 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning'> = {
  created: 'secondary',
  received_at_origin: 'default',
  in_transit: 'default',
  arrived_at_destination: 'default',
  out_for_delivery: 'warning',
  delivered: 'success',
  exception: 'destructive',
  returned: 'destructive',
  cancelled: 'destructive'
};

// Add any additional types specific to the frontend here
export interface ScanResult {
  trackingNumber: string;
  status: ShipmentStatus;
  location: string;
  timestamp: string;
  notes?: string;
}

export interface ScanPackageFormData {
  trackingNumber: string;
  status: ShipmentStatus;
  location: string;
  notes?: string;
}

export interface ScanPackageResponse {
  success: boolean;
  message: string;
  data?: {
    shipment: Shipment;
    trackingEvent: TrackingEvent;
  };
  error?: string;
}

export interface Shipment {
  id: string;
  tracking_number: string;
  sender_name: string;
  sender_phone: string;
  sender_email: string | null;
  sender_address: string;
  sender_city: string;
  sender_state: string | null;
  receiver_name: string;
  receiver_phone: string;
  receiver_email: string | null;
  receiver_address: string;
  receiver_city: string;
  receiver_state: string | null;
  delivery_address: string | null;
  delivery_city: string | null;
  delivery_state: string | null;
  package_description: string | null;
  weight: number;
  dimensions: string | null;
  declared_value: number | null;
  service_level: ServiceLevel;
  transport_mode: TransportMode;
  origin_branch_id: string | null;
  destination_branch_id: string | null;
  current_branch_id: string | null;
  assigned_driver_id: string | null;
  base_price: number;
  weight_charge: number;
  service_charge: number;
  insurance_fee: number;
  total_amount: number;
  payment_status: string;
  amount_paid: number | null;
  status: ShipmentStatus;
  current_location: string | null;
  estimated_delivery: string | null;
  delivered_at: string | null;
  pickup_date: string | null;
  pod_signature: string | null;
  pod_photo_url: string | null;
  pod_receiver_name: string | null;
  notes: string | null;
  created_by: string | null;
  customer_id: string | null;
  created_at: string;
  updated_at: string;
  origin_branch?: Branch;
  destination_branch?: Branch;
  assigned_driver?: Driver;
}
