-- Create schools table
CREATE TABLE IF NOT EXISTS schools (
    code text PRIMARY KEY,
    name text NOT NULL,
    created_at timestamptz DEFAULT now()
);

-- Insert initial schools
INSERT INTO schools (code, name) VALUES
    ('0001', '上海宋庆龄学校')
ON CONFLICT (code) DO NOTHING;

-- Update school_id to school_code in users table
ALTER TABLE users 
DROP COLUMN IF EXISTS school_id,
ADD COLUMN school_code text REFERENCES schools(code);
