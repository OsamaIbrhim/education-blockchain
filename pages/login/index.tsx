import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  VStack,
  useToast,
  Select,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  useDisclosure,
  useMultiStyleConfig, // Changed from useStyleConfig
} from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { connectWallet, getAccounts } from '../../utils/web3Provider';
import { registerUser, getUserRole, isVerifiedUser, isOwner, loginUser } from 'services/identity';
import { useLanguage } from 'context/LanguageContext';
import VisitorNavbar from 'components/layout/VisitorNavbar';
import { connectAndFetchUserRole } from 'hooks/useAuthSession';

type RoleType = 'admin' | 'institution' | 'student' | 'employer' | 'unknown' | 'none';

const redirectMap: { [key: string]: string } = {
  student: '/dashboard/student',
  institution: '/dashboard/institution',
  employer: '/dashboard/employer',
  admin: '/dashboard/admin',
};

export default function Home() {
  const { t, language, setLanguage } = useLanguage();
  const styles = useMultiStyleConfig('LoginPage', {}); // Changed from useStyleConfig
  const [account, setAccount] = useState<string | null>(null);
  const [currentRole, setCurrentRole] = useState<RoleType | null>(null);
  const [selectedRole, setSelectedRole] = useState<RoleType>('none');
  const [loading, setLoading] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();
  const router = useRouter();
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Registration form state
  const [formNationalId, setFormNationalId] = useState('');
  const [formFirstName, setFormFirstName] = useState('');
  const [formLastName, setFormLastName] = useState('');
  const [formPhoneNumber, setFormPhoneNumber] = useState('');

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        const accounts = await getAccounts();
        if (accounts.length > 0) {
          const currentAccount = accounts[0];
          setAccount(currentAccount);

          // Check if user is admin first
          try {
            const { status: isAdminUser } = await isOwner(currentAccount);
            if (isAdminUser) {
              setCurrentRole('admin');
              return;
            }
          } catch { }

          // If not admin, check regular role
          try {
            const role = await getUserRole(currentAccount) as RoleType;
            setCurrentRole(role);
          } catch { }
        }
      } catch (error) {
        console.error('Error checking connection:', error);
      }
    }
  };

const handleConnectWallet = async () => {
  const { address, role } = await connectAndFetchUserRole();

  if (!address) {
    toast({
      title: 'Error',
      description: t('noAddress'),
      status: 'error',
      duration: 3000,
      isClosable: true,
    });
    return;
  }

  setAccount(address);

  if (role) {
    setCurrentRole(role);
    if (redirectMap[role]) {
      router.push(redirectMap[role]);
    }
  } else {
    toast({
      title: t('userNotRegistered'),
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
  }

  toast({
    title: t('connectedAccount'),
    description: t('success'),
    status: 'success',
    duration: 3000,
    isClosable: true,
  });
};


  const handleRegister = async () => {
    try {
      setError('');
      // Check if user is admin first
      let isAdminUser = false;
      try {
        const adminStatus = await isOwner(account!);
        isAdminUser = adminStatus.status;
      } catch { }
      if (isAdminUser) {
        setCurrentRole('admin');
        setRedirecting(true);
        router.push('/dashboard/admin');
        return;
      }
      if (!selectedRole || selectedRole === 'none') {
        throw new Error(t('pleaseSelectRole') || 'Please select a role');
      }

      onOpen();
    } catch (error: any) {
      setError(error.message);
      toast({
        title: t('error'),
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleModalRegister = async () => {
    setLoading(true);
    try {
      let nationalId = '';
      let firstName = '';
      let lastName = '';
      let phoneNumber = '';

      if (selectedRole === 'student') {
        nationalId = formNationalId;
        firstName = formFirstName;
        lastName = formLastName;
        phoneNumber = formPhoneNumber;
        // employer will need to updated <<<<<<<<<<< TODO
      } else if (selectedRole === 'institution' || selectedRole === 'employer') {
        nationalId = '';
        firstName = '';
        lastName = '';
        phoneNumber = '';
      }

      await registerUser(
        selectedRole,
        nationalId,
        firstName,
        lastName,
        phoneNumber,
        // account || undefined
      );
      setCurrentRole(selectedRole);

      if (selectedRole === 'institution') {
        const isVerified = await isVerifiedUser(account!);
        if (!isVerified) {
          toast({
            title: t('notAuthorized'),
            description: t('pleaseWaitForVerification'),
            status: 'warning',
            duration: 9000,
            isClosable: true,
            position: 'top',
          });
        }
      }
      // After successful registration, redirect based on role
      const redirectPath = redirectMap[selectedRole];
      if (redirectPath) {
        setRedirecting(true);
        router.push(redirectPath);
      }
      onClose();
    } catch (error: any) {
      setError(error.message);
      toast({
        title: t('error'),
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    try {
      if (!account) {
        throw new Error(t('pleaseConnectWallet') || 'Please connect your wallet first');
      }
      setLoading(true);
      setError('');
      // 1. Get the user's role from the contract
      const user = await loginUser(account);

      // 2. Check if the user is the admin (owner)
      const { status: isAdminUser } = await isOwner(account);
      if (isAdminUser) {
        setRedirecting(true);
        router.push('/dashboard/admin');
        return;
      }
      // 3. If the user is an institution, check if verified
      if (selectedRole === 'institution') {
        const isVerified = await isVerifiedUser(account!);
        if (!isVerified) {
          toast({
            title: t('notAuthorized'),
            description: t('pleaseWaitForVerification'),
            status: 'warning',
            duration: 9000,
            isClosable: true,
            position: 'top',
          });
        }
      }
    } catch (error: any) {
      toast({
        title: t('error'),
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <VisitorNavbar />
      <Container sx={styles.container}>
        <VStack spacing={6} align="stretch">
          <Box sx={styles.header}>
            <Heading mb={2}>{t('systemTitle')}</Heading>
            <Heading size="md" mb={4}>{t('systemDesc')}</Heading>
          </Box>
          <Box>
            <Text mb={2}>{t('connectedAccount')}:</Text>
            <Text fontSize="sm" mb={4}>{account || t('noAddress')}</Text>
            {!account ? (
              <Button
                onClick={handleConnectWallet}
                isLoading={loading}
                sx={styles.connectButton}
              >
                {t('connectWallet') || 'Connect Wallet'}
              </Button>
            ) : (
              <Button
                onClick={() => window.location.reload()}
                sx={styles.switchButton}
              >
                {t('switchWallet') || 'Switch Wallet'}
              </Button>
            )}
          </Box>

          {account && (
            <VStack spacing={4}>
              {currentRole && currentRole !== 'none' ? (
                <Box sx={styles.loginBox}>
                  <Text>
                    {t('currentRole')} {currentRole}
                  </Text>
                  <VStack spacing={4} width="full" mt={4}>
                    <Button
                      onClick={handleLogin}
                      isLoading={loading || redirecting}
                      sx={styles.actionButton}
                    >
                      {t('login')}
                    </Button>
                  </VStack>
                </Box>
              ) : (
                <Box sx={styles.registerBox}>
                  <Text mb={4}>
                    {t('accountNotRegistered')}
                  </Text>
                  <Select
                    placeholder={t('selectYourRole')}
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value as RoleType)}
                    sx={styles.roleSelect}
                  >
                    <option value="student">{t('studentRole')}</option>
                    <option value="institution">{t('institutionRole')}</option>
                    <option value="employer">{t('employerRole')}</option>
                  </Select>
                  <Button
                    onClick={handleRegister}
                    isLoading={loading || redirecting}
                    sx={styles.actionButton}
                  >
                    {t('register')}
                  </Button>
                </Box>
              )}
            </VStack>
          )}

          {error && (
            <Box sx={styles.errorBox}>
              <Text sx={styles.errorText}>{t('error')}: {error}</Text>
            </Box>
          )}
        </VStack>

        {/* Registration Modal */}
        {selectedRole === 'student' && (
          <Modal isOpen={isOpen} onClose={onClose} isCentered>
            <ModalOverlay />
            <ModalContent>
              <ModalHeader>{t('register')}</ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                <>
                  {/* <FormControl mb={3} isRequired>
                  <FormLabel>{t('institutionAddress') || 'Institution Address'}</FormLabel>
                  <Input
                    value={formInstitutionAddress}
                    onChange={e => setFormInstitutionAddress(e.target.value)}
                    placeholder={t('institutionAddress') || 'Institution Address'}
                  />
                </FormControl> */}
                  <FormControl mb={3} isRequired>
                    <FormLabel>{t('nationalId') || 'National ID'}</FormLabel>
                    <Input
                      value={formNationalId}
                      onChange={e => setFormNationalId(e.target.value)}
                      placeholder={t('nationalId') || 'National ID'}
                    />
                  </FormControl>
                  <FormControl mb={3} isRequired>
                    <FormLabel>{t('firstName') || 'First Name'}</FormLabel>
                    <Input
                      value={formFirstName}
                      onChange={e => setFormFirstName(e.target.value)}
                      placeholder={t('firstName') || 'First Name'}
                    />
                  </FormControl>
                  <FormControl mb={3} isRequired>
                    <FormLabel>{t('lastName') || 'Last Name'}</FormLabel>
                    <Input
                      value={formLastName}
                      onChange={e => setFormLastName(e.target.value)}
                      placeholder={t('lastName') || 'Last Name'}
                    />
                  </FormControl>
                  <FormControl mb={3} isRequired>
                    <FormLabel>{t('phoneNumber') || 'Phone Number'}</FormLabel>
                    <Input
                      value={formPhoneNumber}
                      onChange={e => setFormPhoneNumber(e.target.value)}
                      placeholder={t('phoneNumber') || 'Phone Number'}
                    />
                  </FormControl>
                </>
              </ModalBody>
              <ModalFooter>
                <Button colorScheme="blue" mr={3} onClick={handleModalRegister} isLoading={loading}>
                  {t('register')}
                </Button>
                <Button variant="ghost" onClick={onClose}>
                  {t('cancel') || 'Cancel'}
                </Button>
              </ModalFooter>
            </ModalContent>
          </Modal>
        )}
      </Container>
    </Box>
  );
}