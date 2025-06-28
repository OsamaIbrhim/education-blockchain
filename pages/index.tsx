import { Box, Button, Container, Heading, Text, VStack } from '@chakra-ui/react';
import VisitorNavbar from '../components/layout/VisitorNavbar';
import { useRouter } from 'next/router';
import { useAppData } from 'hooks/useAppData';

const LandingPage = () => {
  const { address, isLoading } = useAppData();
  const router = useRouter();

  return (
    <Box>
      <VisitorNavbar />
      <Container maxW="container.xl" centerContent py={20}>
        <VStack spacing={8} textAlign="center">
          <Heading as="h1" size="2xl" fontWeight="bold">
            Decentralized Education Platform
          </Heading>
          <Text fontSize="xl" maxW="2xl">
            A secure and transparent way to manage academic records using blockchain technology.
          </Text>
        </VStack>
      </Container>
    </Box>
  );
};

export default LandingPage;
