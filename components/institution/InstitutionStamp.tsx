import React from 'react';
import { Box, Circle, Text, VStack, useColorModeValue } from '@chakra-ui/react';
import { Institution } from '../../types/institution';

interface InstitutionStampProps {
  institution: Institution;
  size?: number;
}

export const InstitutionStamp: React.FC<InstitutionStampProps> = ({ institution, size = 150 }) => {
  const borderColor = useColorModeValue('blue.600', 'blue.400');
  const bgColor = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('blue.600', 'blue.400');

  return (
    <Circle
      size={`${size}px`}
      border="3px double"
      borderColor={borderColor}
      bg={bgColor}
      position="relative"
      overflow="hidden"
      p={4}
      role="img"
      aria-label="Institution Stamp"
    >
      {/* Inner Circle with Institution Details */}
      <VStack spacing={1} align="center">
        <Text
          fontSize={`${size * 0.12}px`}
          fontWeight="bold"
          color={textColor}
          textAlign="center"
          fontFamily="serif"
        >
          {institution.name}
        </Text>
        <Text
          fontSize={`${size * 0.08}px`}
          color={textColor}
          textAlign="center"
        >
          {institution.ministry}
        </Text>
        <Text
          fontSize={`${size * 0.08}px`}
          color={textColor}
          textAlign="center"
        >
          {institution.university}
        </Text>
        <Text
          fontSize={`${size * 0.07}px`}
          color={textColor}
          opacity={0.8}
        >
          {new Date().getFullYear()}
        </Text>
      </VStack>
    </Circle>
  );
}; 