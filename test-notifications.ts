import { supabase } from './src/lib/supabase';

async function testNotificationSystem() {
  console.log('🔔 Testing Notification System...\n');

  try {
    // Test 1: Check if notifications table exists
    console.log('1. Checking notifications table...');
    const { data: tableCheck, error: tableError } = await supabase
      .from('notifications')
      .select('count')
      .limit(1);
    
    if (tableError) {
      console.error('❌ Notifications table not found. Please run the migration first.');
      console.error('Error:', tableError.message);
      return;
    }
    console.log('✅ Notifications table exists');

    // Test 2: Check RPC functions
    console.log('\n2. Testing RPC functions...');
    
    const { data: unreadCount, error: countError } = await supabase
      .rpc('get_unread_notification_count');
    
    if (countError) {
      console.error('❌ get_unread_notification_count function error:', countError.message);
    } else {
      console.log('✅ get_unread_notification_count function works, count:', unreadCount);
    }

    // Test 3: Check if we can mark notifications as read
    const { error: markError } = await supabase
      .rpc('mark_all_notifications_read');
    
    if (markError) {
      console.error('❌ mark_all_notifications_read function error:', markError.message);
    } else {
      console.log('✅ mark_all_notifications_read function works');
    }

    // Test 4: Try to fetch notifications
    console.log('\n3. Testing notification queries...');
    const { data: notifications, error: fetchError } = await supabase
      .from('notifications')
      .select(`
        id,
        type,
        title,
        message,
        read,
        created_at,
        from_user:from_user_id (
          id,
          name,
          avatar_url
        )
      `)
      .order('created_at', { ascending: false })
      .limit(5);

    if (fetchError) {
      console.error('❌ Error fetching notifications:', fetchError.message);
    } else {
      console.log('✅ Notification queries work');
      console.log(`   Found ${notifications?.length || 0} notifications`);
    }

    console.log('\n🎉 Notification system test completed!');
    console.log('\nNext steps:');
    console.log('1. Execute the notifications migration in Supabase SQL Editor');
    console.log('2. Test creating a like/comment to trigger notifications');
    console.log('3. Check the NotificationDropdown component in the UI');
    console.log('4. Verify real-time notifications work');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the test
testNotificationSystem();