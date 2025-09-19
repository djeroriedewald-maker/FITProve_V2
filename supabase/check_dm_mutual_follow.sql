-- Check mutual follow and allow_direct_messages for two users
-- Replace these with the actual UUIDs for djero1@gmail.com and djero2@gmail.com
\set user1 'PASTE_USER1_UUID_HERE'
\set user2 'PASTE_USER2_UUID_HERE'

-- Check mutual follow
SELECT * FROM followers WHERE (follower_id = :'user1' AND following_id = :'user2') OR (follower_id = :'user2' AND following_id = :'user1');

-- Check allow_direct_messages for both users
SELECT id, email, allow_direct_messages FROM profiles WHERE id IN (:'user1', :'user2');
