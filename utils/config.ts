// تكوين ثابت للنظام
export const CONFIG = {
  ADMIN_ADDRESS: '0x2C84aE14df11a456a8aE48793a3C5989Bf9D5ab4',
  NETWORK_URL: 'http://127.0.0.1:7545',
  CHAIN_ID: '1337',
  SECURITY_UTILS_CONTRACT_ADDRESS: '0xCaACAB1FA696347532070E8c82B4CBa4dc4Dc21b',
  IDENTITY_CONTRACT_ADDRESS: '0xbEBcD3099b6766b4224f0624887616E099E4dCb4',
  CERTIFICATES_CONTRACT_ADDRESS: '0x82Ba41429a7ff6e503707c4E62b8073A39d6C98d',
  EXAMINATIONS_CONTRACT_ADDRESS: '0x1E3cc1831e2910A1C25b49AA47977Ba3aac629Ec',
  EXAM_MANAGEMENT_CONTRACT_ADDRESS: '0xA82719824037C6e51eED8616d96F874E4fa19B91'
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