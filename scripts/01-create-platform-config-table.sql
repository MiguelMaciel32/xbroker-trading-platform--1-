-- Create platform_config table to store whitelabel configurations
CREATE TABLE IF NOT EXISTS platform_config (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key VARCHAR(255) UNIQUE NOT NULL,
  value TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default configurations
INSERT INTO platform_config (key, value, description) VALUES
  ('platform_name', 'XBroker', 'Nome da plataforma'),
  ('community_name', 'COMUNIDADE XBROKER', 'Nome da comunidade na sidebar'),
  ('support_link', 'https://wa.me/5511999999999', 'Link do suporte (WhatsApp)'),
  ('support_text', 'SUPORTE', 'Texto do botão de suporte'),
  ('logo_url', '/logo.png', 'URL do logo da plataforma'),
  ('primary_color', '#248f32', 'Cor primária da plataforma'),
  ('secondary_color', '#d1281f', 'Cor secundária da plataforma')
ON CONFLICT (key) DO NOTHING;

-- Create function to update timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to auto-update updated_at
CREATE TRIGGER update_platform_config_updated_at 
    BEFORE UPDATE ON platform_config 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
