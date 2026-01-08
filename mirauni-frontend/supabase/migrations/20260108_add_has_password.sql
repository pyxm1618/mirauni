-- Add has_password to users
ALTER TABLE users ADD COLUMN IF NOT EXISTS has_password BOOLEAN DEFAULT false;

-- Create user_secrets table
CREATE TABLE IF NOT EXISTS user_secrets (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  password_hash TEXT,
  supabase_password TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for user_secrets
ALTER TABLE user_secrets ENABLE ROW LEVEL SECURITY;

-- Deny all access to user_secrets (only Service Role can access)
CREATE POLICY "Service Role can manage user_secrets"
  ON user_secrets
  USING (false);

-- Add trigger for updated_at
CREATE TRIGGER update_user_secrets_updated_at 
  BEFORE UPDATE ON user_secrets 
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
