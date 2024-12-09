-- Remove school_id from invitations table
ALTER TABLE invitations DROP COLUMN IF EXISTS school_id;
