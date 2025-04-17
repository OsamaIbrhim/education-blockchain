import { SimpleGrid, Box, Stat, StatLabel, StatNumber, useColorModeValue } from '@chakra-ui/react';

export default function StatsGrid() {
  const bgColor = useColorModeValue('white', 'gray.800');

  return (
    <SimpleGrid columns={{ base: 1, md: 3 }} spacing={5}>
      <Box p={5} shadow="md" borderWidth="1px" bg={bgColor} borderRadius="lg">
        <Stat>
          <StatLabel>المؤسسات المسجلة - Registered Institutions</StatLabel>
          <StatNumber>0</StatNumber>
        </Stat>
      </Box>
      <Box p={5} shadow="md" borderWidth="1px" bg={bgColor} borderRadius="lg">
        <Stat>
          <StatLabel>المؤسسات المعتمدة - Verified Institutions</StatLabel>
          <StatNumber>0</StatNumber>
        </Stat>
      </Box>
      <Box p={5} shadow="md" borderWidth="1px" bg={bgColor} borderRadius="lg">
        <Stat>
          <StatLabel>الشهادات المصدرة - Issued Certificates</StatLabel>
          <StatNumber>0</StatNumber>
        </Stat>
      </Box>
    </SimpleGrid>
  );
} 