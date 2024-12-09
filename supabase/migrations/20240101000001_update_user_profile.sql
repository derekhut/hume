-- First, drop the columns we don't need
ALTER TABLE users
DROP COLUMN IF EXISTS work_title,
DROP COLUMN IF EXISTS work_history;

-- Then add the new columns we need
ALTER TABLE users
ADD COLUMN IF NOT EXISTS nickname TEXT,
ADD COLUMN IF NOT EXISTS zodiac TEXT,
ADD COLUMN IF NOT EXISTS mbti TEXT,
ADD COLUMN IF NOT EXISTS interests TEXT,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW());

-- Create an index on username for faster lookups
CREATE INDEX IF NOT EXISTS users_username_idx ON users(username);

-- Add a trigger to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Update existing users with default values if needed
UPDATE users
SET 
    nickname = username,  -- Set nickname to username as default
    updated_at = CURRENT_TIMESTAMP
WHERE nickname IS NULL;
