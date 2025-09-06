import React, { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  VStack,
  useToast,
} from '@chakra-ui/react';
import { useLanguage } from 'context/LanguageContext';
import { RegistrationData } from 'types/registration';

interface RegistrationFormProps {
  onSuccess: (data: RegistrationData) => Promise<void>;
  isLoading?: boolean;
}

const RegistrationForm: React.FC<RegistrationFormProps> = ({ onSuccess, isLoading }) => {
  const toast = useToast();
  const { t } = useLanguage();
  const [formData, setFormData] = useState<RegistrationData>({
    role: 'student',
    name: '',
    email: '',
    phoneNumber: '',
    nationalId: '',
    institutionAddress: '',
    status: 0,
    isVerified: false,
    enrolledCourses: []
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Validate required fields
      const requiredFields = ['role', 'name', 'email', 'phoneNumber', 'nationalId'];
      
      // Add institutionAddress validation for students
      if (formData.role === 'student') {
        requiredFields.push('institutionAddress');
      }

      for (const field of requiredFields) {
        if (!formData[field as keyof RegistrationData]) {
          throw new Error(t('pleaseComplete') || `Please complete ${field}`);
        }
      }

      // Validate institution address format for students
      if (formData.role === 'student' && formData.institutionAddress) {
        if (!/^0x[a-fA-F0-9]{40}$/.test(formData.institutionAddress)) {
          throw new Error(t('invalidInstitutionAddress') || 'Invalid institution address format');
        }
      }

      await onSuccess(formData);
      
    } catch (error: any) {
      toast({
        title: t('registrationFailed') || 'Registration Failed',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <Box as="form" onSubmit={handleSubmit} width="100%" maxWidth="500px" mx="auto">
      <VStack spacing={4}>
        <FormControl isRequired>
          <FormLabel>{t('role')}</FormLabel>
          <Select
            name="role"
            value={formData.role}
            onChange={handleChange}
          >
            <option value="student">{t('studentRole')}</option>
            <option value="institution">{t('institutionRole')}</option>
            <option value="employer">{t('employerRole')}</option>
          </Select>
        </FormControl>

        <FormControl isRequired>
          <FormLabel>{t('name')}</FormLabel>
          <Input
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder={t('enterName') || "Enter your name"}
          />
        </FormControl>

        <FormControl isRequired>
          <FormLabel>{t('email')}</FormLabel>
          <Input
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder={t('enterEmail') || "Enter your email"}
          />
        </FormControl>

        <FormControl isRequired>
          <FormLabel>{t('phoneNumber')}</FormLabel>
          <Input
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            placeholder={t('enterPhone') || "Enter your phone number"}
          />
        </FormControl>

        <FormControl isRequired>
          <FormLabel>{t('nationalId')}</FormLabel>
          <Input
            name="nationalId"
            value={formData.nationalId}
            onChange={handleChange}
            placeholder={t('enterNationalId') || "Enter your National ID"}
          />
        </FormControl>

        {formData.role === 'student' && (
          <FormControl isRequired>
            <FormLabel>{t('institutionAddress')}</FormLabel>
            <Input
              name="institutionAddress"
              value={formData.institutionAddress}
              onChange={handleChange}
              placeholder={t('enterInstitutionAddress') || "Enter institution address (0x...)"}
              pattern="^0x[a-fA-F0-9]{40}$"
              title={t('invalidInstitutionAddress') || "Please enter a valid Ethereum address"}
            />
          </FormControl>
        )}
        <Button
          type="submit"
          colorScheme="blue"
          width="100%"
          isLoading={isLoading}
        >
          Register
        </Button>
      </VStack>
    </Box>
  );
};

export default RegistrationForm;
