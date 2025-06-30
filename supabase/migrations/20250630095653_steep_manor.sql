/*
  # Create Chat System Tables

  1. New Tables
    - `chat_sessions` - Store chat sessions
      - `id` (uuid, primary key)
      - `user_id` (uuid, references user_profiles)
      - `title` (text, chat session title)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
      - `is_active` (boolean, current active session)

    - `chat_messages` - Store individual messages
      - `id` (uuid, primary key)
      - `session_id` (uuid, references chat_sessions)
      - `user_id` (uuid, references user_profiles)
      - `type` (text, 'user' or 'ai')
      - `content` (text, message content)
      - `metadata` (jsonb, additional data like AI model used)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for users to manage their own chats
*/

-- Create chat_sessions table
CREATE TABLE IF NOT EXISTS chat_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL DEFAULT 'New Chat',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  is_active boolean DEFAULT false
);

-- Create chat_messages table
CREATE TABLE IF NOT EXISTS chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES chat_sessions(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL CHECK (type IN ('user', 'ai')),
  content text NOT NULL,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Create policies for chat_sessions
CREATE POLICY "Users can manage own chat sessions"
  ON chat_sessions
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Allow anonymous access for auth flow compatibility
CREATE POLICY "Allow chat session access during auth"
  ON chat_sessions
  FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);

-- Create policies for chat_messages
CREATE POLICY "Users can manage own chat messages"
  ON chat_messages
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Allow anonymous access for auth flow compatibility
CREATE POLICY "Allow chat message access during auth"
  ON chat_messages
  FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id ON chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_created_at ON chat_sessions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_active ON chat_sessions(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at);

-- Create updated_at trigger for chat_sessions
CREATE TRIGGER update_chat_sessions_updated_at
  BEFORE UPDATE ON chat_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions
GRANT ALL ON chat_sessions TO anon, authenticated;
GRANT ALL ON chat_messages TO anon, authenticated;

-- Create function to generate chat title from first message
CREATE OR REPLACE FUNCTION generate_chat_title(first_message text)
RETURNS text AS $$
DECLARE
  title text;
BEGIN
  -- Extract first few words and clean up
  title := split_part(first_message, ' ', 1) || ' ' || 
           split_part(first_message, ' ', 2) || ' ' || 
           split_part(first_message, ' ', 3);
  
  -- Remove empty parts and limit length
  title := trim(title);
  
  IF length(title) > 50 THEN
    title := left(title, 47) || '...';
  END IF;
  
  IF length(title) < 5 THEN
    title := 'Financial Question';
  END IF;
  
  RETURN title;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION generate_chat_title(text) TO anon, authenticated;