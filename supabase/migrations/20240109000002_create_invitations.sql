-- Insert invitation codes for the initial students
INSERT INTO invitations (invitation_code, inviter_id, expires_at, is_used)
VALUES 
    ('XK7M-9NP4-HJLW', (SELECT id FROM users WHERE username = 'Derek' LIMIT 1), NOW() + INTERVAL '30 days', false),
    ('RT6Q-2VB8-KMNC', (SELECT id FROM users WHERE username = 'Derek' LIMIT 1), NOW() + INTERVAL '30 days', false),
    ('YH3W-5SD9-PQRX', (SELECT id FROM users WHERE username = 'Derek' LIMIT 1), NOW() + INTERVAL '30 days', false),
    ('UF8E-4TG7-VWYZ', (SELECT id FROM users WHERE username = 'Derek' LIMIT 1), NOW() + INTERVAL '30 days', false),
    ('JL2K-6AB3-CDMN', (SELECT id FROM users WHERE username = 'Derek' LIMIT 1), NOW() + INTERVAL '30 days', false),
    ('WP5X-8HQ4-RSTU', (SELECT id FROM users WHERE username = 'Derek' LIMIT 1), NOW() + INTERVAL '30 days', false),
    ('BN7Y-3MF6-GHKL', (SELECT id FROM users WHERE username = 'Derek' LIMIT 1), NOW() + INTERVAL '30 days', false),
    ('ZC4D-9EJ2-WXYA', (SELECT id FROM users WHERE username = 'Derek' LIMIT 1), NOW() + INTERVAL '30 days', false),
    ('QT6V-5PB8-MNRS', (SELECT id FROM users WHERE username = 'Derek' LIMIT 1), NOW() + INTERVAL '30 days', false),
    ('KH3W-7UG4-DFHJ', (SELECT id FROM users WHERE username = 'Derek' LIMIT 1), NOW() + INTERVAL '30 days', false),
    ('XL9C-2YB5-KPQR', (SELECT id FROM users WHERE username = 'Derek' LIMIT 1), NOW() + INTERVAL '30 days', false),
    ('MT4N-8AE6-VWXZ', (SELECT id FROM users WHERE username = 'Derek' LIMIT 1), NOW() + INTERVAL '30 days', false),
    ('RJ7S-3FH2-BCGK', (SELECT id FROM users WHERE username = 'Derek' LIMIT 1), NOW() + INTERVAL '30 days', false),
    ('WQ5D-6TL9-MNPY', (SELECT id FROM users WHERE username = 'Derek' LIMIT 1), NOW() + INTERVAL '30 days', false),
    ('ZU8X-4VC7-RSTU', (SELECT id FROM users WHERE username = 'Derek' LIMIT 1), NOW() + INTERVAL '30 days', false),
    ('YH2B-5WK3-DFGH', (SELECT id FROM users WHERE username = 'Derek' LIMIT 1), NOW() + INTERVAL '30 days', false),
    ('NM6E-9AJ4-LPQX', (SELECT id FROM users WHERE username = 'Derek' LIMIT 1), NOW() + INTERVAL '30 days', false),
    ('CT8R-7UF2-VWYZ', (SELECT id FROM users WHERE username = 'Derek' LIMIT 1), NOW() + INTERVAL '30 days', false),
    ('BK4H-3PG5-MNST', (SELECT id FROM users WHERE username = 'Derek' LIMIT 1), NOW() + INTERVAL '30 days', false),
    ('QL9W-6DC8-RXYZ', (SELECT id FROM users WHERE username = 'Derek' LIMIT 1), NOW() + INTERVAL '30 days', false);
