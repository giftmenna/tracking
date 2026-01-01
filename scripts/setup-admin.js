// Simple script to create admin user for development
// Run this once to set up the admin account

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ulplwdszghztpkgrutxz.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVscGx3ZHN6Z2h6dHBrZ3J1dHh6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzI0NTAyNSwiZXhwIjoyMDgyODIxMDI1fQ.pBfkSsN_x5-t9y2G6U6qJ-8f5h8h8Qh8h8Qh8h8Qh8';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createAdminUser() {
  try {
    console.log('Creating admin user...');
    
    const { data, error } = await supabase.auth.admin.createUser({
      email: 'admin@swiftship.com',
      password: 'admin123',
      email_confirm: true,
      user_metadata: {
        full_name: 'Admin User',
        role: 'admin'
      }
    });

    if (error) {
      console.error('Error creating admin user:', error);
      return;
    }

    console.log('Admin user created successfully:', data.user);
    console.log('You can now login with:');
    console.log('Email: admin@swiftship.com');
    console.log('Password: admin123');
  } catch (error) {
    console.error('Error:', error);
  }
}

createAdminUser();
