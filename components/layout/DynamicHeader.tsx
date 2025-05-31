import { Box, Container, Heading, Text, VStack, ScaleFade, useColorModeValue, Spinner } from '@chakra-ui/react';
import { useLanguage } from 'context/LanguageContext';

interface DynamicHeaderProps {
  userRole?: string | null;
}

const DynamicHeader = ({ userRole }: DynamicHeaderProps) => {
  const { t, translations } = useLanguage();

  if (Object.keys(translations).length === 0) {
    return <Spinner />;
  }

  const headers = {
    admin: {
      title: t('adminDashboard'),
      description: (
        <>
          {t('adminDashboardDesc')}
        </>
      ),
      gradient: [
        'linear-gradient(120deg, red.500 0%, red.700 100%)',
        'linear-gradient(120deg, red.700 0%, red.900 100%)'
      ],
    },
    institution: {
      title: t('institutionDashboard'),
      description: (
        <>
          {t('institutionDashboardDesc')}
        </>
      ),
      gradient: [
        'linear-gradient(120deg, blue.500 0%, blue.700 100%)',
        'linear-gradient(120deg, blue.700 0%, blue.900 100%)'
      ],
    },
    student: {
      title: t('studentDashboard'),
      description: (
        <>
          {t('studentDashboardDesc')}
        </>
      ),
      gradient: [
        'linear-gradient(120deg, green.500 0%, green.700 100%)',
        'linear-gradient(120deg, green.700 0%, green.900 100%)'
      ],
    },
    employer: {
      title: t('employerDashboard'),
      description: (
        <>
          {t('employerDashboardDesc')}
        </>
      ),
      gradient: [
        'linear-gradient(120deg, orange.500 0%, orange.700 100%)',
        'linear-gradient(120deg, orange.700 0%, orange.900 100%)'
      ],
    },
    default: {
      title: t('systemTitle'),
      description: (
        <>
          {t('systemDesc')}
        </>
      ),
      gradient: [
        'linear-gradient(120deg, gray.500 0%, gray.700 100%)',
        'linear-gradient(120deg, gray.700 0%, gray.900 100%)'
      ],
    },
  };
  const headers = {
    admin: {
      title: t('adminDashboard'),
      description: (
        <>
          {t('adminDashboardDesc')}
        </>
      ),
      gradient: [
        'linear-gradient(120deg, red.500 0%, red.700 100%)',
        'linear-gradient(120deg, red.700 0%, red.900 100%)'
      ],
    },
    institution: {
      title: t('institutionDashboard'),
      description: (
        <>
          {t('institutionDashboardDesc')}
        </>
      ),
      gradient: [
        'linear-gradient(120deg, blue.500 0%, blue.700 100%)',
        'linear-gradient(120deg, blue.700 0%, blue.900 100%)'
      ],
    },
    student: {
      title: t('studentDashboard'),
      description: (
        <>
          {t('studentDashboardDesc')}
        </>
      ),
      gradient: [
        'linear-gradient(120deg, green.500 0%, green.700 100%)',
        'linear-gradient(120deg, green.700 0%, green.900 100%)'
      ],
    },
    employer: {
      title: t('employerDashboard'),
      description: (
        <>
          {t('employerDashboardDesc')}
        </>
      ),
      gradient: [
        'linear-gradient(120deg, orange.500 0%, orange.700 100%)',
        'linear-gradient(120deg, orange.700 0%, orange.900 100%)'
      ],
    },
    default: {
      title: t('systemTitle'),
      description: (
        <>
          {t('systemDesc')}
        </>
      ),
      gradient: [
        'linear-gradient(120deg, gray.500 0%, gray.700 100%)',
        'linear-gradient(120deg, gray.700 0%, gray.900 100%)'
      ],
    },
  };

  const header = headers[userRole as keyof typeof headers] || headers.default;
  const bgGradient = useColorModeValue(header.gradient[0], header.gradient[1]);

  return (
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
              bgGradient="linear(to-r, white, red.100)"
              bgClip="text"
              letterSpacing="tight"
            >
              {header.title}
            </Heading>
            <Text fontSize="lg" textAlign="center" maxW="2xl" opacity={0.8}>
              {header.description}
            </Text>
          </VStack>
        </ScaleFade>
      </Container>
    </Box>
  );
};

export default DynamicHeader;