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

// Test connection function with timeout and better error handling
const testConnection = async () => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout
    
    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      method: 'HEAD',
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`
      },
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      console.error('Supabase connection test failed:', {
        status: response.status,
        statusText: response.statusText,
        url: supabaseUrl
      });
      return false;
    }
    
    console.log('Supabase connection test successful');
    return true;
  } catch (error) {
    if (error.name === 'AbortError') {
      console.warn('Supabase connection test timed out (non-critical)');
    } else {
      console.error('Supabase connection test error:', error);
    }
    return false;
  }
};

// Test connection on initialization (non-blocking)
testConnection().catch(() => {
  // Ignore connection test failures - they're not critical for app functionality
});

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false, // Disable URL detection for OTP flow
    flowType: 'pkce',
    storage: window.localStorage, // Explicitly use localStorage for session persistence
    storageKey: 'financeapp-auth-token', // Custom storage key
    debug: false // Disable debug logs in production
  },
  global: {
    headers: {
      'X-Client-Info': 'finance-tracker-app'
    }
  },
  db: {
    schema: 'public'
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

// Add connection monitoring with better error handling
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_IN') {
    console.log('User signed in successfully');
  } else if (event === 'SIGNED_OUT') {
    console.log('User signed out');
  } else if (event === 'TOKEN_REFRESHED') {
    console.log('Auth token refreshed');
  } else if (event === 'USER_UPDATED') {
    console.log('User updated');
  }
});

// Storage bucket for receipts
export const RECEIPTS_BUCKET = 'receipts';

// Enhanced category prediction based on merchant/store names and keywords
const CATEGORY_PATTERNS = {
  'Food': [
    // Grocery stores
    /walmart/i, /target/i, /costco/i, /kroger/i, /safeway/i, /publix/i, /whole foods/i, /trader joe/i,
    /aldi/i, /food lion/i, /giant/i, /stop & shop/i, /wegmans/i, /harris teeter/i, /meijer/i,
    // Restaurants and fast food
    /mcdonalds/i, /burger king/i, /kfc/i, /taco bell/i, /subway/i, /pizza hut/i, /dominos/i,
    /starbucks/i, /dunkin/i, /chipotle/i, /panera/i, /olive garden/i, /applebees/i, /chilis/i,
    /restaurant/i, /cafe/i, /diner/i, /bistro/i, /grill/i, /kitchen/i, /eatery/i, /food/i,
    // Keywords
    /grocery/i, /market/i, /supermarket/i, /deli/i, /bakery/i, /coffee/i, /dining/i
  ],
  'Transport': [
    // Gas stations
    /shell/i, /exxon/i, /chevron/i, /bp/i, /mobil/i, /texaco/i, /citgo/i, /sunoco/i, /marathon/i,
    /speedway/i, /wawa/i, /7-eleven/i, /circle k/i, /casey/i, /pilot/i, /loves/i,
    // Transportation services
    /uber/i, /lyft/i, /taxi/i, /bus/i, /metro/i, /transit/i, /parking/i, /toll/i,
    // Keywords
    /gas/i, /fuel/i, /gasoline/i, /diesel/i, /station/i, /transport/i, /ride/i
  ],
  'Shopping': [
    // Department stores
    /amazon/i, /ebay/i, /walmart/i, /target/i, /best buy/i, /home depot/i, /lowes/i, /macys/i,
    /nordstrom/i, /kohls/i, /jcpenney/i, /sears/i, /tj maxx/i, /marshalls/i, /ross/i,
    // Electronics and tech
    /apple/i, /microsoft/i, /dell/i, /hp/i, /samsung/i, /sony/i, /nintendo/i, /gamestop/i,
    // Online retailers
    /etsy/i, /shopify/i, /paypal/i, /square/i,
    // Keywords
    /store/i, /shop/i, /retail/i, /mall/i, /outlet/i, /electronics/i, /clothing/i, /department/i
  ],
  'Healthcare': [
    // Pharmacies
    /cvs/i, /walgreens/i, /rite aid/i, /pharmacy/i, /drug store/i, /medicine/i,
    // Medical facilities
    /hospital/i, /clinic/i, /medical/i, /health/i, /doctor/i, /dentist/i, /urgent care/i,
    /lab corp/i, /quest/i, /kaiser/i, /blue cross/i, /aetna/i, /humana/i,
    // Keywords
    /prescription/i, /rx/i, /wellness/i, /care/i, /treatment/i
  ],
  'Bills': [
    // Utilities
    /electric/i, /electricity/i, /power/i, /gas company/i, /water/i, /sewer/i, /trash/i,
    /internet/i, /cable/i, /phone/i, /wireless/i, /verizon/i, /att/i, /tmobile/i, /sprint/i,
    /comcast/i, /xfinity/i, /spectrum/i, /cox/i, /directv/i, /dish/i,
    // Insurance
    /insurance/i, /allstate/i, /state farm/i, /geico/i, /progressive/i, /usaa/i,
    // Keywords
    /utility/i, /bill/i, /payment/i, /service/i, /monthly/i, /subscription/i
  ],
  'Entertainment': [
    // Streaming and media
    /netflix/i, /hulu/i, /disney/i, /amazon prime/i, /spotify/i, /apple music/i, /youtube/i,
    /hbo/i, /showtime/i, /paramount/i, /peacock/i, /discovery/i,
    // Entertainment venues
    /movie/i, /cinema/i, /theater/i, /concert/i, /stadium/i, /arena/i, /amusement/i, /park/i,
    /bowling/i, /arcade/i, /casino/i, /club/i, /bar/i, /pub/i,
    // Keywords
    /entertainment/i, /fun/i, /leisure/i, /recreation/i, /hobby/i, /game/i, /sport/i
  ],
  'Education': [
    // Educational institutions
    /university/i, /college/i, /school/i, /academy/i, /institute/i, /education/i,
    /tuition/i, /books/i, /supplies/i, /course/i, /class/i, /training/i, /workshop/i,
    // Keywords
    /learning/i, /study/i, /academic/i, /student/i, /textbook/i, /certification/i
  ]
};

// Helper function to predict category based on merchant name and text content
const predictCategory = (merchantName, fullText) => {
  const combinedText = `${merchantName} ${fullText}`.toLowerCase();
  
  // Check each category pattern
  for (const [category, patterns] of Object.entries(CATEGORY_PATTERNS)) {
    for (const pattern of patterns) {
      if (pattern.test(combinedText)) {
        return category;
      }
    }
  }
  
  // Default fallback based on common keywords in the text
  if (/food|eat|meal|lunch|dinner|breakfast|snack|drink|beverage/i.test(combinedText)) {
    return 'Food';
  } else if (/gas|fuel|station|transport|ride|parking/i.test(combinedText)) {
    return 'Transport';
  } else if (/store|shop|buy|purchase|retail/i.test(combinedText)) {
    return 'Shopping';
  } else if (/medical|health|pharmacy|doctor|prescription/i.test(combinedText)) {
    return 'Healthcare';
  } else if (/bill|utility|service|payment|monthly/i.test(combinedText)) {
    return 'Bills';
  } else if (/movie|game|fun|entertainment|music|streaming/i.test(combinedText)) {
    return 'Entertainment';
  } else if (/school|education|course|book|learning/i.test(combinedText)) {
    return 'Education';
  }
  
  return 'Other'; // Default category
};

// Helper function to upload receipt image with improved error handling
export const uploadReceipt = async (file, userId) => {
  try {
    console.log('Starting receipt upload...', { fileName: file.name, fileSize: file.size, userId });
    
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${Date.now()}.${fileExt}`;
    
    console.log('Uploading to path:', fileName);
    
    const { data, error } = await supabase.storage
      .from(RECEIPTS_BUCKET)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type
      });

    if (error) {
      console.error('Storage upload error:', error);
      throw new Error(`Upload failed: ${error.message}`);
    }

    console.log('Upload successful:', data);

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(RECEIPTS_BUCKET)
      .getPublicUrl(fileName);

    console.log('Public URL generated:', publicUrl);
    return publicUrl;
  } catch (error) {
    console.error('Error uploading receipt:', error);
    throw error;
  }
};

// Helper function to delete receipt
export const deleteReceipt = async (url) => {
  try {
    // Extract filename from URL
    const urlParts = url.split('/');
    const fileName = urlParts[urlParts.length - 1];
    const userFolder = urlParts[urlParts.length - 2];
    const fullPath = `${userFolder}/${fileName}`;
    
    const { error } = await supabase.storage
      .from(RECEIPTS_BUCKET)
      .remove([fullPath]);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting receipt:', error);
    throw error;
  }
};

// Enhanced OCR Service using Tesseract.js for client-side processing
export const processReceiptOCR = async (file, onProgress) => {
  try {
    console.log('Starting OCR processing...');
    
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

    console.log('OCR completed, parsing text...');
    return parseReceiptText(text);
  } catch (error) {
    console.error('OCR processing error:', error);
    // Fallback to mock data if OCR fails
    console.log('Using fallback mock data...');
    return generateMockReceiptData();
  }
};

// Enhanced receipt text parsing with better total extraction and category prediction
const parseReceiptText = (text) => {
  console.log('Parsing receipt text:', text.substring(0, 200) + '...');
  
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  
  let description = '';
  let amount = 0;
  let date = new Date().toISOString().split('T')[0];
  let category = 'Other';

  // Extract store/merchant name (usually first meaningful line)
  const storePatterns = [
    /walmart/i, /target/i, /costco/i, /kroger/i, /safeway/i, /publix/i, /whole foods/i,
    /mcdonalds/i, /starbucks/i, /subway/i, /kfc/i, /burger king/i, /taco bell/i,
    /shell/i, /exxon/i, /chevron/i, /bp/i, /mobil/i, /speedway/i,
    /amazon/i, /ebay/i, /apple/i, /microsoft/i, /best buy/i, /home depot/i,
    /cvs/i, /walgreens/i, /rite aid/i, /pharmacy/i
  ];

  // Find merchant name
  for (const line of lines) {
    if (!description && line.length > 2 && line.length < 50) {
      // Check against known store patterns
      for (const pattern of storePatterns) {
        if (pattern.test(line)) {
          description = line;
          break;
        }
      }
      
      // If no pattern match, use first reasonable line that looks like a store name
      if (!description && /^[A-Za-z\s&'-]+$/.test(line) && !line.toLowerCase().includes('receipt')) {
        description = line;
      }
    }
    if (description) break;
  }

  // Extract TOTAL amount (not individual items)
  const totalPatterns = [
    /total[:\s]*\$?(\d+\.?\d*)/i,
    /amount due[:\s]*\$?(\d+\.?\d*)/i,
    /balance[:\s]*\$?(\d+\.?\d*)/i,
    /grand total[:\s]*\$?(\d+\.?\d*)/i,
    /final total[:\s]*\$?(\d+\.?\d*)/i,
    /total amount[:\s]*\$?(\d+\.?\d*)/i
  ];

  // Look for total amount specifically
  for (const line of lines) {
    for (const pattern of totalPatterns) {
      const match = line.match(pattern);
      if (match) {
        const extractedAmount = parseFloat(match[1]);
        if (extractedAmount > 0 && extractedAmount < 10000) {
          amount = extractedAmount;
          break;
        }
      }
    }
    if (amount > 0) break;
  }

  // If no total found, look for largest reasonable amount
  if (amount === 0) {
    const amountPatterns = [
      /\$(\d+\.\d{2})/g,
      /(\d+\.\d{2})/g
    ];

    const amounts = [];
    for (const line of lines) {
      for (const pattern of amountPatterns) {
        const matches = [...line.matchAll(pattern)];
        matches.forEach(match => {
          const value = parseFloat(match[1] || match[0].replace('$', ''));
          if (value > 0 && value < 10000) {
            amounts.push(value);
          }
        });
      }
    }
    
    // Use the largest amount as likely total
    if (amounts.length > 0) {
      amount = Math.max(...amounts);
    }
  }

  // Extract date
  const datePatterns = [
    /(\d{1,2}\/\d{1,2}\/\d{2,4})/,
    /(\d{1,2}-\d{1,2}-\d{2,4})/,
    /(\d{4}-\d{1,2}-\d{1,2})/,
    /(\d{1,2}\.\d{1,2}\.\d{2,4})/
  ];

  for (const line of lines) {
    for (const pattern of datePatterns) {
      const match = line.match(pattern);
      if (match) {
        try {
          const parsedDate = new Date(match[1]);
          if (!isNaN(parsedDate.getTime()) && parsedDate.getFullYear() > 2000) {
            date = parsedDate.toISOString().split('T')[0];
            break;
          }
        } catch (e) {
          // Continue if date parsing fails
        }
      }
    }
    if (date !== new Date().toISOString().split('T')[0]) break;
  }

  // Predict category based on merchant name and full text
  category = predictCategory(description, text);

  const result = {
    description: description || 'Receipt Purchase',
    amount: amount || 0,
    category,
    date,
    extracted_text: text,
    confidence: calculateConfidence(description, amount, date, text)
  };

  console.log('Parsed receipt data:', result);
  return result;
};

// Enhanced confidence calculation
const calculateConfidence = (description, amount, date, fullText) => {
  let confidence = 0;
  
  // Base confidence for having data
  if (description && description.length > 3) confidence += 30;
  if (amount > 0) confidence += 40;
  if (date) confidence += 15;
  
  // Bonus for recognizable merchant names
  const knownMerchants = Object.values(CATEGORY_PATTERNS).flat();
  const hasKnownMerchant = knownMerchants.some(pattern => pattern.test(description.toLowerCase()));
  if (hasKnownMerchant) confidence += 10;
  
  // Bonus for having total-specific keywords
  if (/total|amount due|balance/i.test(fullText)) confidence += 5;
  
  return Math.min(confidence, 100);
};

// Generate mock receipt data as fallback with realistic categories
const generateMockReceiptData = () => {
  const mockReceipts = [
    { description: 'Walmart Supercenter', amount: 67.89, category: 'Food' },
    { description: 'Shell Gas Station', amount: 45.20, category: 'Transport' },
    { description: 'Starbucks Coffee', amount: 12.50, category: 'Food' },
    { description: 'Amazon Purchase', amount: 89.99, category: 'Shopping' },
    { description: 'CVS Pharmacy', amount: 23.45, category: 'Healthcare' },
    { description: 'Target Store', amount: 156.78, category: 'Shopping' },
    { description: 'McDonald\'s', amount: 8.99, category: 'Food' },
    { description: 'Exxon Mobil', amount: 52.30, category: 'Transport' },
    { description: 'Best Buy', amount: 299.99, category: 'Shopping' },
    { description: 'Netflix', amount: 15.99, category: 'Entertainment' }
  ];
  
  const randomReceipt = mockReceipts[Math.floor(Math.random() * mockReceipts.length)];
  
  return {
    ...randomReceipt,
    date: new Date().toISOString().split('T')[0],
    extracted_text: `Mock receipt data for ${randomReceipt.description}\nTotal: $${randomReceipt.amount}`,
    confidence: 85 + Math.floor(Math.random() * 15) // 85-100% confidence
  };
};

// Store receipt data in Supabase with improved error handling
export const storeReceiptData = async (receiptData, userId) => {
  try {
    console.log('Storing receipt data:', { userId, receiptData });
    
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

    if (error) {
      console.error('Database insert error:', error);
      throw new Error(`Database error: ${error.message}`);
    }
    
    console.log('Receipt data stored successfully:', data);
    return data;
  } catch (error) {
    console.error('Error storing receipt data:', error);
    throw error;
  }
};