import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with service role key (only for server-side use)
const supabaseUrl = 'https://ulplwdszghztpkgrutxz.supabase.co';
const supabaseServiceKey = 'YOUR_SERVICE_ROLE_KEY'; // Get this from Supabase dashboard -> Project Settings -> API -> service_role
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupAdminUser() {
  try {
    // Create or get the admin user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: 'admin@example.com',
      password: 'admin123',
      email_confirm: true, // Mark email as confirmed
      user_metadata: {
        full_name: 'Admin User',
        role: 'admin'
      }
    });

    if (authError) {
      // If user already exists, update to confirm email
      if (authError.message.includes('already registered')) {
        console.log('Admin user exists, updating...');
        const { data: userList } = await supabase.auth.admin.listUsers();
        const adminUser = userList.users.find(u => u.email === 'admin@example.com');
        
        if (adminUser) {
          await supabase.auth.admin.updateUserById(adminUser.id, {
            email_confirm: true,
            password: 'admin123',
            user_metadata: {
              full_name: 'Admin User',
              role: 'admin'
            }
          });
          console.log('Admin user updated successfully!');
        }
      } else {
        console.error('Error creating admin user:', authError);
        return;
      }
    } else {
      console.log('Admin user created successfully!');
    }

    console.log('Admin setup complete. You can now log in with:');
    console.log('Email: admin@example.com');
    console.log('Password: admin123');

  } catch (error) {
    console.error('Error setting up admin user:', error);
  }
}

// Run the setup
setupAdmin();
