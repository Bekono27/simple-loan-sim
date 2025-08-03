import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BankStatementRequest {
  fileContent: string;
  fileName: string;
  fileType: string;
}

interface BankStatementResponse {
  isValid: boolean;
  reason: string;
  confidence: number;
  extractedData?: {
    accountHolder?: string;
    accountNumber?: string;
    bankName?: string;
    transactionCount?: number;
    avgBalance?: number;
    maxBalance?: number;
    minBalance?: number;
  };
}

const validateBankStatement = (content: string, fileName: string): BankStatementResponse => {
  console.log('Validating bank statement:', fileName);
  
  // Convert to lowercase for easier matching
  const lowercaseContent = content.toLowerCase();
  const lowercaseFileName = fileName.toLowerCase();
  
  // Bank identifiers in Mongolian banks
  const mongolianBankKeywords = [
    'монгол банк', 'trade development bank', 'khan bank', 'golomt bank',
    'state bank', 'хаан банк', 'голомт банк', 'капитрон банк', 'ард банк',
    'хөгжлийн банк', 'national investment bank', 'ulaanbaatar city bank',
    'төрийн банк', 'чингис хаан банк', 'account statement', 'дансны хуулга',
    'balance', 'үлдэгдэл', 'transaction', 'гүйлгээ', 'deposit', 'хадгаламж',
    'withdrawal', 'авалт', 'сарын эхэн', 'сарын төгсгөл'
  ];
  
  // Check for bank-related keywords
  const bankKeywordFound = mongolianBankKeywords.some(keyword => 
    lowercaseContent.includes(keyword) || lowercaseFileName.includes(keyword)
  );
  
  // Check for typical bank statement patterns
  const hasAccountNumber = /[0-9]{8,16}/.test(content); // Account number pattern
  const hasDatePattern = /\d{4}[-/.]\d{1,2}[-/.]\d{1,2}/.test(content); // Date pattern
  const hasAmountPattern = /[₮\d,]+\.?\d*/.test(content); // Amount pattern
  const hasTransactionWords = /гүйлгээ|transaction|үлдэгдэл|balance|авлага|deposit/i.test(content);
  
  // Check file extension
  const isPDF = lowercaseFileName.includes('.pdf');
  const isImageFile = /\.(jpg|jpeg|png|gif)$/i.test(lowercaseFileName);
  
  // Calculate confidence score
  let confidence = 0;
  if (bankKeywordFound) confidence += 30;
  if (hasAccountNumber) confidence += 20;
  if (hasDatePattern) confidence += 15;
  if (hasAmountPattern) confidence += 15;
  if (hasTransactionWords) confidence += 10;
  if (isPDF || isImageFile) confidence += 10;
  
  // Determine if valid
  const isValid = confidence >= 50;
  
  let reason = '';
  if (!isValid) {
    if (!bankKeywordFound) reason += 'Банкны нэр олдсонгүй. ';
    if (!hasAccountNumber) reason += 'Дансны дугаар олдсонгүй. ';
    if (!hasTransactionWords) reason += 'Гүйлгээний мэдээлэл олдсонгүй. ';
    if (!hasDatePattern) reason += 'Огнооны мэдээлэл олдсонгүй. ';
    reason += 'Энэ файл банкны хуулга биш байна.';
  } else {
    reason = 'Банкны хуулга гэж баталгаажлаа.';
  }
  
  return {
    isValid,
    reason,
    confidence,
    extractedData: isValid ? {
      accountHolder: 'Хэрэглэгч', // This would be extracted in real implementation
      bankName: 'Монгол банк', // This would be extracted in real implementation
      transactionCount: Math.floor(Math.random() * 50) + 10, // Mock data
      avgBalance: Math.floor(Math.random() * 1000000) + 500000, // Mock data
    } : undefined
  };
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { fileContent, fileName, fileType }: BankStatementRequest = await req.json();
    
    console.log('Processing bank statement verification:', fileName);
    
    if (!fileContent || !fileName) {
      return new Response(
        JSON.stringify({ 
          isValid: false, 
          reason: 'Файлын мэдээлэл дутуу байна',
          confidence: 0
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
    
    // Validate the bank statement
    const result = validateBankStatement(fileContent, fileName);
    
    console.log('Validation result:', result);
    
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    console.error('Error processing bank statement:', error);
    
    return new Response(
      JSON.stringify({ 
        isValid: false, 
        reason: 'Файл боловсруулахад алдаа гарлаа',
        confidence: 0
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});