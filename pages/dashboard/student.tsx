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
  SkeletonText,
  Icon,
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
import { CourseEnrollment } from 'components/student/CourseEnrollment';
import { Certificate as CertificateType } from 'types/certificate';
import Layout from 'components/layout/Layout';
import { useAccount } from 'wagmi';
import { useLanguage } from 'context/LanguageContext';
import { FaShieldAlt } from 'react-icons/fa';

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

  const pageName = `${t('studentDashboard')}`;

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

  // if (error) {
  //   return (
  //     <Center h="100vh" bg={useColorModeValue('gray.50', 'gray.900')}>
  //       <ScaleFade initialScale={0.9} in={true}>
  //         <Alert
  //           status="error"
  //           variant="subtle"
  //           flexDirection="column"
  //           alignItems="center"
  //           justifyContent="center"
  //           textAlign="center"
  //           height="200px"
  //           bg={cardBg}
  //           borderRadius="xl"
  //           shadow="2xl"
  //         >
  //           <AlertIcon boxSize="40px" mr={0} />
  //           <Text color="red.500" fontSize="xl" mt={4}>
  //             {error}
  //           </Text>
  //           <Button
  //             colorScheme="blue"
  //             size="lg"
  //             onClick={checkAccess}
  //             mt={4}
  //           >
  //             <ActivityIcon mr={2} />
  //             {t('retry')}
  //           </Button>
  //         </Alert>
  //       </ScaleFade>
  //     </Center>
  //   );
  // }

  return (
    <Box minH="100vh" bg={useColorModeValue('gray.50', 'gray.900')}>
      <Container maxW="container.xl" pb="100px">
        <Grid templateColumns="repeat(12, 1fr)" gap={6}>
          {/* Sidebar */}
          <GridItem colSpan={{ base: 12, lg: 3 }}>
            <VStack spacing={6} align="stretch">
              <Skeleton isLoaded={!isLoading} borderRadius="xl">
                <Box p={6} borderRadius="xl" shadow="xl" borderWidth="1px">
                  {isLoading ? (
                    <SkeletonText noOfLines={4} spacing="4" />
                  ) : (
                    <>
                      <Heading size="md" mb={4}>
                        {(account?.firstName && account?.lastName) ? `${account.firstName} ${account.lastName}` : t('connectedAccount')}
                      </Heading>
                      <Text fontSize="sm" mb={2}>
                        {account ? account.email : t('noEmail')}
                      </Text>
                      <Text fontSize="sm" mb={2}>
                        {account ? account.phoneNumber : t('noPhoneNumber')}
                      </Text>
                      <Tooltip label={t('userRole')} placement="top">
                        <Badge colorScheme="red" px={3} py={1} borderRadius="full">
                          <HStack spacing={2}>
                            <Icon as={FaShieldAlt} w={4} h={4} />
                            <Text>{t('systemAdmin')}</Text>
                          </HStack>
                        </Badge>
                      </Tooltip>
                    </>
                  )}
                </Box>
              </Skeleton>

              {/* System Info Box with Icons */}
              <Skeleton isLoaded={!isLoading} borderRadius="xl">
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
                            {t('viewAcademicCertificates') + '\n & \n' + t('viewAcademicCourses')}
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
                            {t('trackIssueDates') + '\n & \n' + t('trackExamDates')}
                          </Text>
                        </HStack>
                      </VStack>
                    </VStack>
                  </Box>
                </ScaleFade>
              </Skeleton>
            </VStack>
          </GridItem>


          {/* Main Content */}
          <GridItem colSpan={{ base: 12, lg: 9 }}>
            <VStack spacing={6} align="stretch">
              {/* Stats */}
              <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
                <Skeleton isLoaded={!isLoading} borderRadius="xl">
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
                      </Stat>
                    </Box>
                  </Fade>
                </Skeleton>

                <Skeleton isLoaded={!isLoading} borderRadius="xl">
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
                      </Stat>
                    </Box>
                  </Fade>
                </Skeleton>
              </SimpleGrid>

              {/* Exams List */}
              <Skeleton isLoaded={!isLoading} borderRadius="xl">
                <ExamManagement
                  exams={exams}
                  loading={isLoading}
                />
              </Skeleton>
            </VStack>
          </GridItem>
        </Grid>
      </Container>
    </Box>
  );
}