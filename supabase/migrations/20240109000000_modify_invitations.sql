-- Modify invitations table
ALTER TABLE invitations
    DROP CONSTRAINT IF EXISTS invitations_inviter_id_fkey,
    ADD COLUMN IF NOT EXISTS email TEXT,
    ADD COLUMN IF NOT EXISTS used_by UUID REFERENCES users(id),
    ADD COLUMN IF NOT EXISTS used_at TIMESTAMP WITH TIME ZONE;

-- Drop old policies
DROP POLICY IF EXISTS "Invitations are viewable by the inviter" ON invitations;
DROP POLICY IF EXISTS "Users can create invitations" ON invitations;
DROP POLICY IF EXISTS "Invitations are viewable by everyone" ON invitations;
DROP POLICY IF EXISTS "Derek can create and view invitations" ON invitations;

-- Create new policies
CREATE POLICY "Users can view their own invitations" ON invitations
    FOR SELECT USING (auth.uid() = inviter_id);

CREATE POLICY "Users can create invitations" ON invitations
    FOR INSERT WITH CHECK (auth.uid() = inviter_id);

-- Create function to validate invitation code
CREATE OR REPLACE FUNCTION public.validate_invitation_code(code TEXT)
RETURNS TABLE (
    is_valid BOOLEAN,
    message TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        CASE 
            WHEN NOT EXISTS (SELECT 1 FROM invitations WHERE invitation_code = code) THEN FALSE
            WHEN EXISTS (SELECT 1 FROM invitations WHERE invitation_code = code AND is_used = true) THEN FALSE
            WHEN EXISTS (SELECT 1 FROM invitations WHERE invitation_code = code AND expires_at < NOW()) THEN FALSE
            ELSE TRUE
        END,
        CASE 
            WHEN NOT EXISTS (SELECT 1 FROM invitations WHERE invitation_code = code) THEN 'Invalid invitation code'
            WHEN EXISTS (SELECT 1 FROM invitations WHERE invitation_code = code AND is_used = true) THEN 'Invitation code already used'
            WHEN EXISTS (SELECT 1 FROM invitations WHERE invitation_code = code AND expires_at < NOW()) THEN 'Invitation code expired'
            ELSE 'Valid'
        END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
