import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(`
    Missing Supabase environment variables. Please check your .env file.
    VITE_SUPABASE_URL: ${supabaseUrl ? '✅' : '❌'}
    VITE_SUPABASE_ANON_KEY: ${supabaseAnonKey ? '✅' : '❌'}
  `);
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types
export type ShipmentStatus = 
  | 'created'
  | 'received_at_origin'
  | 'in_transit'
  | 'arrived_at_destination'
  | 'out_for_delivery'
  | 'delivered'
  | 'exception'
  | 'returned'
  | 'cancelled';

export type ServiceLevel = 'standard' | 'express' | 'same_day';
export type TransportMode = 'road' | 'sea' | 'air';
export type AppRole = 'admin' | 'staff' | 'driver' | 'customer';

export interface Branch {
  id: string;
  name: string;
  code: string;
  address: string;
  city: string;
  state: string | null;
  country: string;
  phone: string | null;
  email: string | null;
  latitude: number | null;
  longitude: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: string;
  user_id: string | null;
  name: string;
  email: string | null;
  phone: string;
  company: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Driver {
  id: string;
  user_id: string | null;
  name: string;
  phone: string;
  email: string | null;
  license_number: string | null;
  vehicle_type: string | null;
  vehicle_plate: string | null;
  branch_id: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  branch?: Branch;
}

export interface PricingRule {
  id: string;
  name: string;
  origin_zone: string | null;
  destination_zone: string | null;
  base_price: number;
  price_per_kg: number;
  express_multiplier: number;
  same_day_multiplier: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
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

export interface TrackingEvent {
  id: string;
  shipment_id: string;
  event_type: string;
  status: ShipmentStatus;
  location: string | null;
  branch_id: string | null;
  description: string | null;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  branch?: Branch;
}

export interface Settings {
  id: string;
  key: string;
  value: Record<string, unknown>;
  description: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
}

export const statusLabels: Record<ShipmentStatus, string> = {
  created: 'Created',
  received_at_origin: 'Received at Origin',
  in_transit: 'In Transit',
  arrived_at_destination: 'Arrived at Destination',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
  exception: 'Exception',
  returned: 'Returned',
  cancelled: 'Cancelled',
};

export const statusBadgeVariant: Record<ShipmentStatus, string> = {
  created: 'pending',
  received_at_origin: 'pending',
  in_transit: 'transit',
  arrived_at_destination: 'transit',
  out_for_delivery: 'transit',
  delivered: 'delivered',
  exception: 'exception',
  returned: 'exception',
  cancelled: 'exception',
};

export const serviceLevelLabels: Record<ServiceLevel, string> = {
  standard: 'Standard (3-5 days)',
  express: 'Express (1-2 days)',
  same_day: 'Same Day',
};