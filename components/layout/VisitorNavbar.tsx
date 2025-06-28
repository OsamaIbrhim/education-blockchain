import { Box, Button, Flex, HStack, Heading, Link, Text, useMultiStyleConfig, useToast } from '@chakra-ui/react';
import NextLink from 'next/link';
import { useRouter } from 'next/router';
import { useAppData } from 'hooks/useAppData';
import { useLanguage } from 'context/LanguageContext';
import { connectAndFetchUserRole } from 'hooks/useAuthSession';
import { isVerifiedUser } from 'services/identity';
import { useState } from 'react';

const VisitorNavbar = () => {
  const { address, userRole, isLoading } = useAppData();
  const { t, language, setLanguage } = useLanguage();
  const styles = useMultiStyleConfig('visitorNavbarParts', {});
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const router = useRouter();

  const handleAuthAction = () => {
    // if (!address) {
      router.push('/login');
    //   return;
    // }
    // handleLogin();
  };

  const handleLogin = async () => {
      try {
        if (!address) {
          throw new Error(t('pleaseConnectWallet') || 'Please connect your wallet first');
        }
        setLoading(true);

        if (userRole === 'admin') {
          router.push('/dashboard/admin');
          return;
        }
        // 3. If the user is an institution, check if verified
        if (userRole === 'institution') {
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

    toast({
      title: t('connectedAccount'),
      description: t('success'),
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };


  const toggleLanguage = () => {
    const newLang = language === 'en' ? 'ar' : 'en';
    setLanguage(newLang);
  };

  return (
    <Box bg="gray.800" color="white" px={4}>
      <Flex h={16} alignItems="center" justifyContent="space-between">
        <HStack spacing={8} alignItems="center">
          <Box>
            <NextLink href="/" passHref>
              <Heading as="h1" size="md">{t('systemTitle')}</Heading>
            </NextLink>
          </Box>
          <HStack as="nav" spacing={4} display={{ base: 'none', md: 'flex' }}>
            <Link as={NextLink} href="#about">{t('about')}</Link>
            <Link as={NextLink} href="#support">{t('support')}</Link>
          </HStack>
        </HStack>
        <Flex alignItems="center">
          <Button
            variant="ghost"
            onClick={toggleLanguage}
            mr={4}
            aria-label="Toggle Language"
          >
            {language === 'en' ? 'العربية' : 'English'}
          </Button>

          {/* <Box>
            {!address ? (
              <Button
                onClick={handleConnectWallet}
                isLoading={isLoading || loading}
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
          </Box> */}

          <Button
            sx={styles.authButton}
            onClick={handleAuthAction}
            isLoading={isLoading || loading}
          >
            {address ? t('login') : t('register')}
          </Button>
        </Flex>
      </Flex>
    </Box>
  );
};

export default VisitorNavbar;