-- Drop existing policies
DROP POLICY IF EXISTS "Allow updating invitations" ON invitations;
DROP POLICY IF EXISTS "Users can update invitations" ON invitations;

-- Add policy to allow updating invitations
CREATE POLICY "Users can update invitations" ON invitations
    FOR UPDATE USING (true)
    WITH CHECK (true);
