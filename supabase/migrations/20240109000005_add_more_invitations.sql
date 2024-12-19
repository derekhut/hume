-- Insert 15 new invitation codes (valid for 30 days)
INSERT INTO invitations (inviter_id, invitation_code, expires_at)
VALUES 
    ((SELECT id FROM users WHERE username = 'Derek' LIMIT 1), 'AICAMP-TONG', TIMEZONE('utc'::text, NOW()) + INTERVAL '30 days'),
    ((SELECT id FROM users WHERE username = 'Derek' LIMIT 1), 'AICAMP-HAOYI', TIMEZONE('utc'::text, NOW()) + INTERVAL '30 days'),
    ((SELECT id FROM users WHERE username = 'Derek' LIMIT 1), 'AICAMP-YIJUN', TIMEZONE('utc'::text, NOW()) + INTERVAL '30 days'),
    ((SELECT id FROM users WHERE username = 'Derek' LIMIT 1), 'AICAMP-JIAXIN', TIMEZONE('utc'::text, NOW()) + INTERVAL '30 days'),
    ((SELECT id FROM users WHERE username = 'Derek' LIMIT 1), 'AICAMP-JIAYI', TIMEZONE('utc'::text, NOW()) + INTERVAL '30 days'),
    ((SELECT id FROM users WHERE username = 'Derek' LIMIT 1), 'AICAMP-QIXIN', TIMEZONE('utc'::text, NOW()) + INTERVAL '30 days'),
    ((SELECT id FROM users WHERE username = 'Derek' LIMIT 1), 'AICAMP-RUIYAO', TIMEZONE('utc'::text, NOW()) + INTERVAL '30 days'),
    ((SELECT id FROM users WHERE username = 'Derek' LIMIT 1), 'AICAMP-TIANYI', TIMEZONE('utc'::text, NOW()) + INTERVAL '30 days'),
    ((SELECT id FROM users WHERE username = 'Derek' LIMIT 1), 'AICAMP-XIAOWEN', TIMEZONE('utc'::text, NOW()) + INTERVAL '30 days'),
    ((SELECT id FROM users WHERE username = 'Derek' LIMIT 1), 'AICAMP-YULUN', TIMEZONE('utc'::text, NOW()) + INTERVAL '30 days'),
    ((SELECT id FROM users WHERE username = 'Derek' LIMIT 1), 'AICAMP-YUZHOU', TIMEZONE('utc'::text, NOW()) + INTERVAL '30 days'),
    ((SELECT id FROM users WHERE username = 'Derek' LIMIT 1), 'AICAMP-ZHAO', TIMEZONE('utc'::text, NOW()) + INTERVAL '30 days'),
    ((SELECT id FROM users WHERE username = 'Derek' LIMIT 1), 'AICAMP-ZONGYUAN', TIMEZONE('utc'::text, NOW()) + INTERVAL '30 days');
