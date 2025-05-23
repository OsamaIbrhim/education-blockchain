import { useState, useEffect } from 'react';
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
  Fade,
  ScaleFade,
  Skeleton,
  Alert,
  AlertIcon,
  Link,
  FormHelperText,
} from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { verifyCertificate } from 'services/certificate';
import { getUserRole } from 'services/identity';
import { connectWallet } from '../../utils/web3Provider';
import LogoutButton from '../../components/common/ui/LogoutButton';
import {
  UserIcon,
  BriefcaseIcon,
  CertificateIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  InfoIcon,
  SearchIcon,
  ActivityIcon,
  CalendarIcon,
} from '../../components/common/icons/Icons';

interface CertificateDetails {
  id: string;
  institution: string;
  student: string;
  timestamp: string;
  isValid: boolean;
  ipfsHash: string;
}

export default function EmployerDashboard() {
  const [account, setAccount] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [certificateId, setCertificateId] = useState('');
  const [verifiedCertificates, setVerifiedCertificates] = useState<CertificateDetails[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isFirstVisit, setIsFirstVisit] = useState(true);
  const [verificationProgress, setVerificationProgress] = useState(0);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const router = useRouter();
  const toast = useToast();

  // Colors
  const bgGradient = useColorModeValue(
    'linear-gradient(120deg, purple.500 0%, purple.700 100%)',
    'linear-gradient(120deg, purple.700 0%, purple.900 100%)'
  );
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('purple.100', 'purple.700');
  const textColor = useColorModeValue('gray.800', 'white');
  const mutedTextColor = useColorModeValue('gray.600', 'gray.400');

  useEffect(() => {
    checkAccess();
    // Show tutorial for first-time visitors
    const hasVisited = localStorage.getItem('hasVisitedEmployerDashboard');
    if (!hasVisited) {
      onOpen();
      localStorage.setItem('hasVisitedEmployerDashboard', 'true');
    }
  }, []);

  const checkAccess = async () => {
    try {
      setLoading(true);
      if (typeof window === 'undefined' || !window.ethereum) {
        throw new Error('MetaMask غير مثبت - MetaMask is not installed');
      }

      const accounts = await connectWallet();
      if (!accounts || accounts.length === 0) {
        throw new Error('لم يتم توصيل المحفظة - No account connected');
      }

      const address = accounts[0];
      setAccount(address);

      const role = await getUserRole(address);
      if (role !== 'employer') {
        toast({
          title: 'خطأ في الوصول - Access Denied',
          description: 'هذه الصفحة لأصحاب العمل فقط - This page is for employers only',
          status: 'error',
          duration: 5000,
          isClosable: true,
          position: 'top',
        });
        router.push('/');
        return;
      }
    } catch (error: any) {
      console.error('Error in checkAccess:', error);
      setError(error.message || 'حدث خطأ - An error occurred');
      router.push('/');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCertificate = async () => {
    if (!certificateId) {
      toast({
        title: 'خطأ - Error',
        description: 'يرجى إدخال معرف الشهادة - Please enter certificate ID',
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

      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setVerificationProgress(prev => Math.min(prev + 15, 90));
      }, 500);

      const certificateDetails = await verifyCertificate(certificateId);
      
      if (certificateDetails) {
        const certificate: CertificateDetails = {
          id: certificateId,
          institution: certificateDetails.institution,
          student: certificateDetails.student,
          timestamp: certificateDetails.issuedAt.toString(),
          isValid: certificateDetails.isValid,
          ipfsHash: certificateDetails.ipfsHash
        };

        setVerifiedCertificates(prev => [certificate, ...prev]);
        setCertificateId('');

        toast({
          title: 'نجاح - Success',
          description: certificateDetails.isValid ? 
            'الشهادة صالحة وموثقة - Certificate is valid and verified' : 
            'الشهادة غير صالحة - Certificate is invalid',
          status: certificateDetails.isValid ? 'success' : 'warning',
          duration: 5000,
          isClosable: true,
          position: 'top-right',
        });
      } else {
        throw new Error('لم يتم العثور على الشهادة - Certificate not found');
      }

      clearInterval(progressInterval);
      setVerificationProgress(100);
      
      // Reset progress after completion
      setTimeout(() => {
        setVerificationProgress(0);
      }, 1000);

    } catch (error: any) {
      console.error('Error verifying certificate:', error);
      toast({
        title: 'خطأ - Error',
        description: error.message || 'فشل في التحقق من الشهادة - Failed to verify certificate',
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'top',
      });
    } finally {
      setLoading(false);
    }
  };

  // Tutorial Modal
  const TutorialModal = () => (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>مرحباً بك في لوحة تحكم جهة التوظيف - Welcome to Employer Dashboard</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <VStack spacing={4} align="stretch">
            <Text>
              🔍 للتحقق من شهادة:
              <br />
              1. أدخل معرف الشهادة في حقل البحث
              <br />
              2. اضغط على زر "تحقق من الشهادة"
              <br />
              3. انتظر نتيجة التحقق
            </Text>
            <Text>
              To verify a certificate:
              <br />
              1. Enter the certificate ID in the search field
              <br />
              2. Click "Verify Certificate"
              <br />
              3. Wait for verification result
            </Text>
            <Button colorScheme="purple" onClick={onClose}>
              فهمت - Got it!
            </Button>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );

  if (loading) {
    return (
      <Center h="100vh" bg={useColorModeValue('gray.50', 'gray.900')}>
        <VStack spacing={4}>
          <Spinner size="xl" color="purple.500" thickness="4px" speed="0.65s" />
          <Text fontSize="lg">جاري التحميل... - Loading...</Text>
          <Progress
            size="xs"
            isIndeterminate
            width="200px"
            colorScheme="purple"
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
              colorScheme="blue"
              size="lg"
              onClick={checkAccess}
              mt={4}
            >
              <ActivityIcon mr={2} />
              إعادة المحاولة - Retry
            </Button>
          </Alert>
        </ScaleFade>
      </Center>
    );
  }

  return (
    <Box minH="100vh" bg={useColorModeValue('gray.50', 'gray.900')}>
      <TutorialModal />
      
      {/* Enhanced Header with Animation */}
      <Box 
        bgGradient={bgGradient}
        color="white"
        py={8}
        px={4}
        mb={8}
        shadow="xl"
        position="relative"
        overflow="hidden"
      >
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          opacity={0.1}
          bgGradient="linear(to-r, transparent 0%, white 50%, transparent 100%)"
          transform="skewY(-12deg)"
          transformOrigin="top right"
        />
        <Container maxW="container.xl">
          <ScaleFade initialScale={0.9} in={true}>
            <VStack spacing={4} align="center">
              <Heading 
                size="xl" 
                bgGradient="linear(to-r, white, purple.100)" 
                bgClip="text"
                letterSpacing="tight"
              >
                لوحة تحكم جهة التوظيف
              </Heading>
              <Heading size="md" fontWeight="normal" opacity={0.9}>
                Employer Dashboard
              </Heading>
              <Text fontSize="lg" textAlign="center" maxW="2xl" opacity={0.8}>
                التحقق من صحة الشهادات الأكاديمية بكل سهولة وموثوقية
                <br />
                Verify Academic Certificates with Ease and Reliability
              </Text>
            </VStack>
          </ScaleFade>
        </Container>
      </Box>

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
                    bgGradient="linear(to-r, purple.400, purple.600)"
                  />
                  <VStack spacing={4} align="stretch">
                    <HStack>
                      <UserIcon color="purple.500" />
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
                      <Badge colorScheme="blue" px={3} py={1} borderRadius="full">
                        <BriefcaseIcon mr={2} />
                        جهة توظيف - Employer
                      </Badge>
                    </Tooltip>
                  </VStack>
                </Box>
              </ScaleFade>

              {/* System Info Box with Icons */}
              <ScaleFade initialScale={0.9} in={true} delay={0.1}>
                <Box
                  bg={useColorModeValue('purple.50', 'purple.900')}
                  p={6}
                  borderRadius="xl"
                  shadow="md"
                  transition="transform 0.2s"
                  _hover={{ transform: 'translateY(-2px)' }}
                >
                  <VStack spacing={3} align="start">
                    <HStack>
                      <CertificateIcon color="blue.500" />
                      <Heading size="sm" color={useColorModeValue('blue.600', 'blue.200')}>
                        مميزات النظام - System Features
                      </Heading>
                    </HStack>
                    <VStack spacing={3} align="start" pl={6}>
                      <HStack>
                        <CheckCircleIcon color="green.500" />
                        <Text fontSize="sm" color={mutedTextColor}>
                          التحقق من صحة الشهادات
                          <br />
                          Verify Certificate Authenticity
                        </Text>
                      </HStack>
                      <HStack>
                        <SearchIcon color="blue.500" />
                        <Text fontSize="sm" color={mutedTextColor}>
                          عرض تفاصيل الشهادات
                          <br />
                          View Certificate Details
                        </Text>
                      </HStack>
                      <HStack>
                        <CalendarIcon color="orange.500" />
                        <Text fontSize="sm" color={mutedTextColor}>
                          سجل التحقق من الشهادات
                          <br />
                          Verification History
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
              <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
                <Fade in={true} delay={0.1}>
                  <Box
                    bg={cardBg}
                    p={6}
                    borderRadius="xl"
                    shadow="lg"
                    position="relative"
                    overflow="hidden"
                    transition="all 0.2s"
                    _hover={{ 
                      transform: 'translateY(-4px)',
                      shadow: '2xl',
                      borderColor: 'purple.400'
                    }}
                    borderWidth="1px"
                    borderColor={borderColor}
                  >
                    <Box
                      position="absolute"
                      top={0}
                      left={0}
                      right={0}
                      h="4px"
                      bgGradient="linear(to-r, purple.400, purple.600)"
                    />
                    <Stat textAlign="center">
                      <StatLabel fontSize="lg" color={mutedTextColor}>
                        إجمالي عمليات التحقق
                      </StatLabel>
                      <StatNumber 
                        fontSize="4xl"
                        color={useColorModeValue('purple.600', 'purple.300')}
                        fontWeight="bold"
                      >
                        {verifiedCertificates.length}
                      </StatNumber>
                      <StatHelpText color={mutedTextColor}>
                        Total Verifications
                      </StatHelpText>
                    </Stat>
                  </Box>
                </Fade>

                <Fade in={true} delay={0.2}>
                  <Box
                    bg={cardBg}
                    p={6}
                    borderRadius="xl"
                    shadow="lg"
                    position="relative"
                    overflow="hidden"
                    transition="all 0.2s"
                    _hover={{ 
                      transform: 'translateY(-4px)',
                      shadow: '2xl',
                      borderColor: 'green.400'
                    }}
                    borderWidth="1px"
                    borderColor={borderColor}
                  >
                    <Box
                      position="absolute"
                      top={0}
                      left={0}
                      right={0}
                      h="4px"
                      bgGradient="linear(to-r, green.400, green.600)"
                    />
                    <Stat textAlign="center">
                      <StatLabel fontSize="lg" color={mutedTextColor}>
                        الشهادات الصالحة
                      </StatLabel>
                      <StatNumber 
                        fontSize="4xl"
                        color={useColorModeValue('green.600', 'green.300')}
                        fontWeight="bold"
                      >
                        {verifiedCertificates.filter(cert => cert.isValid).length}
                      </StatNumber>
                      <StatHelpText color={mutedTextColor}>
                        Valid Certificates
                      </StatHelpText>
                    </Stat>
                  </Box>
                </Fade>

                <Fade in={true} delay={0.3}>
                  <Box
                    bg={cardBg}
                    p={6}
                    borderRadius="xl"
                    shadow="lg"
                    position="relative"
                    overflow="hidden"
                    transition="all 0.2s"
                    _hover={{ 
                      transform: 'translateY(-4px)',
                      shadow: '2xl',
                      borderColor: 'red.400'
                    }}
                    borderWidth="1px"
                    borderColor={borderColor}
                  >
                    <Box
                      position="absolute"
                      top={0}
                      left={0}
                      right={0}
                      h="4px"
                      bgGradient="linear(to-r, red.400, red.600)"
                    />
                    <Stat textAlign="center">
                      <StatLabel fontSize="lg" color={mutedTextColor}>
                        الشهادات غير الصالحة
                      </StatLabel>
                      <StatNumber 
                        fontSize="4xl"
                        color={useColorModeValue('red.600', 'red.300')}
                        fontWeight="bold"
                      >
                        {verifiedCertificates.filter(cert => !cert.isValid).length}
                      </StatNumber>
                      <StatHelpText color={mutedTextColor}>
                        Invalid Certificates
                      </StatHelpText>
                    </Stat>
                  </Box>
                </Fade>
              </SimpleGrid>

              {/* Enhanced Certificate Verification with Progress Bar */}
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
                        التحقق من شهادة - Verify Certificate
                      </Heading>
                      <Text color={mutedTextColor}>
                        أدخل معرف الشهادة للتحقق من صحتها
                        <br />
                        Enter the certificate ID to verify its authenticity
                      </Text>
                      <FormControl>
                        <FormLabel fontWeight="bold">معرف الشهادة - Certificate ID</FormLabel>
                        <Input
                          value={certificateId}
                          onChange={(e) => setCertificateId(e.target.value)}
                          placeholder="أدخل معرف الشهادة - Enter certificate ID"
                          size="lg"
                          bg={useColorModeValue('white', 'gray.700')}
                          _focus={{
                            borderColor: "purple.400",
                            boxShadow: "0 0 0 1px purple.400"
                          }}
                        />
                      </FormControl>
                      <Button
                        leftIcon={<SearchIcon />}
                        colorScheme="blue"
                        onClick={handleVerifyCertificate}
                        isLoading={loading}
                        loadingText="جاري التحقق... - Verifying..."
                        _hover={{
                          transform: 'translateY(-2px)',
                          boxShadow: 'lg',
                        }}
                      >
                        تحقق - Verify
                      </Button>
                      {verificationProgress > 0 && (
                        <Progress
                          value={verificationProgress}
                          size="xs"
                          colorScheme="purple"
                          borderRadius="full"
                          isAnimated
                          hasStripe
                        />
                      )}
                    </VStack>
                  </Box>

                  <Divider />

                  <Box p={6}>
                    <VStack spacing={4} align="stretch">
                      <Heading size="md" color={textColor}>
                        سجل التحقق - Verification History
                      </Heading>
                      <Box overflowX="auto">
                        {verifiedCertificates.length === 0 ? (
                          <Center p={8}>
                            <VStack spacing={3}>
                              <InfoIcon boxSize="40px" color="purple.500" />
                              <Text fontSize="lg">لم يتم التحقق من أي شهادات بعد</Text>
                              <Text color={mutedTextColor}>
                                No certificates verified yet
                              </Text>
                            </VStack>
                          </Center>
                        ) : (
                          <Table variant="simple">
                            <Thead bg={useColorModeValue('gray.50', 'gray.700')}>
                              <Tr>
                                <Th>معرف الشهادة - Certificate ID</Th>
                                <Th>المؤسسة - Institution</Th>
                                <Th>الطالب - Student</Th>
                                <Th>الحالة - Status</Th>
                              </Tr>
                            </Thead>
                            <Tbody>
                              {verifiedCertificates.map((cert, index) => (
                                <Tr 
                                  key={index}
                                  _hover={{
                                    bg: useColorModeValue('gray.50', 'gray.700'),
                                    transition: 'all 0.2s'
                                  }}
                                >
                                  <Td fontSize="sm">
                                    <Link color="purple.500" href={`/certificate/${cert.id}`}>
                                      {cert.id}
                                    </Link>
                                  </Td>
                                  <Td fontSize="sm">{cert.institution}</Td>
                                  <Td fontSize="sm">{cert.student}</Td>
                                  <Td>
                                    <Badge
                                      colorScheme={cert.isValid ? 'green' : 'red'}
                                      variant="subtle"
                                      px={3}
                                      py={1}
                                      borderRadius="full"
                                    >
                                      {cert.isValid ? (
                                        <>
                                          <CheckCircleIcon mr={2} color="green.500" />
                                          صالحة - Valid
                                        </>
                                      ) : (
                                        <>
                                          <AlertCircleIcon mr={2} color="red.500" />
                                          غير صالحة - Invalid
                                        </>
                                      )}
                                    </Badge>
                                  </Td>
                                </Tr>
                              ))}
                            </Tbody>
                          </Table>
                        )}
                      </Box>
                    </VStack>
                  </Box>
                </Box>
              </ScaleFade>
            </VStack>
          </GridItem>
        </Grid>
      </Container>

      {/* Enhanced Footer with Social Links */}
      <Box
        position="fixed"
        bottom="0"
        left="0"
        right="0"
        bg={cardBg}
        borderTop="1px solid"
        borderColor={borderColor}
        py={4}
        px={8}
        shadow="lg"
        zIndex={999}
      >
        <Container maxW="container.xl">
          <HStack justify="space-between" align="center">
            <HStack spacing={4}>
              <Text fontSize="sm" color={mutedTextColor}>
                نظام الشهادات اللامركزي - Decentralized Certificate System
              </Text>
              <Link href="/about" color="purple.500" fontSize="sm">
                عن النظام - About
              </Link>
              <Link href="/contact" color="purple.500" fontSize="sm">
                تواصل معنا - Contact
              </Link>
            </HStack>
            <LogoutButton />
          </HStack>
        </Container>
      </Box>
    </Box>
  );
} 