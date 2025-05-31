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
  useDisclosure as useNotificationDisclosure,
  ScaleFade,
  Skeleton,
  Alert,
  AlertIcon,
  Link,
  Image,
  FormHelperText,
} from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { getUserCertificates, verifyCertificate } from 'services/certificate';
import { getUserRole } from 'services/identity';
import { connectWallet, requestAccounts } from '../../utils/web3Provider';
import LogoutButton from '../../components/LogoutButton';
import {
  UserIcon,
  GraduateIcon,
  CertificateIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  InfoIcon,
  DownloadIcon,
  SearchIcon,
  ActivityIcon,
  AwardIcon,
  CalendarIcon
} from '../../components/Icons';
import { useAppData } from 'hooks/useAppData';
import { ExamManagement } from 'components/student/ExamManagement';
import { Certificate } from 'components/student/Certificate';
import { Certificate as CertificateType } from 'types/certificate';
import Layout from 'components/layout/Layout';
import { useAccount } from 'wagmi';
import { useLanguage } from 'context/LanguageContext';

export default function StudentDashboard() {
  const {
    account,
    isLoading,
    error,
    exams,
    certificates,
    selectedExamResults,
    examStatistics,
    checkAccess,
  } = useAppData();

    const { isOpen: isNotificationsOpen, onOpen: onNotificationsOpen, onClose: onNotificationsClose } = useNotificationDisclosure();
  const { address = undefined } = useAccount() || {};
  const [isFirstVisit, setIsFirstVisit] = useState(true);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const router = useRouter();
  const toast = useToast();
  const { t, language } = useLanguage();

  const pageName = `${t('studentDashboard')} | Student Dashboard`;

  // Colors
  const bgGradient = useColorModeValue(
    'linear-gradient(120deg, blue.500 0%, blue.700 100%)',
    'linear-gradient(120deg, blue.700 0%, blue.900 100%)'
  );
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('blue.100', 'blue.700');
  const textColor = useColorModeValue('gray.800', 'white');
  const mutedTextColor = useColorModeValue('gray.600', 'gray.400');
  const sidebarBg = useColorModeValue('blue.50', 'blue.900');

  const handleDownload = (cert: CertificateType) => async () => {
    try {
      window.open(`https://ipfs.io/ipfs/${cert.ipfsHash}`, '_blank');
      toast({
        title: 'جاري التحميل - Downloading',
        description: 'تم فتح الشهادة في نافذة جديدة - Certificate opened in new window',
        status: 'success',
        duration: 3000,
        isClosable: true,
        position: 'top',
      });
    } catch (error: any) {
      console.error('Error downloading certificate:', error);
      toast({
        title: 'خطأ في التحميل - Download Error',
        description: error.message || 'فشل في تحميل الشهادة - Failed to download certificate',
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'top',
      });
    }
  };

  // Tutorial Modal
  const TutorialModal = () => (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          {t('welcomeMessage')} - {t('studentDashboard')}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <VStack spacing={4} align="stretch">
            <Text>
              👋 {t('welcomeMessage')}
              <br />
              • {t('certificates')}: {t('viewAcademicCertificates') || 'View all your academic certificates'}
              <br />
              • {t('verify')}: {t('verifyCertificateAuthenticity') || "Verify each certificate's authenticity"}
              <br />
              • {t('download') || 'Download'}: {t('downloadCertificatesPdf') || 'Download certificates in PDF format'}
            </Text>
            <Button colorScheme="blue" onClick={onClose}>
              {t('gotIt')}
            </Button>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );

  if (isLoading) {
    return (
      <Center h="100vh" bg={useColorModeValue('gray.50', 'gray.900')}>
        <VStack spacing={4}>
          <Spinner size="xl" color="blue.500" thickness="4px" speed="0.65s" />
          <Text fontSize="lg">{t('loading')}</Text>
          <Progress
            size="xs"
            isIndeterminate
            width="200px"
            colorScheme="blue"
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
              {t('retry')}
            </Button>
          </Alert>
        </ScaleFade>
      </Center>
    );
  }

  return (
    <Layout
      address={address}
      exams={exams}
      onNotificationsOpen={onNotificationsOpen}
      pageName={pageName}
      allowedValue={'student'}
    >
      <Box minH="100vh" bg={useColorModeValue('gray.50', 'gray.900')}>
        <TutorialModal />

        <Container maxW="container.xl" pb="100px">
          <Grid templateColumns="repeat(12, 1fr)" gap={6}>
            {/* Sidebar */}
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
                      bgGradient="linear(to-r, blue.400, blue.600)"
                    />
                    <VStack spacing={4} align="stretch">
                      <HStack>
                        <UserIcon color="blue.500" />
                        <Text fontWeight="bold" fontSize="sm" color={mutedTextColor}>
                          {t('connectedAccount').toUpperCase()}
                        </Text>
                      </HStack>
                      <Tooltip label={t('walletAddress')} placement="top">
                        <Text fontSize="sm" wordBreak="break-all" color={textColor}>
                          {account}
                        </Text>
                      </Tooltip>
                      <Divider />
                      <Tooltip label={t('userRole')} placement="top">
                        <Badge colorScheme="blue" px={3} py={1} borderRadius="full">
                          <GraduateIcon mr={2} />
                          {t('studentRole')}
                        </Badge>
                      </Tooltip>
                    </VStack>
                  </Box>
                </ScaleFade>

                {/* System Info Box with Icons */}
                <ScaleFade initialScale={0.9} in={true} delay={0.1}>
                  <Box
                    bg={sidebarBg}
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
                          {t('systemFeatures')}
                        </Heading>
                      </HStack>
                      <VStack spacing={3} align="start" pl={6}>
                        <HStack>
                          <AwardIcon color="green.500" />
                          <Text fontSize="sm" color={mutedTextColor}>
                            {t('viewAcademicCertificates') || 'View Academic Certificates'}
                          </Text>
                        </HStack>
                        <HStack>
                          <CheckCircleIcon color="blue.500" />
                          <Text fontSize="sm" color={mutedTextColor}>
                            {t('verifyCertificateAuthenticity') || 'Verify Certificate Authenticity'}
                          </Text>
                        </HStack>
                        <HStack>
                          <CalendarIcon color="orange.500" />
                          <Text fontSize="sm" color={mutedTextColor}>
                            {t('trackIssueDates') || 'Track Issue Dates'}
                          </Text>
                        </HStack>
                      </VStack>
                    </VStack>
                  </Box>
                </ScaleFade>
              </VStack>
            </GridItem>

            {/* Main Content */}
            <GridItem colSpan={{ base: 12, lg: 9 }}>
              <VStack spacing={6} align="stretch">
                {/* Stats */}
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
                        borderColor: 'blue.400'
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
                        bgGradient="linear(to-r, blue.400, blue.600)"
                      />
                      <Stat textAlign="center">
                        <StatLabel fontSize="lg" color={mutedTextColor}>
                          {t('totalExams')}
                        </StatLabel>
                        <StatNumber
                          fontSize="4xl"
                          color={useColorModeValue('blue.600', 'blue.300')}
                          fontWeight="bold"
                        >
                          {exams.length}
                        </StatNumber>
                        <StatHelpText color={mutedTextColor}>
                          {t('totalExams')}
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
                          {t('issuedCertificates')}
                        </StatLabel>
                        <StatNumber
                          fontSize="4xl"
                          color={useColorModeValue('green.600', 'green.300')}
                          fontWeight="bold"
                        >
                          {certificates.filter(cert => cert.isValid).length}
                        </StatNumber>
                        <StatHelpText color={mutedTextColor}>
                          {t('issuedCertificates')}
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
                        borderColor: 'orange.400'
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
                        bgGradient="linear(to-r, orange.400, orange.600)"
                      />
                      <Stat textAlign="center">
                        <StatLabel fontSize="lg" color={mutedTextColor}>
                          {t('verifiedInstitutions')}
                        </StatLabel>
                        <StatNumber
                          fontSize="4xl"
                          color={useColorModeValue('orange.600', 'orange.300')}
                          fontWeight="bold"
                        >
                          {new Set(certificates.map(cert => cert.institutionAddress)).size}
                        </StatNumber>
                        <StatHelpText color={mutedTextColor}>
                          {t('verifiedInstitutions')}
                        </StatHelpText>
                      </Stat>
                    </Box>
                  </Fade>
                </SimpleGrid>

                {/* Exams List */}
                <ExamManagement
                  exams={exams}
                  loading={isLoading}
                />

                {/* Certificates List */}
                <Certificate
                  certificatesData={certificates}
                  onDownload={handleDownload}
                  loading={isLoading}
                />
              </VStack>
            </GridItem>
          </Grid>
        </Container>

        {/* Footer */}
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
                  {t('systemTitle')}
                </Text>
                <Link href="/about" color="blue.500" fontSize="sm">
                  {t('about') || 'About'}
                </Link>
                <Link href="/contact" color="blue.500" fontSize="sm">
                  {t('contact') || 'Contact'}
                </Link>
              </HStack>
            </HStack>
          </Container>
        </Box>
      </Box>
    </Layout>
  );
}