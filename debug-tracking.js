// Debug script to check tracking events
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function debugTracking() {
  console.log('=== DEBUG: Checking tracking events ===');
  
  // Get all shipments
  const { data: shipments, error: shipmentError } = await supabase
    .from('shipments')
    .select('id, tracking_number, status')
    .order('created_at', { ascending: false })
    .limit(5);
    
  if (shipmentError) {
    console.error('Error fetching shipments:', shipmentError);
    return;
  }
  
  console.log('Recent shipments:', shipments);
  
  // For each shipment, get tracking events
  for (const shipment of shipments || []) {
    console.log(`\n--- Tracking events for ${shipment.tracking_number} (Status: ${shipment.status}) ---`);
    
    const { data: events, error: eventError } = await supabase
      .from('tracking_events')
      .select('*')
      .eq('shipment_id', shipment.id)
      .order('created_at', { ascending: true });
      
    if (eventError) {
      console.error('Error fetching events:', eventError);
    } else {
      console.log('Events:', events);
    }
  }
}

debugTracking();
