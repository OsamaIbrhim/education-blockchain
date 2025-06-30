import React from 'react';
import { Box, Heading, Text, Button, VStack } from '@chakra-ui/react';
import Link from 'next/link';
import { useLanguage } from 'context/LanguageContext';

const NotFoundPage = () => {
  const { t } = useLanguage();
  return (
    <Box minH="100vh" display="flex" alignItems="center" justifyContent="center" bg="gray.900">
      <VStack spacing={6} py={50} px={200} bg="gray.800" boxShadow="2xl">
        <Heading size="2xl" color="teal.400">404</Heading>
        <Text fontSize="xl" color="white">{t('pageNotFound')}</Text>
        <Text color="gray.300">{t('pageNotFoundDesc')}</Text>
        <Link href="/" passHref legacyBehavior>
          <Button colorScheme="teal">{t('backToHome')}</Button>
        </Link>
      </VStack>
    </Box>
  );
};

export default NotFoundPage;
