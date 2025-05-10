import React, { useEffect, useState, useCallback, useMemo, useRef, use } from 'react';
import {
  Box,
  Container,
  Flex,
  Heading,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  useColorModeValue,
  VStack,
  HStack,
  Icon,
  Button,
  Center,
  Spinner,
  useDisclosure,
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Divider,
  Badge,
  useToast,
  SimpleGrid,
  InputGroup,
  InputLeftElement,
  Input,
  IconButton,
  Tooltip,
  useBreakpointValue,
  Portal,
  ScaleFade,
  useDisclosure as useNotificationDisclosure,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useMediaQuery,
  Progress,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  CloseButton
} from '@chakra-ui/react';
import { keyframes } from '@emotion/react';
import { FaGraduationCap, FaCertificate, FaChartBar, FaSignOutAlt, FaUser, FaBell, FaUniversity, FaSearch, FaCog, FaQuestionCircle } from 'react-icons/fa';
import { ExamManagement } from '../../components/institution/ExamManagement';
import { CertificateManagement } from '../../components/institution/CertificateManagement';
import { ExamResults } from '../../components/institution/ExamResults';
import { useInstitution } from '../../hooks/useInstitution';
import { Institution, Student } from '../../types/institution';
import { Certificate } from '../../types/certificate';
import { Exam, ExamResult, ExamStatistics, NewExam } from '../../types/examManagement';
import { useRouter } from 'next/router';
import InstitutionProfile, { InstitutionData } from '../../components/institution/InstitutionProfile';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { RiDashboardLine, RiNotification3Line, RiSettings4Line } from 'react-icons/ri';
import { BsArrowUpCircle } from 'react-icons/bs';
import { Connector, useAccount, useConnect } from 'wagmi';
import { validateNetwork, EXPECTED_NETWORK, getSigner, getProvider } from '../../utils/ethersConfig';
import { ethers } from 'ethers';
import Layout from '../../components/layout/Layout';
import { getIdentityContract } from 'services/identity';
import { useContract } from 'hooks/useContract';

const MotionBox = motion(Box);
const MotionFlex = motion(Flex);

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const slideIn = keyframes`
  from { transform: translateY(-10px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
`;

const pulseAnimation = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const floatAnimation = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
`;

// Types
type ConnectWalletProps = {
  connect: (args: { connector: Connector }) => void | Promise<void>;
  connectors: readonly Connector[];
};

// Loading component with network check
const LoadingScreen = ({ isConnected }: { isConnected: boolean }) => {
  const [message, setMessage] = useState<string>('جاري التحقق من الاتصال... | Checking connection...');

  useEffect(() => {
    setMessage(isConnected
      ? 'جاري التحقق من بيانات المؤسسة... | Checking institution data...'
      : 'جاري التحقق من الاتصال... | Checking connection...'
    );
  }, [isConnected]);

  return (
    <Center minH="100vh" bg="gray.50">
      <VStack spacing={4}>
        <Spinner size="xl" color="blue.500" thickness="4px" />
        <Text fontSize="lg" color="gray.600">جاري التحقق من الصلاحيات... | Verifying access...</Text>
        <Text fontSize="sm" color="gray.500">
          {message}
        </Text>
      </VStack>
    </Center>
  );
};

// Connection component with explicit types and null checks
const ConnectWallet = ({ connect, connectors }: ConnectWalletProps) => {
  const toast = useToast();
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async () => {
    const firstConnector = connectors[0];
    if (firstConnector) {
      try {
        setIsConnecting(true);
        await connect({ connector: firstConnector });
      } catch (error: any) {
        toast({
          title: 'خطأ في الاتصال | Connection Error',
          description: error.message,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setIsConnecting(false);
      }
    }
  };

  return (
    <Center minH="100vh" bg="gray.50">
      <VStack spacing={6} p={8} bg="white" rounded="xl" shadow="lg" maxW="md" w="full">
        <Icon as={FaUniversity} w={12} h={12} color="blue.500" />
        <Heading size="lg" textAlign="center" mb={2}>
          لوحة تحكم المؤسسة | Institution Dashboard
        </Heading>
        <Text textAlign="center" color="gray.600" mb={4}>
          يرجى توصيل المحفظة للمتابعة | Please connect your wallet to continue
        </Text>
        <Button
          onClick={handleConnect}
          colorScheme="blue"
          size="lg"
          width="full"
          isLoading={isConnecting}
          loadingText="جاري الاتصال... | Connecting..."
          leftIcon={<Icon as={FaUser} />}
          isDisabled={!connectors[0]}
        >
          توصيل المحفظة | Connect Wallet
        </Button>
      </VStack>
    </Center>
  );
};

const InstitutionDashboard = () => {
  // 1. Color mode values - ALL useColorModeValue hooks MUST be at the top
  const bgColor = useColorModeValue('gray.50', 'gray.800');
  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const headerBg = useColorModeValue('white', 'gray.800');
  const statBg = useColorModeValue('white', 'gray.700');
  const glassHeaderBg = useColorModeValue('rgba(255, 255, 255, 0.8)', 'rgba(26, 32, 44, 0.8)');
  const glassHeaderHoverBg = useColorModeValue('rgba(255, 255, 255, 0.9)', 'rgba(26, 32, 44, 0.9)');
  const searchBg = useColorModeValue('gray.100', 'gray.700');
  const searchHoverBg = useColorModeValue('gray.200', 'gray.600');
  const menuListBg = useColorModeValue('white', 'gray.800');
  const tabListBg = useColorModeValue('gray.50', 'gray.700');
  const tabHoverBg = useColorModeValue('gray.100', 'gray.600');
  const drawerContentBg = useColorModeValue('rgba(255, 255, 255, 0.9)', 'rgba(45, 55, 72, 0.9)');
  const notificationBg = useColorModeValue('gray.50', 'gray.700');
  const statCardBg = useColorModeValue('rgba(255, 255, 255, 0.8)', 'rgba(45, 55, 72, 0.8)');
  const mainContentBg = useColorModeValue('rgba(255, 255, 255, 0.8)', 'rgba(45, 55, 72, 0.8)');
  const tabSelectedBg = useColorModeValue('white', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'white');
  const subTextColor = useColorModeValue('gray.600', 'gray.300');
  const iconColor = useColorModeValue('gray.600', 'gray.400');
  const pageName = 'لوحة تحكم المؤسسة | Institution Dashboard';

  // 2. External hooks
  const { address = undefined, isConnected: isWalletConnected = false } = useAccount() || {};
  const router = useRouter();
  const toast = useToast();
  const [isLargerThan768] = useMediaQuery("(min-width: 768px)");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [networkError, setNetworkError] = useState<string | null>(null);

  // 3. Get all values from useInstitution hook
  const {
    isLoading,
    certificatesData = [],
    error: institutionError,
    exams,
    createExam,
    updateExamStatus,
    registerStudents,
    selectedExamResults,
    examStatistics,
    handleSubmitResults,
    loadExamResults,
    issueCertificate,
  } = useInstitution();

  // 4. State hooks
  const [selectedExamId, setSelectedExamId] = useState<string | null>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const { isOpen: isNotificationsOpen, onOpen: onNotificationsOpen, onClose: onNotificationsClose } = useNotificationDisclosure();
  const [identityContract, setIdentityContract] = useState<any>(null);

  // 5. Effect hooks
  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const progress = (window.scrollY / totalScroll) * 100;
      setScrollProgress(progress);
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const checkNetwork = async () => {
      try {
        setLoading(true);
        const provider = await getProvider();
        const jsonRpcProvider = new ethers.JsonRpcProvider(EXPECTED_NETWORK.rpcUrl);
        await validateNetwork(jsonRpcProvider);
        setNetworkError(null);
      } catch (error: any) {
        console.error('Network error:', error);
        setNetworkError(error.message);
        // Show toast for network error
        toast({
          title: 'خطأ في الشبكة | Network Error',
          description: error.message,
          status: 'error',
          duration: null,
          isClosable: true,
          position: 'top',
        });
      } finally {
        setLoading(false);
      }
    };

    if (isWalletConnected) {
      checkNetwork();
    }
  }, [isWalletConnected, toast]);

  useEffect(() => {
    const initContract = async () => {
      try {
        const signer = await getSigner();
        const identityContract = await getIdentityContract(signer);
        setIdentityContract(identityContract);
      } catch (error: any) {
        console.error('Error initializing contract:', error);
        toast({
          title: 'خطأ في تهيئة العقد | Contract initialization error',
          description: error.message,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    };

    if (isWalletConnected && !networkError) {
      initContract();
    }
  }, [isWalletConnected, networkError, toast]);

  // 6. Memoized values
  const notificationVariants = useMemo(() => ({
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  }), []);

  const statsData = useMemo(() => [
    {
      label: 'إجمالي الاختبارات | Total Exams',
      value: exams?.length || '0',
      icon: FaGraduationCap,
      color: 'blue.500'
    },
    {
      label: 'الشهادات المصدرة | Issued Certificates',
      value: certificatesData?.length || '0',
      icon: FaCertificate,
      color: 'green.500'
    },
    {
      label: 'معدل النجاح | Success Rate',
      value: examStatistics ? `${Math.round(examStatistics.passRate)}%` : '0%',
      icon: FaChartBar,
      color: 'purple.500'
    },
  ], [exams?.length, certificatesData?.length, examStatistics]);

  // 7. Event handlers
  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  if (loading || isLoading) {
    return (
      <Container centerContent py={10}>
        <Spinner size="xl" />
        <Text mt={4}>جاري التحميل... | Loading...</Text>
      </Container>
    );
  }

  if (networkError) {
    return (
      <Container maxW="container.md" centerContent py={10}>
        <Alert
          status="error"
          variant="solid"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          textAlign="center"
          borderRadius="xl"
          p={8}
        >
          <AlertIcon boxSize="40px" mr={0} />
          <AlertTitle mt={4} mb={1} fontSize="lg">
            شبكة غير صحيحة | Wrong Network
          </AlertTitle>
          <AlertDescription maxWidth="sm">
            {networkError}
          </AlertDescription>
          <Button
            mt={4}
            colorScheme="blue"
            onClick={() => {
              setNetworkError(null);
              window.location.reload();
            }}
          >
            إعادة المحاولة | Retry
          </Button>
        </Alert>
      </Container>
    );
  }

  if (institutionError) {
    return (
      <Container centerContent py={10}>
        <Alert status="error">
          <AlertIcon />
          <Box flex="1">
            <AlertTitle>غير مصرح | Unauthorized</AlertTitle>
            <AlertDescription display="block">
              عذراً، هذا الحساب غير مصرح له بالوصول | Sorry, this account is not authorized to access
            </AlertDescription>
          </Box>
          <CloseButton
            position="absolute"
            right="8px"
            top="8px"
            onClick={() => setError(null)}
          />
        </Alert>
        <Button
          mt={4}
          colorScheme="blue"
          onClick={() => router.push('/')}
        >
          العودة للرئيسية | Return to Home
        </Button>
      </Container>
    );
  }

  return (
    <Layout
      address={address}
      exams={exams}
      onNotificationsOpen={onNotificationsOpen}
      pageName={pageName}
    >
      <Box minH="100vh" bg={bgColor}>
        {/* Gradient Overlay */}
        <Box
          position="fixed"
          top={0}
          left={0}
          right={0}
          h="200px"
          bgGradient="linear(to-b, blue.500, transparent)"
          opacity={0.05}
          pointerEvents="none"
          zIndex={1}
        />

        {/* Progress Bar with Gradient */}
        <Box
          position="fixed"
          top={0}
          left={0}
          right={0}
          h="2px"
          zIndex={100}
        >
          <Progress
            value={scrollProgress}
            size="xs"
            bgGradient="linear(to-r, blue.400, purple.500, pink.500)"
            sx={{
              "& > div:first-of-type": {
                transition: "all 0.3s ease-out",
                background: "linear-gradient(to right, #3182ce, #805ad5, #d53f8c)"
              }
            }}
          />
        </Box>

        <Container maxW="container.xl" py={8}>
          {/* Stats Section with Enhanced Animation */}
          <SimpleGrid
            columns={{ base: 1, md: 3 }}
            spacing={6}
            mb={8}
          >
            {statsData.map((stat, index) => (
              <MotionBox
                key={index}
                whileHover={{
                  y: -8,
                  boxShadow: '2xl',
                  scale: 1.02
                }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 20,
                  delay: index * 0.1
                }}
              >
                <Box
                  bg={statCardBg}
                  backdropFilter="blur(8px)"
                  p={6}
                  borderRadius="2xl"
                  border="1px"
                  borderColor={borderColor}
                  position="relative"
                  overflow="hidden"
                  transition="all 0.3s ease"
                >
                  {/* Gradient Background */}
                  <Box
                    position="absolute"
                    top={0}
                    left={0}
                    right={0}
                    bottom={0}
                    bgGradient={`linear(to-br, ${stat.color}10, transparent)`}
                    opacity={0.5}
                  />

                  {/* Animated Border */}
                  <Box
                    position="absolute"
                    top={0}
                    left={0}
                    right={0}
                    h="4px"
                    bgGradient={`linear(to-r, transparent, ${stat.color}, transparent)`}
                    sx={{
                      animation: `${pulseAnimation} 2s ease-in-out infinite`
                    }}
                  />

                  <VStack spacing={4} align="start" position="relative">
                    <Icon
                      as={stat.icon}
                      boxSize={10}
                      color={stat.color}
                      filter="drop-shadow(0px 2px 4px rgba(0,0,0,0.2))"
                      sx={{
                        animation: `${floatAnimation} 3s ease-in-out infinite`
                      }}
                    />
                    <Text
                      fontSize="4xl"
                      fontWeight="bold"
                      bgGradient={`linear(to-r, ${stat.color}, ${stat.color})`}
                      bgClip="text"
                      sx={{
                        animation: `${pulseAnimation} 2s ease-in-out infinite`
                      }}
                    >
                      {stat.value}
                    </Text>
                    <Text
                      color="gray.500"
                      fontSize="lg"
                      fontWeight="medium"
                    >
                      {stat.label}
                    </Text>
                  </VStack>
                </Box>
              </MotionBox>
            ))}
          </SimpleGrid>

          {/* Main Content with Enhanced Animation */}
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.5,
              delay: 0.4,
              type: "spring",
              stiffness: 100
            }}
          >
            <Box
              bg={mainContentBg}
              backdropFilter="blur(8px)"
              borderRadius="2xl"
              border="1px"
              borderColor={borderColor}
              overflow="hidden"
              shadow="xl"
              position="relative"
              transition="all 0.3s ease"
              _hover={{
                shadow: "2xl",
                transform: "translateY(-2px)"
              }}
            >
              <Tabs isFitted variant="enclosed">
                <TabList
                  bg={tabListBg}
                  px={4}
                  position="relative"
                  zIndex={1}
                >
                  {[
                    // {
                    //   icon: FaUniversity,
                    //   text: "الملف الشخصي | Profile",
                    //   color: 'blue'
                    // },
                    {
                      icon: FaGraduationCap,
                      text: "الاختبارات | Exams",
                      color: 'green'
                    },
                    {
                      icon: FaChartBar,
                      text: "النتائج | Results",
                      color: 'purple'
                    },
                    {
                      icon: FaCertificate,
                      text: "الشهادات | Certificates",
                      color: 'orange'
                    }
                  ].map((tab, index) => (
                    <Tab
                      key={index}
                      py={4}
                      _selected={{
                        color: `${tab.color}.500`,
                        borderColor: `${tab.color}.500`,
                        bg: cardBg,
                        fontWeight: 'bold'
                      }}
                      _hover={{
                        bg: tabHoverBg,
                        color: `${tab.color}.400`
                      }}
                      transition="all 0.2s"
                    >
                      <HStack spacing={2}>
                        <Icon as={tab.icon} />
                        <Text>{tab.text}</Text>
                      </HStack>
                    </Tab>
                  ))}
                </TabList>

                <TabPanels>
                  <TabPanel>
                    <ExamManagement
                      exams={exams?.map(exam => ({
                        ...exam,
                        date: typeof exam.date === 'number' ? new Date(exam.date) : exam.date
                      })) || []}
                      onCreateExam={createExam}
                      onUpdateStatus={updateExamStatus}
                      onRegisterStudents={registerStudents}
                      loading={isLoading}
                    />
                  </TabPanel>
                  <TabPanel>
                    <ExamResults
                      exams={exams?.map(exam => ({
                        ...exam,
                        date: typeof exam.date === 'number' ? new Date(exam.date) : exam.date
                      })) || []}
                      selectedExamId={selectedExamId}
                      onSelectExam={(examId) => {
                        setSelectedExamId(examId);
                        loadExamResults(examId);
                      }}
                      results={selectedExamResults}
                      statistics={examStatistics}
                      onSubmitResults={handleSubmitResults}
                      loading={isLoading}
                    />
                  </TabPanel>
                  <TabPanel>
                    <CertificateManagement
                      certificates={Array.isArray(certificatesData) ? certificatesData?.map((cert: Certificate) => ({
                        ...cert,
                        studentAddress: cert.studentAddress,
                        issueDate: cert.issueDate || new Date().toISOString(),
                        status: cert.status || 'issued'
                      })) ?? [] : []}
                      onIssueCertificate={async (studentAddress, certificate) => {
                        try {
                          await issueCertificate(studentAddress, certificate);
                          return true;
                        } catch (error) {
                          console.error('Error issuing certificate:', error);
                          return false;
                        }
                      }}
                      loading={isLoading}
                    />
                  </TabPanel>
                </TabPanels>
              </Tabs>
            </Box>
          </MotionBox>
        </Container>

        {/* Scroll to Top Button */}
        <AnimatePresence>
          {showScrollTop && (
            <MotionBox
              position="fixed"
              bottom="20px"
              right="20px"
              zIndex={99}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.2 }}
            >
              <IconButton
                aria-label="Scroll to top"
                icon={<BsArrowUpCircle />}
                onClick={scrollToTop}
                size="lg"
                colorScheme="blue"
                rounded="full"
                shadow="lg"
                _hover={{
                  transform: "translateY(-2px)",
                  shadow: "xl",
                }}
                sx={{
                  animation: `${floatAnimation} 2s ease-in-out infinite`
                }}
              />
            </MotionBox>
          )}
        </AnimatePresence>

        {/* Enhanced Notifications Drawer */}
        <Drawer
          isOpen={isNotificationsOpen}
          placement={isLargerThan768 ? "right" : "bottom"}
          onClose={onNotificationsClose}
        >
          <DrawerOverlay backdropFilter="blur(10px)" />
          <DrawerContent
            bg={drawerContentBg}
            backdropFilter="blur(10px)"
          >
            <DrawerHeader
              borderBottomWidth="1px"
              bgGradient="linear(to-r, blue.400, purple.500)"
              color="white"
            >
              <HStack spacing={2}>
                <RiNotification3Line />
                <Text>الإشعارات | Notifications</Text>
              </HStack>
            </DrawerHeader>
            <DrawerBody>
              <AnimatePresence>
                {exams?.filter(exam => exam.status === 'pending').map(exam => (
                  <MotionBox
                    key={exam.address}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    variants={notificationVariants}
                    transition={{ duration: 0.2 }}
                  >
                    <Box
                      p={4}
                      mb={4}
                      bg={notificationBg}
                      borderRadius="lg"
                      borderLeft="4px"
                      borderLeftColor="orange.400"
                      _hover={{
                        transform: 'translateX(-4px)',
                        shadow: 'md'
                      }}
                      transition="all 0.2s"
                    >
                      <VStack align="start" spacing={1}>
                        <Text fontWeight="bold">{exam.title}</Text>
                        <Text fontSize="sm" color="gray.500">
                          بانتظار الموافقة | Pending Approval
                        </Text>
                        <Text fontSize="xs" color="gray.400">
                          {new Date(exam.date).toLocaleDateString()}
                        </Text>
                      </VStack>
                    </Box>
                  </MotionBox>
                ))}
              </AnimatePresence>
            </DrawerBody>
          </DrawerContent>
        </Drawer>
      </Box>
    </Layout>
  );
};

export default InstitutionDashboard;