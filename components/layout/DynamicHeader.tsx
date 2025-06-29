import { Box, Container, Heading, Text, VStack, ScaleFade, useColorModeValue } from '@chakra-ui/react';
import { useLanguage } from 'context/LanguageContext';

interface DynamicHeaderProps {
  userRole?: string | null;
}

const DynamicHeader = ({ userRole }: DynamicHeaderProps) => {
  const { t } = useLanguage();

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

  return (
    <Box
      position="relative"
      py={8}
      px={4}
      mb={8}
      overflow="hidden"
      color="white"
    >
      <Box
        as="video"
        autoPlay
        muted
        loop
        playsInline
        src="/videos/header_1.mp4"
        position="absolute"
        top={0}
        left={0}
        width="100%"
        height="100%"
        objectFit="cover"
        zIndex={0}
      />

      <Box
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        bg="blackAlpha.700"
        zIndex={1}
      />

      <Container maxW="container.xl" position="relative" zIndex={2}>
        <ScaleFade initialScale={0.9} in={true}>
          <VStack
            spacing={4}
            align="center"
            // bg="blackAlpha.600"
            p={6}
            borderRadius="lg" 
            backdropFilter="blur(0px)"
          >
            <Heading
              size="xl"
              bgGradient="linear(to-r, white, red.100)"
              bgClip="text"
              letterSpacing="tight"
            >
              {header.title}
            </Heading>
            <Text fontSize="lg" textAlign="center" maxW="2xl" opacity={0.9}>
              {header.description}
            </Text>
          </VStack>
        </ScaleFade>
      </Container>
    </Box>

  );
};

export default DynamicHeader;