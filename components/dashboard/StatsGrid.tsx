import { SimpleGrid, Box, Stat, StatLabel, StatNumber, useColorModeValue, Fade, StatHelpText } from '@chakra-ui/react';
import { Institution } from 'types/institution';
import { useLanguage } from 'context/LanguageContext';

interface StatsGridProps {
  institutions: Institution[];
  scrollToTotal: () => void;
  scrollToVerified: () => void;
  scrollToPending: () => void;
  cardBg: string;
  borderColor: string;
  mutedTextColor: string;
}

export default function StatsGrid({
  institutions,
  scrollToTotal,
  scrollToVerified,
  scrollToPending,
  cardBg,
  borderColor,
  mutedTextColor,
}: StatsGridProps) {
  const { t, translations } = useLanguage();

  if (Object.keys(translations).length === 0) {
    return null;
  }

  const { t, translations } = useLanguage();

  if (Object.keys(translations).length === 0) {
    return null;
  }

  return (
    <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
      <Fade in={true} delay={0.1}>
        <Box
          cursor="pointer"
          onClick={scrollToTotal}
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
              {t('totalInstitutions')}
              {t('totalInstitutions')}
            </StatLabel>
            <StatNumber
              fontSize="4xl"
              color={useColorModeValue('red.600', 'red.300')}
              fontWeight="bold"
            >
              {institutions.length}
            </StatNumber>
            <StatHelpText color={mutedTextColor}>
              {t('totalInstitutions')}
              {t('totalInstitutions')}
            </StatHelpText>
          </Stat>
        </Box>
      </Fade>

      <Fade in={true} delay={0.2}>
        <Box
          cursor="pointer"
          onClick={scrollToVerified}
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
              {t('verifiedInstitutions')}
              {t('verifiedInstitutions')}
            </StatLabel>
            <StatNumber
              fontSize="4xl"
              color={useColorModeValue('green.600', 'green.300')}
              fontWeight="bold"
            >
              {institutions.filter(inst => inst.isVerified).length}
            </StatNumber>
            <StatHelpText color={mutedTextColor}>
              {t('verifiedInstitutions')}
              {t('verifiedInstitutions')}
            </StatHelpText>
          </Stat>
        </Box>
      </Fade>

      <Fade in={true} delay={0.3}>
        <Box
          cursor="pointer"
          onClick={scrollToPending}
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
              {t('pendingInstitutions')}
              {t('pendingInstitutions')}
            </StatLabel>
            <StatNumber
              fontSize="4xl"
              color={useColorModeValue('orange.600', 'orange.300')}
              fontWeight="bold"
            >
              {institutions.filter(inst => !inst.isVerified).length}
            </StatNumber>
            <StatHelpText color={mutedTextColor}>
              {t('pendingInstitutions')}
              {t('pendingInstitutions')}
            </StatHelpText>
          </Stat>
        </Box>
      </Fade>
    </SimpleGrid>
  );
}