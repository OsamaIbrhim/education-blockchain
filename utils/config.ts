// تكوين ثابت للنظام
export const CONFIG = {
  ADMIN_ADDRESS: process.env.NEXT_PUBLIC_ADMIN_ADDRESS || '',
  NETWORK_URL: process.env.NEXT_PUBLIC_NETWORK_URL || '',
  CHAIN_ID: process.env.NEXT_PUBLIC_CHAIN_ID || '',
  SECURITY_UTILS_CONTRACT_ADDRESS: process.env.NEXT_PUBLIC_SECURITY_UTILS_CONTRACT_ADDRESS || '',
  IDENTITY_CONTRACT_ADDRESS: process.env.NEXT_PUBLIC_IDENTITY_CONTRACT_ADDRESS || '',
  CERTIFICATES_CONTRACT_ADDRESS: process.env.NEXT_PUBLIC_CERTIFICATES_CONTRACT_ADDRESS || '',
  EXAMINATIONS_CONTRACT_ADDRESS: process.env.NEXT_PUBLIC_EXAMINATIONS_CONTRACT_ADDRESS || '',
  EXAM_MANAGEMENT_CONTRACT_ADDRESS: process.env.NEXT_PUBLIC_EXAM_MANAGEMENT_CONTRACT_ADDRESS || ''
};

// وظيفة للحصول على قيمة التكوين
export const getConfig = (key: keyof typeof CONFIG): string => {
  // محاولة الحصول على القيمة من متغيرات البيئة أولاً
  const envValue = process.env[`NEXT_PUBLIC_${key}`] || process.env[key];
  
  // إذا لم يتم العثور على القيمة في متغيرات البيئة، استخدم القيمة الثابتة
  return envValue || CONFIG[key];
};

// وظيفة للتحقق من صحة التكوين
export const validateConfig = () => {
  const missingKeys: string[] = [];
  
  Object.keys(CONFIG).forEach((key) => {
    const value = getConfig(key as keyof typeof CONFIG);
    if (!value) {
      missingKeys.push(key);
    }
  });

  if (missingKeys.length > 0) {
    throw new Error(`Missing configuration values for: ${missingKeys.join(', ')}`);
  }

  return true;
}; 