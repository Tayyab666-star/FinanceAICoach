import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
} 

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Storage bucket for receipts
export const RECEIPTS_BUCKET = 'receipts';

// Helper function to upload receipt image
export const uploadReceipt = async (file, userId) => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${Date.now()}.${fileExt}`;
    
    const { data, error } = await supabase.storage
      .from(RECEIPTS_BUCKET)
      .upload(fileName, file);

    if (error) throw error;

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(RECEIPTS_BUCKET)
      .getPublicUrl(fileName);

    return publicUrl;
  } catch (error) {
    console.error('Error uploading receipt:', error);
    throw error;
  }
};

// Helper function to delete receipt
export const deleteReceipt = async (url) => {
  try {
    const fileName = url.split('/').pop();
    const { error } = await supabase.storage
      .from(RECEIPTS_BUCKET)
      .remove([fileName]);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting receipt:', error);
    throw error;
  }
};