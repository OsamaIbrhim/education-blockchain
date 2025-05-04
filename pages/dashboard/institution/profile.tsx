import React from 'react';
import {
  Box,
  Container,
  useColorModeValue,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  VStack,
} from '@chakra-ui/react';
import { useRouter } from 'next/router';
import InstitutionProfile, { InstitutionData } from '../../../components/institution/InstitutionProfile';
import { useInstitution } from '../../../hooks/useInstitution';
import { useAccount } from 'wagmi';
import { useContract } from '../../../hooks/useContract';
import Layout from '../../../components/layout/Layout';

const InstitutionProfilePage = () => {
  const router = useRouter();
  const bgColor = useColorModeValue('gray.50', 'gray.800');
  const { address } = useAccount();
  const { saveInstitutionProfile, isLoading, exams, isVerified } = useInstitution();
  const { examManagement } = useContract();
  const pageName = 'الملف الشخصي للمؤسسة | Institution Profile';

  const handleSaveProfile = async (data: InstitutionData) => {
    try {
      await saveInstitutionProfile(data);
      if (!isVerified) {
        router.push('/dashboard/institution/profile');
      } else {
        router.push('/dashboard/institution');
      }
    } catch (error: any) {
      console.error('Error saving profile:', error);
    }
  };

  return (
    <Layout address={address} exams={exams} pageName={pageName}>
      <Box minH="100vh" bg={bgColor}>
        <Container maxW="container.xl" py={8}>
          <VStack spacing={6} align="stretch">
            {/* {!isVerified && (
              <Alert status="warning" borderRadius="md">
                <AlertIcon />
                <Box flex="1">
                  <AlertTitle>في انتظار التحقق | Pending Verification</AlertTitle>
                  <AlertDescription display="block">
                    يرجى إكمال ملفك الشخصي وانتظار التحقق من قبل المسؤول | Please complete your profile and wait for admin verification
                  </AlertDescription>
                </Box>
              </Alert>
            )} */}
            <InstitutionProfile
              onSave={handleSaveProfile}
              loading={isLoading}
              contract={examManagement}
              userAddress={address}
            />
          </VStack>
        </Container>
      </Box>
    </Layout>
  );
};

export default InstitutionProfilePage; 