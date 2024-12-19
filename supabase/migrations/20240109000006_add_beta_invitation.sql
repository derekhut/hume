-- Insert beta invitation code (valid for 30 days)
INSERT INTO invitations (inviter_id, invitation_code, expires_at)
VALUES 
    ((SELECT id FROM users WHERE username = 'Derek' LIMIT 1), 'BETA-WEIDE', TIMEZONE('utc'::text, NOW()) + INTERVAL '30 days');
