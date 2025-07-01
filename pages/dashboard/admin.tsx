import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  GridItem,
  VStack,
  Heading,
  Text,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  Skeleton,
  SkeletonText,
  Tooltip,
  Badge,
  HStack,
  Icon,
  useColorModeValue,
} from '@chakra-ui/react';
import { FaShieldAlt } from 'react-icons/fa';
import { useAppData } from 'hooks/useAppData';
import { useLanguage } from 'context/LanguageContext';
import { useRouter } from 'next/router';

export default function AdminDashboard() {
  const { t } = useLanguage();
  const { userRole, address, account } = useAppData();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userRole && userRole !== 'admin') {
      router.replace('/');
    }
    setTimeout(() => setLoading(false), 2000);
  }, [userRole, router]);

  return (
    <Box minH="100vh">
      <Container maxW="container.xl" pb="100px">
        <Grid templateColumns="repeat(12, 1fr)" gap={6}>
          {/* Sidebar */}
          <GridItem colSpan={{ base: 12, lg: 3 }}>
            <VStack spacing={6} align="stretch">
              <Box p={6} borderRadius="xl" shadow="xl" borderWidth="1px">
                {loading ? (
                  <SkeletonText noOfLines={4} spacing="4" />
                ) : (
                  <>
                    <Heading size="md" mb={4}>
                      {account.firstName + ' ' + account.lastName || t('connectedAccount')}
                    </Heading>
                    <Text fontSize="sm" mb={2}>
                      {account?.email}
                    </Text>
                    <Text fontSize="sm" mb={2}>
                      {account?.phoneNumber}
                    </Text>
                    <Tooltip label={t('userRole')} placement="top">
                      <Badge colorScheme="red" px={3} py={1} borderRadius="full">
                        <HStack spacing={2}>
                          <Icon as={FaShieldAlt} w={4} h={4} />
                          <Text>{t('systemAdmin')}</Text>
                        </HStack>
                      </Badge>
                    </Tooltip>
                  </>
                )}
              </Box>
            </VStack>
          </GridItem>

          {/* Main Content */}
          <GridItem colSpan={{ base: 12, lg: 9 }}>
            <Box borderRadius="xl" shadow="xl" borderWidth="1px" p={6}>
              <Heading size="md" mb={4}>
                {t('universityStatistics')}
              </Heading>
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                {loading ? (
                  Array.from({ length: 3 }).map((_, index) => (
                    <Skeleton key={index} height="150px" borderRadius="xl" />
                  ))
                ) : (
                  <>
                    <Box p={6} borderRadius="xl" shadow="md" borderWidth="1px">
                      <Stat>
                        <StatLabel>{t('numberOfStudents')}</StatLabel>
                        <StatNumber>0</StatNumber>
                      </Stat>
                    </Box>
                    <Box p={6} borderRadius="xl" shadow="md" borderWidth="1px">
                      <Stat>
                        <StatLabel>{t('certificatesIssued')}</StatLabel>
                        <StatNumber>0</StatNumber>
                      </Stat>
                    </Box>
                  </>
                )}
              </SimpleGrid>
            </Box>
          </GridItem>
        </Grid>
      </Container>
    </Box>
  );
}
