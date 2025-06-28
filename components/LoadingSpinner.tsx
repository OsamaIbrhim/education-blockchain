import React from 'react';
import { Center, VStack, Spinner, Text, Progress, useColorModeValue } from '@chakra-ui/react';
import { useLanguage } from 'context/LanguageContext';

const LoadingSpinner = () => {
  const { t } = useLanguage();

  return (
    <Center h="100vh" bg={useColorModeValue('gray.50', 'gray.900')}>
      <VStack spacing={4}>
        <Spinner size="xl" color="red.500" thickness="4px" speed="0.65s" />
        <Text fontSize="lg">{t('loading')}</Text>
        <Progress size="xs" isIndeterminate width="200px" colorScheme="red" />
      </VStack>
    </Center>
  );
};

export default LoadingSpinner;
