-- Add gender and birthday columns to users table
ALTER TABLE users
ADD COLUMN IF NOT EXISTS gender TEXT CHECK (gender IN ('male', 'female')),
ADD COLUMN IF NOT EXISTS birthday DATE;
