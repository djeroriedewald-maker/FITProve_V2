-- Verwijder eerst alle bestaande badges om dubbele namen te voorkomen
DELETE FROM badges;

INSERT INTO badges (id, name, description, icon_url, type, category, color, is_active, "order", criteria) VALUES
-- Badges zonder progressiebar (criteria = NULL)
(gen_random_uuid(), 'Starter', 'Maak je profiel compleet', 'https://img.icons8.com/color/48/000000/star--v1.png', 'milestone', 'profile', '#FFD700', true, 1, NULL),
(gen_random_uuid(), 'Early Bird', 'Log in voor 7:00 uur', 'https://img.icons8.com/color/48/000000/sunrise.png', 'activity', 'routine', '#FFA500', true, 2, NULL),
(gen_random_uuid(), 'Night Owl', 'Log in na 22:00 uur', 'https://img.icons8.com/color/48/000000/moon-symbol.png', 'activity', 'routine', '#4B0082', true, 3, NULL),
(gen_random_uuid(), 'First Workout', 'Voltooi je eerste workout', 'https://img.icons8.com/color/48/000000/dumbbell.png', 'milestone', 'workout', '#4ade80', true, 4, NULL),
-- Badges met progressiebar (criteria = JSON string met target)
(gen_random_uuid(), 'Consistency', 'Doe 3 dagen achter elkaar een workout', 'https://img.icons8.com/color/48/000000/calendar-3.png', 'streak', 'workout', '#00BFFF', true, 5, '{"target":3,"type":"workout_streak"}'),
(gen_random_uuid(), 'Streak Master', 'Doe 7 dagen achter elkaar een workout', 'https://img.icons8.com/color/48/000000/fire-element.png', 'streak', 'workout', '#FF4500', true, 6, '{"target":7,"type":"workout_streak"}'),
(gen_random_uuid(), 'Popular', 'Krijg 5 volgers', 'https://img.icons8.com/color/48/000000/crowd.png', 'social', 'community', '#FF69B4', true, 8, '{"target":5,"type":"followers"}'),
(gen_random_uuid(), 'Motivator', 'Geef 5 likes', 'https://img.icons8.com/color/48/000000/facebook-like.png', 'activity', 'community', '#32CD32', true, 10, '{"target":5,"type":"likes_given"}'),
(gen_random_uuid(), 'Explorer', 'Bekijk 10 verschillende profielen', 'https://img.icons8.com/color/48/000000/compass.png', 'activity', 'profile', '#FF6347', true, 12, '{"target":10,"type":"profiles_viewed"}'),
(gen_random_uuid(), 'Active Week', '7 dagen actief in 1 week', 'https://img.icons8.com/color/48/000000/week-view.png', 'streak', 'workout', '#00FF7F', true, 19, '{"target":7,"type":"active_days"}'),
(gen_random_uuid(), 'Active Month', '30 dagen actief in 1 maand', 'https://img.icons8.com/color/48/000000/month-view.png', 'streak', 'workout', '#9932CC', true, 20, '{"target":30,"type":"active_days"}'),
-- Overige badges zonder progressiebar
(gen_random_uuid(), 'Socializer', 'Volg je eerste gebruiker', 'https://img.icons8.com/color/48/000000/add-user-group-man-man.png', 'social', 'community', '#8A2BE2', true, 7, NULL),
(gen_random_uuid(), 'Commentator', 'Plaats je eerste reactie', 'https://img.icons8.com/color/48/000000/comments.png', 'activity', 'community', '#20B2AA', true, 9, NULL),
(gen_random_uuid(), 'Sharer', 'Deel je eerste workout', 'https://img.icons8.com/color/48/000000/share.png', 'activity', 'workout', '#1E90FF', true, 11, NULL),
(gen_random_uuid(), 'Goal Setter', 'Stel een fitnessdoel in', 'https://img.icons8.com/color/48/000000/goal.png', 'milestone', 'profile', '#FFD700', true, 13, NULL),
(gen_random_uuid(), 'Goal Achiever', 'Behaal een fitnessdoel', 'https://img.icons8.com/color/48/000000/trophy.png', 'milestone', 'profile', '#DAA520', true, 14, NULL),
(gen_random_uuid(), 'First Comment', 'Ontvang je eerste reactie', 'https://img.icons8.com/color/48/000000/speech-bubble.png', 'social', 'community', '#00CED1', true, 15, NULL),
(gen_random_uuid(), 'First Like', 'Ontvang je eerste like', 'https://img.icons8.com/color/48/000000/filled-like.png', 'social', 'community', '#DC143C', true, 16, NULL),
(gen_random_uuid(), 'First Follower', 'Ontvang je eerste volger', 'https://img.icons8.com/color/48/000000/add-user-group-woman-man.png', 'social', 'community', '#FF8C00', true, 17, NULL),
(gen_random_uuid(), 'First Post', 'Maak je eerste post', 'https://img.icons8.com/color/48/000000/edit.png', 'activity', 'community', '#4682B4', true, 18, NULL),
(gen_random_uuid(), 'Feedback Giver', 'Geef feedback op een workout', 'https://img.icons8.com/color/48/000000/feedback.png', 'activity', 'community', '#B22222', true, 21, NULL),
(gen_random_uuid(), 'Feedback Receiver', 'Ontvang feedback op een workout', 'https://img.icons8.com/color/48/000000/feedback-hub.png', 'activity', 'community', '#228B22', true, 22, NULL),
(gen_random_uuid(), 'Challenge Starter', 'Start je eerste challenge', 'https://img.icons8.com/color/48/000000/flag.png', 'activity', 'challenge', '#FF4500', true, 23, NULL),
(gen_random_uuid(), 'Challenge Winner', 'Win een challenge', 'https://img.icons8.com/color/48/000000/medal2.png', 'milestone', 'challenge', '#FFD700', true, 24, NULL),
(gen_random_uuid(), 'Community Helper', 'Help een andere gebruiker', 'https://img.icons8.com/color/48/000000/helping-hand.png', 'social', 'community', '#00BFFF', true, 25, NULL);
 