import React, { useMemo } from 'react';
import {
  SimpleGrid,
  Box,
  VStack,
  Icon,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
import { keyframes } from '@emotion/react';
import { motion } from 'framer-motion';
import { FaGraduationCap, FaCertificate, FaChartBar } from 'react-icons/fa';
import { Exam, ExamStatistics } from '../../../types/examManagement';
import { Certificate } from '../../../types/certificate';

const MotionBox = motion(Box);

const pulseAnimation = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const floatAnimation = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
`;

interface InstitutionStatsGridProps {
  exams: Exam[] | undefined;
  certificates: Certificate[] | undefined;
  examStatistics: ExamStatistics | null | undefined;
}

const InstitutionStatsGrid: React.FC<InstitutionStatsGridProps> = ({ exams, certificates, examStatistics }) => {
  const statCardBg = useColorModeValue('rgba(255, 255, 255, 0.8)', 'rgba(45, 55, 72, 0.8)');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  const statsData = useMemo(() => [
    {
      label: 'إجمالي الاختبارات | Total Exams',
      value: exams?.length || '0',
      icon: FaGraduationCap,
      color: 'blue.500'
    },
    {
      label: 'الشهادات المصدرة | Issued Certificates',
      value: certificates?.length || '0',
      icon: FaCertificate,
      color: 'green.500'
    },
    {
      label: 'معدل النجاح | Success Rate',
      value: examStatistics ? `${Math.round(examStatistics.passRate)}%` : '0%',
      icon: FaChartBar,
      color: 'purple.500'
    },
  ], [exams?.length, certificates?.length, examStatistics]);

  return (
    <SimpleGrid
      columns={{ base: 1, md: 3 }}
      spacing={6}
      mb={8}
    >
      {statsData.map((stat, index) => (
        <MotionBox
          key={index}
          whileHover={{
            y: -8,
            boxShadow: '2xl',
            scale: 1.02
          }}
          whileTap={{ scale: 0.98 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 20,
            delay: index * 0.1
          }}
        >
          <Box
            bg={statCardBg}
            backdropFilter="blur(8px)"
            p={6}
            borderRadius="2xl"
            border="1px"
            borderColor={borderColor}
            position="relative"
            overflow="hidden"
            transition="all 0.3s ease"
          >
            <Box
              position="absolute"
              top={0}
              left={0}
              right={0}
              bottom={0}
              bgGradient={`linear(to-br, ${stat.color}10, transparent)`}
              opacity={0.5}
            />
            <Box
              position="absolute"
              top={0}
              left={0}
              right={0}
              h="4px"
              bgGradient={`linear(to-r, transparent, ${stat.color}, transparent)`}
              sx={{
                animation: `${pulseAnimation} 2s ease-in-out infinite`
              }}
            />
            <VStack spacing={4} align="start" position="relative">
              <Icon
                as={stat.icon}
                boxSize={10}
                color={stat.color}
                filter="drop-shadow(0px 2px 4px rgba(0,0,0,0.2))"
                sx={{
                  animation: `${floatAnimation} 3s ease-in-out infinite`
                }}
              />
              <Text
                fontSize="4xl"
                fontWeight="bold"
                bgGradient={`linear(to-r, ${stat.color}, ${stat.color})`}
                bgClip="text"
                sx={{
                  animation: `${pulseAnimation} 2s ease-in-out infinite`
                }}
              >
                {stat.value}
              </Text>
              <Text
                color="gray.500"
                fontSize="lg"
                fontWeight="medium"
              >
                {stat.label}
              </Text>
            </VStack>
          </Box>
        </MotionBox>
      ))}
    </SimpleGrid>
  );
};

export default InstitutionStatsGrid;
