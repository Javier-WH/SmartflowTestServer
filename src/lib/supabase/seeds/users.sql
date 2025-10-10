-- jorge@andinotechnologies.com / Password1$
INSERT INTO auth.users ( instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token) 
VALUES 
  ('00000000-0000-0000-0000-000000000000', uuid_generate_v4(), 'authenticated', 'authenticated', 'jorge@andinotechnologies.com', crypt('Password1$', gen_salt('bf')), current_timestamp, current_timestamp, current_timestamp, '{"provider":"email","providers":["email"]}', '{"username":"jorgerojas26","first_name":"jorge","second_name":"luis","first_surname":"rojas","second_surname":"bencomo","email":"jorge@andinotechnologies.com","country":"MX","birthday":"1994-04-26","is_onboarding_complete":true,"is_paid":true,"payment_method":"stripe","last4":"4242","quiz_done":true,"assigned_team_id":"0196abb7-8575-74f8-b9a8-737d0356d3bf","assigned_avatar_id":"0196abf3-4df0-7769-b461-c5f1babc05b9"}', current_timestamp, current_timestamp, '', '', '', '');


INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
VALUES 
  (uuid_generate_v4(), (SELECT id FROM auth.users WHERE email = 'jorge@andinotechnologies.com'), format('{"sub":"%s","email":"%s"}', (SELECT id FROM auth.users WHERE email = 'jorge@andinotechnologies.com')::text, 'jorge@andinotechnologies.com')::jsonb, 'email', uuid_generate_v4(), current_timestamp, current_timestamp, current_timestamp);

UPDATE public.profile
SET 
first_name = 'Jorge',
second_name = 'Luis',
first_surname = 'Rojas',
second_surname = 'Bencomo',
username = 'jorgerojas26',
email = 'jorge@andinotechnologies.com',
country = 'MX',
birthday = '1994-04-26',
is_onboarding_complete = true,
is_paid = true,
payment_method = 'visa',
last4 = '4242',
quiz_done = true,
assigned_team_id = '0196abb7-8575-74f8-b9a8-737d0356d3bf',
assigned_avatar_id = '0196abf3-4df0-7769-b461-c5f1babc05b9'
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'jorge@andinotechnologies.com');
