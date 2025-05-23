import { Box, Container, Heading, Text, VStack, ScaleFade, useColorModeValue } from '@chakra-ui/react';

interface DynamicHeaderProps {
  userRole?: string | null;
}

const headers = {
  admin: {
    title: 'لوحة تحكم المسؤول',
    subtitle: 'Admin Dashboard',
    description: (
      <>
        إدارة وتنظيم المؤسسات التعليمية في النظام
        <br />
        Manage and Organize Educational Institutions in the System
      </>
    ),
    gradient: ['linear-gradient(120deg, red.500 0%, red.700 100%)', 'linear-gradient(120deg, red.700 0%, red.900 100%)'],
  },
  institution: {
    title: 'لوحة تحكم المؤسسة',
    subtitle: 'Institution Dashboard',
    description: (
      <>
        إدارة بيانات المؤسسة وامتحاناتها
        <br />
        Manage your institution data and exams
      </>
    ),
    gradient: ['linear-gradient(120deg, blue.500 0%, blue.700 100%)', 'linear-gradient(120deg, blue.700 0%, blue.900 100%)'],
  },
  student: {
    title: 'لوحة تحكم الطالب',
    subtitle: 'Student Dashboard',
    description: (
      <>
        استعرض شهاداتك ونتائجك
        <br />
        View your certificates and results
      </>
    ),
    gradient: ['linear-gradient(120deg, green.500 0%, green.700 100%)', 'linear-gradient(120deg, green.700 0%, green.900 100%)'],
  },
  employer: {
    title: 'لوحة تحكم جهة العمل',
    subtitle: 'Employer Dashboard',
    description: (
      <>
        تحقق من الشهادات واطلع على بيانات المتقدمين
        <br />
        Verify certificates and review applicants
      </>
    ),
    gradient: ['linear-gradient(120deg, orange.500 0%, orange.700 100%)', 'linear-gradient(120deg, orange.700 0%, orange.900 100%)'],
  },
  default: {
    title: 'نظام الشهادات اللامركزي',
    subtitle: 'Decentralized Certificate System',
    description: (
      <>
        منصة لإدارة الشهادات والمؤسسات التعليمية
        <br />
        A platform for managing certificates and educational institutions
      </>
    ),
    gradient: ['linear-gradient(120deg, gray.500 0%, gray.700 100%)', 'linear-gradient(120deg, gray.700 0%, gray.900 100%)'],
  },
};

const DynamicHeader = ({ userRole }: DynamicHeaderProps) => {
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
            <Heading size="md" fontWeight="normal" opacity={0.9}>
              {header.subtitle}
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