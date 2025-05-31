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
} from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { connectWallet, getAccounts } from '../utils/web3Provider';
import { registerUser, getUserRole, isVerifiedUser, isOwner } from 'services/identity';
import { useLanguage } from 'context/LanguageContext';

type RoleType = 'admin' | 'institution' | 'student' | 'employer' | 'none';

const redirectMap: { [key: string]: string } = {
  student: '/dashboard/student',
  institution: '/dashboard/institution',
  employer: '/dashboard/employer',
  admin: '/dashboard/admin',
};

export default function Home() {
  const { t, language, setLanguage } = useLanguage();
  const [account, setAccount] = useState<string | null>(null);
  const [currentRole, setCurrentRole] = useState<RoleType | null>(null);
  const [selectedRole, setSelectedRole] = useState<RoleType>('none');
  const [loading, setLoading] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();
  const router = useRouter();

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
    try {
      const accounts = await connectWallet();
      if (accounts.length === 0) {
        throw new Error(t('noAddress'));
      }
      setAccount(accounts[0]);
      // Get user role after connecting
      try {
        const role = await getUserRole(accounts[0]) as RoleType;
        setCurrentRole(role);
        if (redirectMap[role]) {
          router.push(redirectMap[role]);
        }
      } catch {
        toast({
          title: t('userNotRegistered') || 'User not registered yet',
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
    } catch (error: any) {
      toast({
        title: t('error'),
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleRegister = async () => {
    try {
      setLoading(true);
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
      await registerUser(selectedRole);
      setCurrentRole(selectedRole);

      // Check verification status for institutions
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
      const role = await getUserRole(account) as RoleType;
      if (role === 'none') {
        throw new Error(t('accountNotRegistered') || 'This account is not registered. Please register first.');
      }
      // Check if user is admin first
      const { status: isAdminUser } = await isOwner(account);
      if (isAdminUser) {
        setRedirecting(true);
        router.push('/dashboard/admin');
        return;
      }
      // Add verification check for institutions
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
      // Redirect based on role
      const redirectPath = redirectMap[role];
      if (redirectPath) {
        setRedirecting(true);
        router.push(redirectPath);
      } else {
        throw new Error(t('invalidRole') || 'Invalid role or role not found');
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
    <Container maxW="container.sm" py={8}>
      <VStack spacing={6} align="stretch">
        <Box textAlign="center">
          <Heading mb={2}>{t('systemTitle')}</Heading>
          <Heading size="md" mb={4}>{t('systemDesc')}</Heading>
        </Box>

        <Box>
          <Text mb={2}>{t('connectedAccount')}:</Text>
          <Text fontSize="sm" mb={4}>{account || t('noAddress')}</Text>
          {!account ? (
            <Button
              colorScheme="blue"
              onClick={handleConnectWallet}
              isLoading={loading}
              width="full"
            >
              {t('connectWallet') || 'Connect Wallet'}
            </Button>
          ) : (
            <Button
              colorScheme="orange"
              onClick={() => window.location.reload()}
              width="full"
            >
              {t('switchWallet') || 'Switch Wallet'}
            </Button>
          )}
        </Box>

        {account && (
          <VStack spacing={4}>
            {currentRole && currentRole !== 'none' ? (
              <Box bg="yellow.100" p={4} borderRadius="md">
                <Text>
                  {t('currentRole')} {currentRole}
                </Text>
                <VStack spacing={4} width="full" mt={4}>
                  <Button
                    colorScheme="green"
                    onClick={handleLogin}
                    isLoading={loading || redirecting}
                    width="full"
                  >
                    {t('login')}
                  </Button>
                </VStack>
              </Box>
            ) : (
              <Box bg="blue.100" p={4} borderRadius="md">
                <Text mb={4}>
                  {t('accountNotRegistered')}
                </Text>
                <Select
                  placeholder={t('selectYourRole')}
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value as RoleType)}
                  mb={4}
                >
                  <option value="student">{t('studentRole')}</option>
                  <option value="institution">{t('institutionRole')}</option>
                  <option value="employer">{t('employerRole')}</option>
                </Select>
                <Button
                  colorScheme="green"
                  onClick={handleRegister}
                  isLoading={loading || redirecting}
                  width="full"
                >
                  {t('register')}
                </Button>
              </Box>
            )}
          </VStack>
        )}

        {error && (
          <Box bg="red.100" p={4} borderRadius="md">
            <Text color="red.500">{t('error')}: {error}</Text>
          </Box>
        )}
      </VStack>


      {/* Language Switcher */}
      <Box>
        <Select
          value={language}
          onChange={e => setLanguage(e.target.value)}
          width="fit-content"
          mb={2}
        >
          <option value="ar">العربية</option>
          <option value="en">English</option>
        </Select>
      </Box>

    </Container>
  );
}