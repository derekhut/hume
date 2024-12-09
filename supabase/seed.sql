-- Insert the school
INSERT INTO schools (id, name)
VALUES (
    '550e8400-e29b-41d4-a716-446655440000',  -- Valid UUID for school
    '宋庆龄学校'
) ON CONFLICT (id) DO NOTHING;

-- Insert the founder
INSERT INTO users (id, username, school_id, is_active)
VALUES (
    '550e8400-e29b-41d4-a716-446655440001',  -- Valid UUID for founder
    'Derek',
    '550e8400-e29b-41d4-a716-446655440000',  -- School UUID
    true
) ON CONFLICT (username) DO NOTHING;

-- Insert invitation codes (valid for 30 days)
INSERT INTO invitations (inviter_id, school_id, invitation_code, expires_at)
VALUES 
    (
        '550e8400-e29b-41d4-a716-446655440001',  -- Founder's UUID
        '550e8400-e29b-41d4-a716-446655440000',  -- School UUID
        'FOUNDER-CODE-001',
        TIMEZONE('utc'::text, NOW()) + INTERVAL '30 days'
    ),
    (
        '550e8400-e29b-41d4-a716-446655440001',
        '550e8400-e29b-41d4-a716-446655440000',
        'FOUNDER-CODE-002',
        TIMEZONE('utc'::text, NOW()) + INTERVAL '30 days'
    ),
    (
        '550e8400-e29b-41d4-a716-446655440001',
        '550e8400-e29b-41d4-a716-446655440000',
        'FOUNDER-CODE-003',
        TIMEZONE('utc'::text, NOW()) + INTERVAL '30 days'
    );
