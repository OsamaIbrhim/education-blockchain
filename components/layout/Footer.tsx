import { Box, Container, HStack, Text, Link, useMultiStyleConfig } from '@chakra-ui/react';

const Footer = () => {
  const styles = useMultiStyleConfig('Footer');

  return (
    <Box sx={styles.container}>
      <Container maxW="container.xl">
        <HStack justify="space-between" align="center">
          <HStack spacing={4}>
            <Text sx={styles.text}>
              نظام الشهادات اللامركزي - Decentralized Certificate System
            </Text>
            <Link href="/about" sx={styles.link}>
              عن النظام - About
            </Link>
            <Link href="/contact" sx={styles.link}>
              تواصل معنا - Contact
            </Link>
          </HStack>
        </HStack>
      </Container>
    </Box>
  );
};

export default Footer;