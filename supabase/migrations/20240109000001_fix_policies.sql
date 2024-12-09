-- Drop the is_derek function as it's no longer needed
DROP FUNCTION IF EXISTS public.is_derek();

-- Drop restrictive policies
DROP POLICY IF EXISTS "Only Derek can insert posts" ON posts;
DROP POLICY IF EXISTS "Only Derek can update posts" ON posts;
DROP POLICY IF EXISTS "Only Derek can delete posts" ON posts;
DROP POLICY IF EXISTS "Only Derek can insert comments" ON comments;
DROP POLICY IF EXISTS "Only Derek can update comments" ON comments;
DROP POLICY IF EXISTS "Only Derek can delete comments" ON comments;

-- Create new policies that allow users to manage their own content
CREATE POLICY "Users can insert posts" ON posts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own posts" ON posts
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own posts" ON posts
    FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert comments" ON comments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments" ON comments
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments" ON comments
    FOR DELETE USING (auth.uid() = user_id);
