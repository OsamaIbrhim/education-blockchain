import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import {
  Container,
  VStack,
  Heading,
  Text,
  Box,
  Button,
  Input,
  FormControl,
  FormLabel,
  useToast,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Spinner,
  Center,
  HStack,
  Divider,
  useColorModeValue,
  Grid,
  GridItem,
  Tooltip,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Progress,
  Icon,
  Fade,
  ScaleFade,
  Skeleton,
  Alert,
  AlertIcon,
  Link,
  FormHelperText,
  BoxProps,
  IconButton,
  createIcon,
} from '@chakra-ui/react';
import { getUserRole, isOwner } from 'services/identity';
import { connectWallet } from '../../utils/web3Provider';
import { IconType } from 'react-icons';
import {
  FiUserCheck,
  FiCheckCircle,
  FiAlertCircle,
  FiInfo,
  FiUser,
  FiShield,
  FiDatabase,
  FiActivity,
  FiSettings,
  FiBriefcase,
  FiUsers,
  FiArrowUp
} from 'react-icons/fi';
import React from 'react';
import { getConfig } from '../../utils/config';
import { useAppData } from 'hooks/useAppData';

// Import the new SimpleLogoutButton
import SimpleLogoutButton from '../../components/SimpleLogoutButton';
import { Institution } from 'types/institution';

// Layout
import Layout from '../../components/layout/Layout';
import ProtectedRoute from '../../components/auth/ProtectedRoute';

// Lazy load components
const StatsGrid = dynamic(() => import('../../components/dashboard/StatsGrid'), {
  loading: () => <Spinner />,
  ssr: false
});

const InstitutionsTable = dynamic(() => import('../../components/dashboard/InstitutionsTable'), {
  loading: () => <Spinner />,
  ssr: false
});

// تعريف الأيقونات كمكونات Chakra UI
const UserIcon = createIcon({
  displayName: 'UserIcon',
  viewBox: '0 0 24 24',
  path: (
    <path
      fill="currentColor"
      d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
});

const ShieldIcon = createIcon({
  displayName: 'ShieldIcon',
  viewBox: '0 0 24 24',
  path: (
    <path
      fill="currentColor"
      d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
});

const DatabaseIcon = createIcon({
  displayName: 'DatabaseIcon',
  viewBox: '0 0 24 24',
  path: (
    <path
      fill="currentColor"
      d="M12 2a8 8 0 0 0-8 8v4a8 8 0 0 0 16 0v-4a8 8 0 0 0-8-8zm0 18a6 6 0 0 1-6-6v-4a6 6 0 0 1-12 0v4a6 6 0 0 1-6 6z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
});

const CheckIcon = createIcon({
  displayName: 'CheckIcon',
  viewBox: '0 0 24 24',
  path: (
    <path
      fill="currentColor"
      d="M20 6L9 17l-5-5"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
});

const InfoIcon = createIcon({
  displayName: 'InfoIcon',
  viewBox: '0 0 24 24',
  path: (
    <path
      fill="currentColor"
      d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zm0-14v4m0 4h.01"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
});

const BriefcaseIcon = createIcon({
  displayName: 'BriefcaseIcon',
  viewBox: '0 0 24 24',
  path: (
    <path
      fill="currentColor"
      d="M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2zm0 0V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2m4 6v2"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
});

const SettingsIcon = createIcon({
  displayName: 'SettingsIcon',
  viewBox: '0 0 24 24',
  path: (
    <path
      fill="currentColor"
      d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1-2-2 2 2 0 0 1-2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06-.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
});

interface IconComponentProps extends BoxProps {
  icon: IconType;
}

const IconComponent = ({ icon: IconComponent, ...props }: IconComponentProps) => (
  <Box as="span" display="inline-flex" alignItems="center" justifyContent="center" {...props}>
    {IconComponent && <IconComponent />}
  </Box>
);

// Update the TutorialModal component
const TutorialModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => (
  <Modal isOpen={isOpen} onClose={onClose} size="xl">
    <ModalOverlay />
    <ModalContent>
      <ModalHeader>مرحباً بك في لوحة تحكم المسؤول - Welcome to Admin Dashboard</ModalHeader>
      <ModalCloseButton />
      <ModalBody pb={6}>
        <VStack spacing={4} align="stretch">
          <Text>
            👋 مرحباً بك في لوحة تحكم المسؤول:
            <br />
            • التحقق من المؤسسات التعليمية
            <br />
            • مراقبة حالة المؤسسات
            <br />
            • إدارة النظام بشكل كامل
          </Text>
          <Text>
            Welcome to your Admin Dashboard:
            <br />
            • Verify educational institutions
            <br />
            • Monitor institutions status
            <br />
            • Manage the entire system
          </Text>
          <Button colorScheme="red" onClick={onClose}>
            فهمت - Got it!
          </Button>
        </VStack>
      </ModalBody>
    </ModalContent>
  </Modal>
);

export default function AdminDashboard() {
  const { allInstitutions, verifyUser, account, userRole, isLoading } = useAppData();
  const router = useRouter();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [institutionAddress, setInstitutionAddress] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isFirstVisit, setIsFirstVisit] = useState(true);
  const [verificationProgress, setVerificationProgress] = useState(0);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const bgColor = useColorModeValue('white', 'gray.800');
  const [isAdmin, setIsAdmin] = useState(false);
  const institutionsSectionRef = useRef<HTMLDivElement>(null);
  const totalInstitutionsRef = useRef<HTMLDivElement>(null);
  const verifiedInstitutionsRef = useRef<HTMLDivElement>(null);
  const pendingInstitutionsRef = useRef<HTMLDivElement>(null);

  // Colors
  const bgGradient = useColorModeValue(
    'linear-gradient(120deg, red.500 0%, red.700 100%)',
    'linear-gradient(120deg, red.700 0%, red.900 100%)'
  );
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('red.100', 'red.700');
  const textColor = useColorModeValue('gray.800', 'white');
  const mutedTextColor = useColorModeValue('gray.600', 'gray.400');

  useEffect(() => {
    checkAccess();
    const hasVisited = localStorage.getItem('hasVisitedAdminDashboard');
    if (!hasVisited) {
      onOpen();
      localStorage.setItem('hasVisitedAdminDashboard', 'true');
    }
  }, []);

  useEffect(() => {
    if (userRole && userRole !== 'admin') {
      router.replace('/');
    }
  }, [userRole, router]);

  const checkAccess = async () => {
    try {
      setLoading(true);
      if (typeof window === 'undefined' || !window.ethereum) {
        throw new Error('MetaMask غير مثبت - MetaMask is not installed');
      }

      const adminAddress = getConfig('ADMIN_ADDRESS');

      if (!account || account.toLowerCase() !== adminAddress.toLowerCase()) {
        throw new Error('غير مصرح لك بالوصول لهذه الصفحة - You are not authorized to access this page');
      }

      const role = Number(await getUserRole(account));
      const isSystemOwner = await isOwner(account);

      console.log('Role Check:', {
        role,
        isSystemOwner,
        isAdmin: role === 4
      });

      if (role !== 4 && !isSystemOwner) {
        throw new Error('ليس لديك صلاحيات كافية للوصول - Insufficient permissions');
      }

      localStorage.setItem('adminAddress', account);
      localStorage.setItem('userRole', role.toString());
      setIsAdmin(true);
      setLoading(false);

    } catch (error: any) {
      console.error('Access Check Error:', error);
      setError(error.message);
      setLoading(false);
      setIsAdmin(false);

      setTimeout(() => {
        router.push('/');
      }, 2000);
    }
  };

  const handleverifyUser = async (address?: string) => {
    if (!institutionAddress && !address) {
      toast({
        title: 'خطأ - Error',
        description: 'يرجى إدخال عنوان المؤسسة - Please enter institution address',
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'top',
      });
      return;
    }

    try {
      setLoading(true);
      setVerificationProgress(25);

      const institution = address || institutionAddress.trim();

      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setVerificationProgress(prev => Math.min(prev + 15, 90));
      }, 500);

      const { status } = await verifyUser(institution);
      setVerificationProgress(95);

      setInstitutionAddress('');

      if (status === 'success') {
        toast({
          title: 'نجاح - Success',
          description: 'تم التحقق من المؤسسة بنجاح - Institution verified successfully',
          status: 'success',
          duration: 5000,
          isClosable: true,
          position: 'top-right',
        });
      } else if (status === 'already verified') {
        toast({
          title: 'تحذير - Warning',
          description: 'المؤسسة تم التحقق منها مسبقاً - Institution already verified',
          status: 'warning',
          duration: 5000,
          isClosable: true,
          position: 'top-right',
        });
      }

      clearInterval(progressInterval);
      setVerificationProgress(100);

      // Reset progress after completion
      setTimeout(() => {
        setVerificationProgress(0);
      }, 1000);

    } catch (error: any) {
      console.error('Error verifying institution:', error);
      toast({
        title: 'خطأ - Error',
        description: error.message || 'فشل في التحقق من المؤسسة - Failed to verify institution',
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'top',
      });
    } finally {
      setLoading(false);
    }
  };

  const scrollToInstitutions = () => {
    institutionsSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToTotal = () => totalInstitutionsRef.current?.scrollIntoView({ behavior: 'smooth' });
  const scrollToVerified = () => verifiedInstitutionsRef.current?.scrollIntoView({ behavior: 'smooth' });
  const scrollToPending = () => pendingInstitutionsRef.current?.scrollIntoView({ behavior: 'smooth' });

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <Center h="100vh" bg={useColorModeValue('gray.50', 'gray.900')}>
        <VStack spacing={4}>
          <Spinner size="xl" color="red.500" thickness="4px" speed="0.65s" />
          <Text fontSize="lg">جاري التحميل... - Loading...</Text>
          <Progress
            size="xs"
            isIndeterminate
            width="200px"
            colorScheme="red"
          />
        </VStack>
      </Center>
    );
  }

  if (error) {
    return (
      <Center h="100vh" bg={useColorModeValue('gray.50', 'gray.900')}>
        <ScaleFade initialScale={0.9} in={true}>
          <Alert
            status="error"
            variant="subtle"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            textAlign="center"
            height="200px"
            bg={cardBg}
            borderRadius="xl"
            shadow="2xl"
          >
            <AlertIcon boxSize="40px" mr={0} />
            <Text color="red.500" fontSize="xl" mt={4}>
              {error}
            </Text>
            <Button
              colorScheme="red"
              size="lg"
              onClick={checkAccess}
              mt={4}
            >
              إعادة المحاولة - Retry
            </Button>
          </Alert>
        </ScaleFade>
      </Center>
    );
  }

  return (
    <Layout pageName="لوحة تحكم المسؤول | Admin Dashboard" address={account} allowedValue={userRole}>
      <Box minH="100vh" bg={useColorModeValue('gray.50', 'gray.900')}>
        {isOpen && <TutorialModal isOpen={isOpen} onClose={onClose} />}

        <Container maxW="container.xl" pb="100px">
          <Grid templateColumns="repeat(12, 1fr)" gap={6}>
            {/* Enhanced Sidebar with Animations */}
            <GridItem colSpan={{ base: 12, lg: 3 }}>
              <VStack spacing={6} align="stretch">
                <ScaleFade initialScale={0.9} in={true}>
                  <Box
                    bg={cardBg}
                    p={6}
                    borderRadius="xl"
                    shadow="xl"
                    borderWidth="1px"
                    borderColor={borderColor}
                    position="relative"
                    overflow="hidden"
                    transition="transform 0.2s"
                    _hover={{ transform: 'translateY(-2px)' }}
                  >
                    <Box
                      position="absolute"
                      top={0}
                      left={0}
                      right={0}
                      h="4px"
                      bgGradient="linear(to-r, red.400, red.600)"
                    />
                    <VStack spacing={4} align="stretch">
                      <HStack>
                        <Icon as={UserIcon} w={5} h={5} color="red.500" />
                        <Text fontWeight="bold" fontSize="sm" color={mutedTextColor}>
                          المحفظة المتصلة - CONNECTED ACCOUNT
                        </Text>
                      </HStack>
                      <Tooltip label="عنوان المحفظة - Wallet Address" placement="top">
                        <Text fontSize="sm" wordBreak="break-all" color={textColor}>
                          {account}
                        </Text>
                      </Tooltip>
                      <Divider />
                      <Tooltip label="دور المستخدم - User Role" placement="top">
                        <Badge colorScheme="red" px={3} py={1} borderRadius="full">
                          <HStack spacing={2}>
                            <Icon as={ShieldIcon} w={4} h={4} />
                            <Text>مسؤول النظام - System Admin</Text>
                          </HStack>
                        </Badge>
                      </Tooltip>
                    </VStack>
                  </Box>
                </ScaleFade>

                {/* System Info Box with Icons */}
                <ScaleFade initialScale={0.9} in={true} delay={0.1}>
                  <Box
                    bg={useColorModeValue('red.50', 'red.900')}
                    p={6}
                    borderRadius="xl"
                    shadow="md"
                    transition="transform 0.2s"
                    _hover={{ transform: 'translateY(-2px)' }}
                  >
                    <VStack spacing={3} align="start">
                      <HStack>
                        <Icon as={DatabaseIcon} w={5} h={5} color="red.500" />
                        <Heading size="sm" color={useColorModeValue('red.600', 'red.200')}>
                          مميزات النظام - System Features
                        </Heading>
                      </HStack>
                      <VStack spacing={3} align="start" pl={6}>
                        <HStack>
                          <Icon as={CheckIcon} w={4} h={4} />
                          <Text fontSize="sm" color={mutedTextColor}>
                            التحقق من المؤسسات
                            <br />
                            Verify Institutions
                          </Text>
                        </HStack>
                        <HStack>
                          <Icon as={BriefcaseIcon} w={4} h={4} />
                          <Text fontSize="sm" color={mutedTextColor}>
                            إدارة المؤسسات
                            <br />
                            Manage Institutions
                          </Text>
                        </HStack>
                        <HStack>
                          <Icon as={SettingsIcon} w={4} h={4} />
                          <Text fontSize="sm" color={mutedTextColor}>
                            إعدادات النظام
                            <br />
                            System Settings
                          </Text>
                        </HStack>
                      </VStack>
                    </VStack>
                  </Box>
                </ScaleFade>
              </VStack>
            </GridItem>

            {/* Enhanced Main Content with Animations */}
            <GridItem colSpan={{ base: 12, lg: 9 }}>
              <VStack spacing={6} align="stretch">
                {/* Enhanced Stats with Hover Effects */}
                <StatsGrid
                  institutions={allInstitutions}
                  scrollToTotal={scrollToTotal}
                  scrollToVerified={scrollToVerified}
                  scrollToPending={scrollToPending}
                  cardBg={cardBg}
                  borderColor={borderColor}
                  mutedTextColor={mutedTextColor}
                />

                {/* Enhanced Institution Verification Form */}
                <ScaleFade initialScale={0.9} in={true}>
                  <Box
                    bg={cardBg}
                    borderRadius="xl"
                    shadow="xl"
                    overflow="hidden"
                    borderWidth="1px"
                    borderColor={borderColor}
                  >
                    <Box p={6}>
                      <VStack spacing={4} align="stretch">
                        <Heading size="md" color={textColor}>
                          التحقق من مؤسسة جديدة - Verify New Institution
                        </Heading>
                        <Text color={mutedTextColor}>
                          أدخل عنوان المحفظة للمؤسسة للتحقق منها
                          <br />
                          Enter the institution's wallet address to verify
                        </Text>
                        <FormControl>
                          <FormLabel fontWeight="bold">عنوان المؤسسة - Institution Address</FormLabel>
                          <Input
                            value={institutionAddress}
                            onChange={(e) => setInstitutionAddress(e.target.value)}
                            placeholder="0x..."
                            size="lg"
                            bg={useColorModeValue('white', 'gray.700')}
                            _focus={{
                              borderColor: "red.400",
                              boxShadow: "0 0 0 1px red.400"
                            }}
                          />
                          <FormHelperText color={mutedTextColor}>
                            يجب أن يكون العنوان صالحاً على شبكة إيثريوم
                            <br />
                            Must be a valid Ethereum address
                          </FormHelperText>
                        </FormControl>
                        <Button
                          colorScheme="red"
                          size="lg"
                          onClick={() => handleverifyUser()}
                          isLoading={loading}
                          loadingText="جاري التحقق... - Verifying..."
                          leftIcon={<Icon as={CheckIcon} w={5} h={5} />}
                          _hover={{
                            transform: 'translateY(-2px)',
                            boxShadow: 'lg',
                          }}
                        >
                          <HStack spacing={2}>
                            <Icon as={CheckIcon} w={5} h={5} />
                            <Text>تحقق من المؤسسة - Verify Institution</Text>
                          </HStack>
                        </Button>
                        {verificationProgress > 0 && (
                          <Progress
                            value={verificationProgress}
                            size="xs"
                            colorScheme="red"
                            borderRadius="full"
                            isAnimated
                            hasStripe
                          />
                        )}
                      </VStack>
                    </Box>

                  </Box>
                  <Divider />
                  {/* Enhanced Institutions List */}
                  <Box
                    bg={cardBg}
                    borderRadius="xl"
                    marginTop={2.5}
                    shadow="xl"
                    overflow="hidden"
                    borderWidth="1px"
                    borderColor={borderColor}
                  >
                    {/* Total Institutions Table */}
                    <Box p={6} ref={totalInstitutionsRef}>
                      <InstitutionsTable
                        institutions={allInstitutions}
                        onVerify={handleverifyUser}
                        isLoading={isLoading}
                      />
                    </Box>
                  </Box>
                  <Box
                    bg={cardBg}
                    borderRadius="xl"
                    marginTop={2.5}
                    shadow="xl"
                    overflow="hidden"
                    borderWidth="1px"
                    borderColor={borderColor}
                  >
                    {/* Verified Institutions Table */}
                    <Box ref={verifiedInstitutionsRef} p={6} mt={6}>
                      <Heading size="md" mb={2}>المؤسسات المعتمدة - Verified Institutions</Heading>
                      <InstitutionsTable institutions={allInstitutions.filter(i => i.isVerified)} isLoading={isLoading} />
                    </Box>
                  </Box>
                  <Box
                    bg={cardBg}
                    borderRadius="xl"
                    marginTop={2.5}
                    shadow="xl"
                    overflow="hidden"
                    borderWidth="1px"
                    borderColor={borderColor}
                  >
                    {/* Pending Institutions Table */}
                    <Box ref={pendingInstitutionsRef} p={6} mt={6}>
                      <Heading size="md" mb={2}>المؤسسات قيد التحقق - Pending Institutions</Heading>
                      <InstitutionsTable institutions={allInstitutions.filter(i => !i.isVerified)} onVerify={handleverifyUser} isLoading={isLoading} />
                    </Box>
                  </Box>
                </ScaleFade>
              </VStack>
            </GridItem>
          </Grid>
        </Container>

        <IconButton
          aria-label="الرجوع للأعلى"
          icon={<Icon as={FiArrowUp} />}
          position="fixed"
          bottom="90px"
          right="40px"
          zIndex={1000}
          colorScheme="red"
          size="lg"
          borderRadius="full"
          boxShadow="lg"
          onClick={scrollToTop}
        />
      </Box>
    </Layout>
  );
}