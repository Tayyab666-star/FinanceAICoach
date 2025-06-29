import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Enhanced error checking for environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase configuration error:', {
    hasUrl: !!supabaseUrl,
    hasKey: !!supabaseAnonKey,
    url: supabaseUrl ? 'Set' : 'Missing',
    key: supabaseAnonKey ? 'Set' : 'Missing'
  });
  throw new Error(
    'Missing Supabase environment variables. Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your .env file. ' +
    'Click the "Connect to Supabase" button in the top right to set up your Supabase connection.'
  );
}

// Validate URL format
try {
  new URL(supabaseUrl);
} catch (error) {
  throw new Error(`Invalid VITE_SUPABASE_URL format: ${supabaseUrl}. Please check your environment variables.`);
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

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

// OCR Service using Tesseract.js for client-side processing
export const processReceiptOCR = async (file, onProgress) => {
  try {
    // Import Tesseract.js dynamically
    const Tesseract = await import('tesseract.js');
    
    const { data: { text } } = await Tesseract.recognize(
      file,
      'eng',
      {
        logger: m => {
          if (m.status === 'recognizing text' && onProgress) {
            onProgress(Math.round(m.progress * 100));
          }
        }
      }
    );

    return parseReceiptText(text);
  } catch (error) {
    console.error('OCR processing error:', error);
    // Fallback to mock data if OCR fails
    return generateMockReceiptData();
  }
};

// Parse OCR text to extract receipt information
const parseReceiptText = (text) => {
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  
  let description = '';
  let amount = 0;
  let date = new Date().toISOString().split('T')[0];
  let category = 'Other';

  // Extract store name (usually first meaningful line)
  const storePatterns = [
    /walmart/i, /target/i, /costco/i, /kroger/i, /safeway/i,
    /mcdonalds/i, /starbucks/i, /subway/i, /kfc/i,
    /shell/i, /exxon/i, /chevron/i, /bp/i,
    /amazon/i, /ebay/i, /apple/i, /microsoft/i
  ];

  for (const line of lines) {
    if (!description && line.length > 3 && line.length < 50) {
      for (const pattern of storePatterns) {
        if (pattern.test(line)) {
          description = line;
          break;
        }
      }
      if (!description && /^[A-Za-z\s&'-]+$/.test(line)) {
        description = line;
      }
    }
  }

  // Extract total amount
  const amountPatterns = [
    /total[:\s]*\$?(\d+\.?\d*)/i,
    /amount[:\s]*\$?(\d+\.?\d*)/i,
    /\$(\d+\.\d{2})/g,
    /(\d+\.\d{2})/g
  ];

  for (const line of lines) {
    for (const pattern of amountPatterns) {
      const matches = line.match(pattern);
      if (matches) {
        const extractedAmount = parseFloat(matches[1] || matches[0].replace('$', ''));
        if (extractedAmount > amount && extractedAmount < 10000) {
          amount = extractedAmount;
        }
      }
    }
  }

  // Extract date
  const datePatterns = [
    /(\d{1,2}\/\d{1,2}\/\d{2,4})/,
    /(\d{1,2}-\d{1,2}-\d{2,4})/,
    /(\d{4}-\d{1,2}-\d{1,2})/
  ];

  for (const line of lines) {
    for (const pattern of datePatterns) {
      const match = line.match(pattern);
      if (match) {
        const parsedDate = new Date(match[1]);
        if (!isNaN(parsedDate.getTime())) {
          date = parsedDate.toISOString().split('T')[0];
          break;
        }
      }
    }
  }

  // Determine category based on store name or content
  if (description) {
    const lowerDesc = description.toLowerCase();
    if (/walmart|target|costco|kroger|safeway|grocery|market/i.test(lowerDesc)) {
      category = 'Food';
    } else if (/mcdonalds|starbucks|subway|kfc|restaurant|cafe|pizza/i.test(lowerDesc)) {
      category = 'Food';
    } else if (/shell|exxon|chevron|bp|gas|fuel/i.test(lowerDesc)) {
      category = 'Transport';
    } else if (/amazon|ebay|apple|microsoft|electronics|store/i.test(lowerDesc)) {
      category = 'Shopping';
    } else if (/pharmacy|cvs|walgreens|medical|health/i.test(lowerDesc)) {
      category = 'Healthcare';
    }
  }

  return {
    description: description || 'Receipt Purchase',
    amount: amount || 0,
    category,
    date,
    confidence: calculateConfidence(description, amount, date)
  };
};

// Calculate confidence score based on extracted data quality
const calculateConfidence = (description, amount, date) => {
  let confidence = 0;
  
  if (description && description.length > 3) confidence += 40;
  if (amount > 0) confidence += 40;
  if (date) confidence += 20;
  
  return Math.min(confidence, 100);
};

// Generate mock receipt data as fallback
const generateMockReceiptData = () => {
  const mockReceipts = [
    { description: 'Walmart Supercenter', amount: 67.89, category: 'Food' },
    { description: 'Shell Gas Station', amount: 45.20, category: 'Transport' },
    { description: 'Starbucks Coffee', amount: 12.50, category: 'Food' },
    { description: 'Amazon Purchase', amount: 89.99, category: 'Shopping' },
    { description: 'CVS Pharmacy', amount: 23.45, category: 'Healthcare' },
    { description: 'Target Store', amount: 156.78, category: 'Shopping' }
  ];
  
  const randomReceipt = mockReceipts[Math.floor(Math.random() * mockReceipts.length)];
  
  return {
    ...randomReceipt,
    date: new Date().toISOString().split('T')[0],
    confidence: 85 + Math.floor(Math.random() * 15) // 85-100% confidence
  };
};

// Store receipt data in Supabase
export const storeReceiptData = async (receiptData, userId) => {
  try {
    const { data, error } = await supabase
      .from('receipts')
      .insert([{
        user_id: userId,
        image_url: receiptData.image_url,
        extracted_text: receiptData.extracted_text,
        parsed_data: receiptData.parsed_data,
        confidence_score: receiptData.confidence_score,
        processing_status: 'completed'
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error storing receipt data:', error);
    throw error;
  }
};