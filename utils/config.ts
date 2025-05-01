// تكوين ثابت للنظام
export const CONFIG = {
  ADMIN_ADDRESS: '0x2C84aE14df11a456a8aE48793a3C5989Bf9D5ab4',
  NETWORK_URL: 'http://127.0.0.1:7545',
  CHAIN_ID: '1337',
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