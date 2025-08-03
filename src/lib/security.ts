// Authentication utility functions for enhanced security
export const cleanupAuthState = () => {
  // Remove standard auth tokens
  localStorage.removeItem('supabase.auth.token');
  
  // Remove all Supabase auth keys from localStorage
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
      localStorage.removeItem(key);
    }
  });
  
  // Remove from sessionStorage if in use
  Object.keys(sessionStorage || {}).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
      sessionStorage.removeItem(key);
    }
  });
};

export const validatePassword = (password: string): { isValid: boolean; message: string } => {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  if (password.length < minLength) {
    return { isValid: false, message: `Нууц үг дор хаяж ${minLength} тэмдэгт байх ёстой` };
  }
  
  if (!hasUpperCase) {
    return { isValid: false, message: "Нууц үгэнд том үсэг байх ёстой" };
  }
  
  if (!hasLowerCase) {
    return { isValid: false, message: "Нууц үгэнд жижиг үсэг байх ёстой" };
  }
  
  if (!hasNumbers) {
    return { isValid: false, message: "Нууц үгэнд тоо байх ёстой" };
  }
  
  if (!hasSpecialChar) {
    return { isValid: false, message: "Нууц үгэнд тусгай тэмдэгт байх ёстой (!@#$%^&* гэх мэт)" };
  }
  
  return { isValid: true, message: "Нууц үг хүчтэй байна" };
};

export const checkCommonPasswords = (password: string): boolean => {
  const commonPasswords = [
    'password', '123456', '123456789', 'qwerty', 'abc123', 
    'password123', 'admin', 'letmein', 'welcome', 'monkey',
    'dragon', 'master', 'hello', 'freedom', 'whatever',
    'iloveyou', 'superman', 'michael', 'sunshine', 'princess'
  ];
  
  return commonPasswords.includes(password.toLowerCase());
};

export const encryptSensitiveData = (data: string): string => {
  // Simple base64 encoding for demonstration
  // In production, use proper encryption libraries
  return btoa(data);
};

export const decryptSensitiveData = (encryptedData: string): string => {
  // Simple base64 decoding for demonstration
  try {
    return atob(encryptedData);
  } catch {
    return encryptedData;
  }
};