import React from 'react';
import {
  Box,
  VStack,
  Text,
  Image,
  useColorModeValue,
  Center,
  Divider,
  HStack,
} from '@chakra-ui/react';
import { InstitutionStamp } from './InstitutionStamp';
import { Institution } from '../../types/institution';

interface CertificateTemplateProps {
  studentName: string;
  degree: string;
  grade: string;
  percentage: number;
  totalScore: number;
  maxScore: number;
  institution: Institution;
  issueDate: string;
  certificateId: string;
}

export const CertificateTemplate: React.FC<CertificateTemplateProps> = ({
  studentName,
  degree,
  grade,
  percentage,
  totalScore,
  maxScore,
  institution,
  issueDate,
  certificateId,
}) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.800', 'white');

  return (
    <Box
      w="1000px"
      h="700px"
      bg={bgColor}
      border="2px"
      borderColor={borderColor}
      borderRadius="lg"
      p={8}
      position="relative"
      overflow="hidden"
    >
      {/* Watermark */}
      {institution.logo && (
        <Box
          position="absolute"
          top="50%"
          left="50%"
          transform="translate(-50%, -50%)"
          opacity={0.05}
          width="80%"
          height="80%"
          backgroundImage={`url(${institution.logo})`}
          backgroundSize="contain"
          backgroundPosition="center"
          backgroundRepeat="no-repeat"
          zIndex={1}
        />
      )}

      {/* Certificate Content */}
      <VStack spacing={8} position="relative" zIndex={2}>
        {/* Header */}
        <HStack spacing={4} w="100%" justify="space-between">
          <Image src={institution.logo} alt="Institution Logo" h="100px" />
          <VStack>
            <Text fontSize="3xl" fontWeight="bold" color={textColor}>
              {institution.name}
            </Text>
            <Text fontSize="xl" color={textColor}>
              {institution.university}
            </Text>
          </VStack>
          <Box w="100px" /> {/* Spacer for alignment */}
        </HStack>

        <Divider borderWidth="2px" borderColor={borderColor} />

        {/* Title */}
        <Text
          fontSize="4xl"
          fontWeight="bold"
          color={textColor}
          textAlign="center"
          fontFamily="serif"
          bgGradient="linear(to-r, blue.400, purple.500)"
          bgClip="text"
        >
          شهادة {degree}
        </Text>

        {/* Main Content */}
        <VStack spacing={6} textAlign="center">
          <Text fontSize="xl" color={textColor}>
            نشهد أن الطالب/ة
          </Text>
          <Text
            fontSize="3xl"
            fontWeight="bold"
            color={textColor}
            fontFamily="serif"
          >
            {studentName}
          </Text>
          <Text fontSize="xl" color={textColor}>
            قد أتم/ت بنجاح متطلبات {degree}
          </Text>
          <Text fontSize="xl" color={textColor}>
            بتقدير: {grade}
          </Text>
          <Text fontSize="lg" color={textColor}>
            بنسبة {percentage}% ومجموع درجات {totalScore} من {maxScore}
          </Text>
        </VStack>

        {/* Footer */}
        <Box mt="auto">
          <HStack spacing={12} justify="space-between" w="100%" mt={8}>
            <VStack>
              <Text fontSize="lg" color={textColor}>تاريخ الإصدار</Text>
              <Text fontSize="md" color={textColor}>{new Date(issueDate).toLocaleDateString('ar-EG')}</Text>
            </VStack>
            
            <InstitutionStamp institution={institution} size={120} />
            
            <VStack>
              <Text fontSize="lg" color={textColor}>رقم الشهادة</Text>
              <Text fontSize="md" color={textColor}>{certificateId}</Text>
            </VStack>
          </HStack>
        </Box>

        {/* Border Design */}
        <Box
          position="absolute"
          top="0"
          left="0"
          right="0"
          bottom="0"
          border="15px double"
          borderColor="rgba(0,0,0,0.1)"
          borderRadius="lg"
          pointerEvents="none"
        />
      </VStack>
    </Box>
  );
}; 