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
import { selfRegister, getUserRole, isVerifiedUser, isOwner, loginUser } from 'services/identity';
import { useLanguage } from 'context/LanguageContext';
import VisitorNavbar from 'components/layout/VisitorNavbar';
import { connectAndFetchUserRole } from 'hooks/useAuthSession';
import { useAppData } from 'hooks/useAppData';

type RoleType = 'admin' | 'institution' | 'student' | 'employer' | 'unknown' | 'none';

const redirectMap: { [key: string]: string } = {
  student: '/dashboard/student',
  institution: '/dashboard/institution',
  employer: '/dashboard/employer',
  admin: '/dashboard/admin',
};

export default function Home() {
  const { t } = useLanguage();
  const styles = useMultiStyleConfig('LoginPage', {}); // Changed from useStyleConfig
  const { 
    address, 
    account, 
    userRole, 
    isVerified, 
    isLoading,
    isUserOwner,
    checkAccess 
  } = useAppData();
  
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
  const [formEmail, setFormEmail] = useState('');

  useEffect(() => {
    // useAppData already handles connection checking and role determination
    if (address && userRole && userRole !== 'none') {
      // If user has a valid role, check if we should redirect
      if (isUserOwner) {
        router.push('/dashboard/admin');
      } else if (redirectMap[userRole]) {
        router.push(redirectMap[userRole]);
      }
    }
  }, [address, userRole, isUserOwner, router]);

  // Remove the old checkConnection function since useAppData handles this

  const handleConnectWallet = async () => {
    const { address: connectedAddress, role } = await connectAndFetchUserRole();

    if (!connectedAddress) {
      toast({
        title: 'Error',
        description: t('noAddress'),
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (role) {
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
      
      // Check if user is admin using useAppData
      if (isUserOwner) {
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
      let email = '';

      if (selectedRole === 'student') {
        nationalId = formNationalId;
        firstName = formFirstName;
        lastName = formLastName;
        phoneNumber = formPhoneNumber;
        email = formEmail;
        // employer will need to updated <<<<<<<<<<< TODO
      } else if (selectedRole === 'institution' || selectedRole === 'employer') {
        nationalId = '';
        firstName = '';
        lastName = '';
        phoneNumber = '';
      }        await selfRegister(
          selectedRole,
          nationalId,
          firstName,
          lastName,
          phoneNumber,
          email,
        );

        // Force refresh the data in useAppData
        await checkAccess();

        if (selectedRole === 'institution') {
          const isVerified = await isVerifiedUser(address!);
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
      if (!address) {
        throw new Error(t('pleaseConnectWallet') || 'Please connect your wallet first');
      }
      setLoading(true);
      setError('');
      
      // Get the user's role from useAppData (already available)
      const user = await loginUser(address);

      // Check if the user is the admin using useAppData
      if (isUserOwner) {
        setRedirecting(true);
        router.push('/dashboard/admin');
        return;
      }
      
      // If the user is an institution, check if verified
      if (userRole === 'institution') {
        if (!isVerified) {
          toast({
            title: t('notAuthorized'),
            description: t('pleaseWaitForVerification'),
            status: 'warning',
            duration: 9000,
            isClosable: true,
            position: 'top',
          });
          return;
        }
      }

      // Redirect based on role
      if (userRole && redirectMap[userRole]) {
        setRedirecting(true);
        router.push(redirectMap[userRole]);
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
            <Text fontSize="sm" mb={4}>{address || t('noAddress')}</Text>
            {!address ? (
              <Button
                onClick={handleConnectWallet}
                isLoading={loading || isLoading}
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

          {address && (
            <VStack spacing={4}>
              {userRole && userRole !== 'none' ? (
                <Box sx={styles.loginBox}>
                  <Text>
                    {t('currentRole')} {userRole}
                  </Text>
                  {account && (
                    <VStack spacing={2} mt={2}>
                      <Text fontSize="sm">
                        {t('firstName')}: {account.firstName || 'N/A'}
                      </Text>
                      <Text fontSize="sm">
                        {t('lastName')}: {account.lastName || 'N/A'}
                      </Text>
                      <Text fontSize="sm">
                        {t('verified')}: {isVerified ? 'Yes' : 'No'}
                      </Text>
                    </VStack>
                  )}
                  <VStack spacing={4} width="full" mt={4}>
                    <Button
                      onClick={handleLogin}
                      isLoading={loading || redirecting || isLoading}
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
                    isLoading={loading || redirecting || isLoading}
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
                  <FormControl mb={3} isRequired>
                    <FormLabel>{t('email')}</FormLabel>
                    <Input
                      value={formEmail}
                      onChange={e => setFormEmail(e.target.value)}
                      placeholder={t('email')}
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