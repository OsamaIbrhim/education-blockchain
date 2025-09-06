import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import {
  Box,
  Button,
  Center,
  Container,
  Divider,
  FormControl,
  FormHelperText,
  FormLabel,
  Grid,
  GridItem,
  Heading,
  HStack,
  Icon,
  IconButton,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Progress,
  ScaleFade,
  Spinner,
  Stack,
  Text,
  Tooltip,
  useColorModeValue,
  useDisclosure,
  useToast,
  VStack,
  Alert,
  AlertIcon,
  Badge,
} from '@chakra-ui/react';
import { createIcon } from '@chakra-ui/icons';
import { FiArrowUp } from 'react-icons/fi';
import { IconType } from 'react-icons';

import { getUserRole, isOwner } from 'services/identity';
import { useAppData } from 'hooks/useAppData';
import { getConfig } from '../../utils/config';
import { useLanguage } from 'context/LanguageContext';
import Layout from '../../components/layout/Layout';

// Lazy loaded components
const StatsGrid = dynamic(() => import('../../components/dashboard/StatsGrid'), {
  loading: () => <Spinner />,
  ssr: false,
});
const InstitutionsTable = dynamic(() => import('../../components/dashboard/InstitutionsTable'), {
  loading: () => <Spinner />,
  ssr: false,
});

// Custom Chakra Icons
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

// Tutorial Modal Component
const TutorialModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { t } = useLanguage();

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{t('welcomeAdminDashboard')}</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <VStack spacing={4} align="stretch">
            <Text>
              👋 {t('welcomeAdminDashboard')}:
              <br />
              • {t('verifyEducationalInstitutions')}
              <br />
              • {t('monitorInstitutionsStatus')}
              <br />
              • {t('manageSystem')}
            </Text>
            <Button colorScheme="red" onClick={onClose} alignSelf="flex-end">
              {t('gotIt')}
            </Button>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

const AdminDashboard: React.FC = () => {
  const { t, translations } = useLanguage();
  const { allInstitutions, verifyUser, account, userRole, isLoading } = useAppData();
  const router = useRouter();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  // State
  const [loading, setLoading] = useState(true);
  const [institutionAddress, setInstitutionAddress] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [verificationProgress, setVerificationProgress] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);

  // Refs for scrolling
  const totalInstitutionsRef = useRef<HTMLDivElement>(null);
  const verifiedInstitutionsRef = useRef<HTMLDivElement>(null);
  const pendingInstitutionsRef = useRef<HTMLDivElement>(null);

  // Colors
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('red.100', 'red.700');
  const mutedTextColor = useColorModeValue('gray.600', 'gray.400');
  const textColor = useColorModeValue('gray.800', 'white');

  // Check access on mount
  useEffect(() => {
    const checkAccess = async () => {
      try {
        setLoading(true);

        if (typeof window === 'undefined' || !window.ethereum) {
          throw new Error(t('metamaskNotInstalled'));
        }

        if (!account) {
          throw new Error(t('notAuthorized'));
        }

        const adminAddress = getConfig('ADMIN_ADDRESS');
        if (account.toLowerCase() !== adminAddress.toLowerCase()) {
          throw new Error(t('notAuthorized'));
        }

        const role = Number(await getUserRole(account));
        const isSystemOwner = await isOwner(account);

        if (role !== 4 && !isSystemOwner) {
          throw new Error(t('insufficientPermissions'));
        }

        localStorage.setItem('adminAddress', account);
        localStorage.setItem('userRole', role.toString());
        setIsAdmin(true);
        setError(null);
      } catch (err: any) {
        setError(err.message || t('unknownError'));
        setIsAdmin(false);
        setTimeout(() => router.push('/'), 2000);
      } finally {
        setLoading(false);
      }
    };

    checkAccess();

    // Show tutorial modal on first visit
    if (!localStorage.getItem('hasVisitedAdminDashboard')) {
      onOpen();
      localStorage.setItem('hasVisitedAdminDashboard', 'true');
    }
  }, [account, router, t, onOpen]);

  // Redirect non-admin users immediately
  useEffect(() => {
    if (userRole && userRole !== 'admin') {
      router.replace('/');
    }
  }, [userRole, router]);

  // Verification handler
  const handleVerifyUser = useCallback(
    async (address?: string) => {
      const targetAddress = address || institutionAddress.trim();

      if (!targetAddress) {
        toast({
          title: t('error'),
          description: t('pleaseEnterInstitutionAddress'),
          status: 'error',
          duration: 3000,
          isClosable: true,
          position: 'top',
        });
        return;
      }

      setLoading(true);
      setVerificationProgress(25);

      let progressInterval: NodeJS.Timeout | null = null;

      try {
        progressInterval = setInterval(() => {
          setVerificationProgress((prev) => Math.min(prev + 15, 90));
        }, 500);

        const { status } = await verifyUser(targetAddress);

        setVerificationProgress(95);
        setInstitutionAddress('');

        if (status === 'success') {
          toast({
            title: t('success'),
            description: t('institutionVerified'),
            status: 'success',
            duration: 5000,
            isClosable: true,
            position: 'top-right',
          });
        } else if (status === 'already verified') {
          toast({
            title: t('warning'),
            description: t('alreadyVerified'),
            status: 'warning',
            duration: 5000,
            isClosable: true,
            position: 'top-right',
          });
        }
      } catch (err: any) {
        toast({
          title: t('error'),
          description: err.message || t('failedToVerifyInstitution'),
          status: 'error',
          duration: 3000,
          isClosable: true,
          position: 'top',
        });
      } finally {
        if (progressInterval) clearInterval(progressInterval);
        setVerificationProgress(100);
        setTimeout(() => setVerificationProgress(0), 1000);
        setLoading(false);
      }
    },
    [institutionAddress, toast, t, verifyUser]
  );

  // Scroll handlers
  const scrollToRef = (ref: React.RefObject<HTMLDivElement>) => {
    ref.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  // Memoized filtered institutions
  const verifiedInstitutions = useMemo(() => allInstitutions.filter((i) => i.isVerified), [allInstitutions]);
  const pendingInstitutions = useMemo(() => allInstitutions.filter((i) => !i.isVerified), [allInstitutions]);

  // Loading or error states
  if (Object.keys(translations).length === 0 || loading) {
    return (
      <Center h="100vh" bg={bgColor}>
        <VStack spacing={4}>
          <Spinner size="xl" color="red.500" thickness="4px" speed="0.65s" />
          <Text fontSize="lg">{t('loading')}</Text>
          <Progress size="xs" isIndeterminate width="200px" colorScheme="red" />
        </VStack>
      </Center>
    );
  }

  if (error) {
    return (
      <Center h="100vh" bg={bgColor}>
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
            <Button colorScheme="red" size="lg" onClick={() => window.location.reload()} mt={4}>
              {t('retry')}
            </Button>
          </Alert>
        </ScaleFade>
      </Center>
    );
  }

  return (
    <Layout pageName={t('adminDashboard')} address={account} allowedValue={userRole}>
      <Box minH="100vh" bg={bgColor} pb="100px">
        <TutorialModal isOpen={isOpen} onClose={onClose} />

        <Container maxW="container.xl" pt={6}>
          <Grid templateColumns={{ base: '1fr', lg: 'repeat(12, 1fr)' }} gap={6}>
            {/* Sidebar */}
            <GridItem colSpan={{ base: 1, lg: 3 }}>
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
                          {t('connectedAccount')}
                        </Text>
                      </HStack>
                      <Tooltip label={t('walletAddress')} placement="top">
                        <Text fontSize="sm" wordBreak="break-all" color={textColor}>
                          {account}
                        </Text>
                      </Tooltip>
                      <Divider />
                      <Tooltip label={t('userRole')} placement="top">
                        <Badge colorScheme="red" px={3} py={1} borderRadius="full">
                          <HStack spacing={2}>
                            <Icon as={ShieldIcon} w={4} h={4} />
                            <Text>{t('systemAdmin')}</Text>
                          </HStack>
                        </Badge>
                      </Tooltip>
                    </VStack>
                  </Box>
                </ScaleFade>

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
                          {t('systemFeatures')}
                        </Heading>
                      </HStack>
                      <VStack spacing={3} align="start" pl={6}>
                        <HStack>
                          <Icon as={CheckIcon} w={4} h={4} />
                          <Text fontSize="sm" color={mutedTextColor}>
                            {t('verifyInstitutions')}
                          </Text>
                        </HStack>
                        <HStack>
                          <Icon as={BriefcaseIcon} w={4} h={4} />
                          <Text fontSize="sm" color={mutedTextColor}>
                            {t('manageInstitutions')}
                          </Text>
                        </HStack>
                        <HStack>
                          <Icon as={SettingsIcon} w={4} h={4} />
                          <Text fontSize="sm" color={mutedTextColor}>
                            {t('systemSettings')}
                          </Text>
                        </HStack>
                      </VStack>
                    </VStack>
                  </Box>
                </ScaleFade>
              </VStack>
            </GridItem>

            {/* Main Content */}
            <GridItem colSpan={{ base: 1, lg: 9 }}>
              <VStack spacing={6} align="stretch">
                <StatsGrid
                  institutions={allInstitutions}
                  scrollToTotal={() => scrollToRef(totalInstitutionsRef)}
                  scrollToVerified={() => scrollToRef(verifiedInstitutionsRef)}
                  scrollToPending={() => scrollToRef(pendingInstitutionsRef)}
                  cardBg={cardBg}
                  borderColor={borderColor}
                  mutedTextColor={mutedTextColor}
                />

                <ScaleFade initialScale={0.9} in={true}>
                  <Box
                    bg={cardBg}
                    borderRadius="xl"
                    shadow="xl"
                    overflow="hidden"
                    borderWidth="1px"
                    borderColor={borderColor}
                    p={6}
                  >
                    <VStack spacing={4} align="stretch">
                      <Heading size="md" color={textColor}>
                        {t('verifyNewInstitution')}
                      </Heading>
                      <Text color={mutedTextColor}>{t('enterInstitutionWallet')}</Text>
                      <FormControl>
                        <FormLabel fontWeight="bold">{t('institutionAddress')}</FormLabel>
                        <Input
                          value={institutionAddress}
                          onChange={(e) => setInstitutionAddress(e.target.value)}
                          placeholder="0x..."
                          size="lg"
                          bg={useColorModeValue('white', 'gray.700')}
                          _focus={{
                            borderColor: 'red.400',
                            boxShadow: '0 0 0 1px red.400',
                          }}
                          aria-label={t('institutionAddress')}
                        />
                        <FormHelperText color={mutedTextColor}>{t('mustBeValidEthereum')}</FormHelperText>
                      </FormControl>
                      <Button
                        colorScheme="red"
                        size="lg"
                        onClick={() => handleVerifyUser()}
                        isLoading={loading}
                        loadingText={t('verifying')}
                        leftIcon={<Icon as={CheckIcon} w={5} h={5} />}
                        _hover={{
                          transform: 'translateY(-2px)',
                          boxShadow: 'lg',
                        }}
                        aria-label={t('verifyInstitution')}
                      >
                        {t('verifyInstitution')}
                      </Button>
                      {verificationProgress > 0 && (
                        <Progress
                          value={verificationProgress}
                          size="xs"
                          colorScheme="red"
                          borderRadius="full"
                          isAnimated
                          hasStripe
                          aria-valuemin={0}
                          aria-valuemax={100}
                          aria-valuenow={verificationProgress}
                        />
                      )}
                    </VStack>
                  </Box>

                  <Divider my={6} />

                  {/* Verified Institutions */}
                  <Box
                    bg={cardBg}
                    borderRadius="xl"
                    shadow="xl"
                    overflow="hidden"
                    borderWidth="1px"
                    borderColor={borderColor}
                    ref={verifiedInstitutionsRef}
                    p={6}
                  >
                    <Heading size="md" mb={4}>
                      {t('verifiedInstitutions')}
                    </Heading>
                    <InstitutionsTable institutions={verifiedInstitutions} isLoading={isLoading} />
                  </Box>

                  {/* Pending Institutions */}
                  <Box
                    bg={cardBg}
                    borderRadius="xl"
                    shadow="xl"
                    overflow="hidden"
                    borderWidth="1px"
                    borderColor={borderColor}
                    ref={pendingInstitutionsRef}
                    p={6}
                    mt={6}
                  >
                    <Heading size="md" mb={4}>
                      {t('pendingInstitutions')}
                    </Heading>
                    <InstitutionsTable
                      institutions={pendingInstitutions}
                      onVerify={handleVerifyUser}
                      isLoading={isLoading}
                    />
                  </Box>
                </ScaleFade>
              </VStack>
            </GridItem>
          </Grid>
        </Container>

        {/* Scroll to Top Button */}
        <IconButton
          aria-label={t('scrollToTop')}
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
};

export default AdminDashboard;