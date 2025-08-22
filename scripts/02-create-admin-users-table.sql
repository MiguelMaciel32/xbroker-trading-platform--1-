-- Create admin_users table to manage admin access
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  is_super_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create trigger to auto-update updated_at
CREATE TRIGGER update_admin_users_updated_at 
    BEFORE UPDATE ON admin_users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_config ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admin users can view all admin_users" ON admin_users
  FOR SELECT USING (auth.uid() IN (SELECT user_id FROM admin_users));

CREATE POLICY "Super admins can manage admin_users" ON admin_users
  FOR ALL USING (auth.uid() IN (SELECT user_id FROM admin_users WHERE is_super_admin = true));

CREATE POLICY "Anyone can view platform_config" ON platform_config
  FOR SELECT USING (true);

CREATE POLICY "Admin users can update platform_config" ON platform_config
  FOR UPDATE USING (auth.uid() IN (SELECT user_id FROM admin_users));
