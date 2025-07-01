import { Box, Container, HStack, Text, Link, useColorModeValue } from '@chakra-ui/react';

const Footer = () => {
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('red.100', 'red.700');
  const mutedTextColor = useColorModeValue('gray.600', 'gray.400');

  return (
    <Box
      position="fixed"
      bottom="0"
      left="0"
      right="0"
      bg={cardBg}
      borderTop="1px solid"
      borderColor={borderColor}
      py={4}
      px={8}
      shadow="lg"
      zIndex={999}
    >
      <Container maxW="container.xl">
        <HStack justify="space-between" align="center">
          <HStack spacing={4}>
            <Text fontSize="sm" color={mutedTextColor}>
              نظام الشهادات اللامركزي - Decentralized Certificate System
            </Text>
            <Link href="/about" color="red.500" fontSize="sm">
              عن النظام - About
            </Link>
            <Link href="/contact" color="red.500" fontSize="sm">
              تواصل معنا - Contact
            </Link>
          </HStack>
        </HStack>
      </Container>
    </Box>
  );
};

export default Footer;