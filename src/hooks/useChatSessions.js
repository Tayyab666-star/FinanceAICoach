import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';

// Custom hook for managing chat sessions and messages
export const useChatSessions = () => {
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const [sessions, setSessions] = useState([]);
  const [currentSession, setCurrentSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetchSessions();
    } else {
      setSessions([]);
      setCurrentSession(null);
      setMessages([]);
      setLoading(false);
    }
  }, [user]);

  // Fetch all chat sessions for the user
  const fetchSessions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('chat_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Error fetching chat sessions:', error);
        throw error;
      }

      setSessions(data || []);
      
      // Set active session or most recent one
      const activeSession = data?.find(s => s.is_active) || data?.[0];
      if (activeSession) {
        await loadSession(activeSession.id);
      }
    } catch (error) {
      console.error('Error fetching chat sessions:', error);
      addNotification({
        type: 'error',
        title: 'Error Loading Chats',
        message: 'Failed to load chat sessions. Please try again.'
      });
      setSessions([]);
    } finally {
      setLoading(false);
    }
  };

  // Load messages for a specific session
  const loadSession = async (sessionId) => {
    try {
      // Get session details
      const { data: sessionData, error: sessionError } = await supabase
        .from('chat_sessions')
        .select('*')
        .eq('id', sessionId)
        .eq('user_id', user.id)
        .single();

      if (sessionError) throw sessionError;

      // Get messages for this session
      const { data: messagesData, error: messagesError } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('session_id', sessionId)
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (messagesError) throw messagesError;

      setCurrentSession(sessionData);
      setMessages(messagesData || []);

      // Mark this session as active
      await markSessionActive(sessionId);
    } catch (error) {
      console.error('Error loading session:', error);
      addNotification({
        type: 'error',
        title: 'Error Loading Chat',
        message: 'Failed to load chat session. Please try again.'
      });
    }
  };

  // Mark a session as active (deactivate others)
  const markSessionActive = async (sessionId) => {
    try {
      // Deactivate all sessions first
      await supabase
        .from('chat_sessions')
        .update({ is_active: false })
        .eq('user_id', user.id);

      // Activate the selected session
      await supabase
        .from('chat_sessions')
        .update({ is_active: true, updated_at: new Date().toISOString() })
        .eq('id', sessionId)
        .eq('user_id', user.id);

      // Update local state
      setSessions(prev => prev.map(s => ({
        ...s,
        is_active: s.id === sessionId
      })));
    } catch (error) {
      console.error('Error marking session active:', error);
    }
  };

  // Create a new chat session
  const createNewSession = async (firstMessage = null) => {
    try {
      const title = firstMessage 
        ? await generateChatTitle(firstMessage)
        : 'New Chat';

      const { data, error } = await supabase
        .from('chat_sessions')
        .insert([{
          user_id: user.id,
          title,
          is_active: true
        }])
        .select()
        .single();

      if (error) throw error;

      // Deactivate other sessions
      await supabase
        .from('chat_sessions')
        .update({ is_active: false })
        .eq('user_id', user.id)
        .neq('id', data.id);

      // Add to sessions list
      setSessions(prev => [data, ...prev.map(s => ({ ...s, is_active: false }))]);
      setCurrentSession(data);
      setMessages([]);

      addNotification({
        type: 'success',
        title: 'New Chat Started',
        message: 'Created a new chat session'
      });

      return data;
    } catch (error) {
      console.error('Error creating new session:', error);
      addNotification({
        type: 'error',
        title: 'Error Creating Chat',
        message: 'Failed to create new chat session. Please try again.'
      });
      throw error;
    }
  };

  // Add a message to the current session
  const addMessage = async (content, type = 'user', metadata = {}) => {
    try {
      if (!currentSession) {
        // Create new session if none exists
        const session = await createNewSession(type === 'user' ? content : null);
        if (!session) throw new Error('Failed to create session');
      }

      const { data, error } = await supabase
        .from('chat_messages')
        .insert([{
          session_id: currentSession.id,
          user_id: user.id,
          type,
          content,
          metadata
        }])
        .select()
        .single();

      if (error) throw error;

      // Add to local messages
      setMessages(prev => [...prev, data]);

      // Update session timestamp and title if it's the first user message
      if (type === 'user' && messages.length === 0) {
        const title = await generateChatTitle(content);
        await supabase
          .from('chat_sessions')
          .update({ 
            title,
            updated_at: new Date().toISOString() 
          })
          .eq('id', currentSession.id);

        // Update local session
        setCurrentSession(prev => ({ ...prev, title }));
        setSessions(prev => prev.map(s => 
          s.id === currentSession.id ? { ...s, title } : s
        ));
      } else {
        // Just update timestamp
        await supabase
          .from('chat_sessions')
          .update({ updated_at: new Date().toISOString() })
          .eq('id', currentSession.id);
      }

      return data;
    } catch (error) {
      console.error('Error adding message:', error);
      addNotification({
        type: 'error',
        title: 'Error Saving Message',
        message: 'Failed to save message. Please try again.'
      });
      throw error;
    }
  };

  // Delete a chat session
  const deleteSession = async (sessionId) => {
    try {
      const { error } = await supabase
        .from('chat_sessions')
        .delete()
        .eq('id', sessionId)
        .eq('user_id', user.id);

      if (error) throw error;

      // Remove from local state
      setSessions(prev => prev.filter(s => s.id !== sessionId));

      // If this was the current session, clear it
      if (currentSession?.id === sessionId) {
        setCurrentSession(null);
        setMessages([]);
        
        // Load the most recent remaining session
        const remainingSessions = sessions.filter(s => s.id !== sessionId);
        if (remainingSessions.length > 0) {
          await loadSession(remainingSessions[0].id);
        }
      }

      addNotification({
        type: 'success',
        title: 'Chat Deleted',
        message: 'Chat session has been deleted'
      });
    } catch (error) {
      console.error('Error deleting session:', error);
      addNotification({
        type: 'error',
        title: 'Error Deleting Chat',
        message: 'Failed to delete chat session. Please try again.'
      });
      throw error;
    }
  };

  // Update session title
  const updateSessionTitle = async (sessionId, newTitle) => {
    try {
      const { error } = await supabase
        .from('chat_sessions')
        .update({ title: newTitle, updated_at: new Date().toISOString() })
        .eq('id', sessionId)
        .eq('user_id', user.id);

      if (error) throw error;

      // Update local state
      setSessions(prev => prev.map(s => 
        s.id === sessionId ? { ...s, title: newTitle } : s
      ));

      if (currentSession?.id === sessionId) {
        setCurrentSession(prev => ({ ...prev, title: newTitle }));
      }

      addNotification({
        type: 'success',
        title: 'Chat Renamed',
        message: 'Chat title has been updated'
      });
    } catch (error) {
      console.error('Error updating session title:', error);
      addNotification({
        type: 'error',
        title: 'Error Renaming Chat',
        message: 'Failed to update chat title. Please try again.'
      });
      throw error;
    }
  };

  // Generate chat title from message content
  const generateChatTitle = async (message) => {
    try {
      const { data, error } = await supabase
        .rpc('generate_chat_title', { first_message: message });

      if (error) throw error;
      return data || 'Financial Question';
    } catch (error) {
      console.error('Error generating title:', error);
      // Fallback title generation
      const words = message.split(' ').slice(0, 3).join(' ');
      return words.length > 3 ? words + '...' : 'Financial Question';
    }
  };

  // Clear all messages in current session (start fresh)
  const clearCurrentSession = async () => {
    try {
      if (!currentSession) return;

      const { error } = await supabase
        .from('chat_messages')
        .delete()
        .eq('session_id', currentSession.id)
        .eq('user_id', user.id);

      if (error) throw error;

      setMessages([]);

      addNotification({
        type: 'success',
        title: 'Chat Cleared',
        message: 'All messages in this chat have been cleared'
      });
    } catch (error) {
      console.error('Error clearing session:', error);
      addNotification({
        type: 'error',
        title: 'Error Clearing Chat',
        message: 'Failed to clear chat messages. Please try again.'
      });
      throw error;
    }
  };

  return {
    sessions,
    currentSession,
    messages,
    loading,
    fetchSessions,
    loadSession,
    createNewSession,
    addMessage,
    deleteSession,
    updateSessionTitle,
    clearCurrentSession
  };
};