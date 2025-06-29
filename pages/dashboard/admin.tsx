import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
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
  Input,
  InputGroup,
  InputLeftAddon,
  useToast,
} from '@chakra-ui/react';
import { FaShieldAlt } from 'react-icons/fa';
import { useAppData } from 'hooks/useAppData';
import { useLanguage } from 'context/LanguageContext';
import { useRouter } from 'next/router';

export default function AdminDashboard() {
  const { t } = useLanguage();
  const { userRole, isUserOwner, account, addAdmin: addAdminFromHook, adminStatistics: initialAdminStatistics, getUsersByRole } = useAppData();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [adminData, setAdminData] = useState({
    address: '',
    nationalId: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    email: '',
  });
  const [showAddAdminForm, setShowAddAdminForm] = useState(false);
  const [adminStatistics, setAdminStatistics] = useState({
    studentCount: 0,
    employerCount: 0,
    adminCount: 0,
    totalUserCount: 0,
  });
  const [selectedUserType, setSelectedUserType] = useState<string | null>(null);
  const [userDetails, setUserDetails] = useState<any[]>([]);
  const [isUserDetailsLoading, setIsUserDetailsLoading] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (userRole && userRole !== 'admin') {
      router.replace('/');
    }
    setTimeout(() => setLoading(false), 2000);
  }, [userRole, router]);

  useEffect(() => {
    setAdminStatistics(initialAdminStatistics);
  }, [initialAdminStatistics]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAdminData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddAdmin = async () => {
    if (
      !adminData.address ||
      !adminData.nationalId ||
      !adminData.firstName ||
      !adminData.lastName ||
      !adminData.phoneNumber ||
      !adminData.email
    ) {
      toast({
        title: t('error'),
        description: t('pleaseFillAllFields'),
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    try {
      await addAdminFromHook(adminData);
      toast({
        title: t('success'),
        description: t('adminAddedSuccessfully'),
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      setAdminData({
        address: '',
        nationalId: '',
        firstName: '',
        lastName: '',
        phoneNumber: '',
        email: '',
      });

      // Update admin statistics
      setAdminStatistics((prevStats) => ({
        ...prevStats,
        adminCount: prevStats.adminCount + 1,
        totalUserCount: prevStats.totalUserCount + 1,
      }));
      setShowAddAdminForm(false);
    } catch (error) {
      console.error('Failed to add admin:', error);
      toast({
        title: t('error'),
        description: t('failedToAddAdmin'),
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleStatClick = async (userType: string) => {
    setSelectedUserType(userType);
    setIsUserDetailsLoading(true);
    try {
      let users = new Map<string, any>();
      if (userType === 'students') {
        users = await getUsersByRole(1); // Role 1 for students
      } else if (userType === 'admins') {
        users = await getUsersByRole(3); // Role 3 for admins
      } else if (userType === 'employers') {
        users = await getUsersByRole(2); // Role 2 for employers
      }
      setUserDetails(Array.from(users.values())); // Convert Map values to array for rendering
    } catch (error) {
      console.error('Failed to fetch user details:', error);
    } finally {
      setIsUserDetailsLoading(false);
    }
  };

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
              {isUserOwner &&
                <>
                  <Box p={6} borderRadius="xl" shadow="xl" borderWidth="1px">
                    <Heading size="md" mb={4}>{t('viewStatistics')}</Heading>
                    <Button mt={4} colorScheme="blue" onClick={() => setShowAddAdminForm(false)}>
                      {t('viewStatistics')}
                    </Button>
                  </Box>
                  <Box p={6} borderRadius="xl" shadow="xl" borderWidth="1px">
                    <Heading size="md" mb={4}>{t('adminStatic')}</Heading>
                    <Button mt={4} colorScheme="blue" onClick={() => setShowAddAdminForm(true)}>
                      {t('addAdmin')}
                    </Button>
                  </Box>
                </>
              }
            </VStack>
          </GridItem>

          {/* Main Content */}
          <GridItem colSpan={{ base: 12, lg: 9 }}>
            {loading ? (
              Array.from({ length: 1 }).map((_, index) => (
                <Skeleton key={index} height="350px" borderRadius="xl" />
              ))
            ) : showAddAdminForm ? (
              <Box borderRadius="xl" shadow="xl" borderWidth="1px" p={6}>
                <Heading size="md" mb={4}>{t('addAdmin')}</Heading>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                  <FormControl isRequired>
                    <FormLabel>{t('adminWalletAddress')}</FormLabel>
                    <Input
                      name="address"
                      placeholder={t('enterAdminWalletAddress')}
                      value={adminData.address}
                      onChange={handleInputChange}
                    />
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel>{t('nationalId')}</FormLabel>
                    <Input
                      type="number"
                      name="nationalId"
                      placeholder={t('enterNationalId')}
                      value={adminData.nationalId}
                      onChange={handleInputChange}
                    />
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel>{t('firstName')}</FormLabel>
                    <Input
                      name="firstName"
                      placeholder={t('enterFirstName')}
                      value={adminData.firstName}
                      onChange={handleInputChange}
                    />
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel>{t('lastName')}</FormLabel>
                    <Input
                      name="lastName"
                      placeholder={t('enterLastName')}
                      value={adminData.lastName}
                      onChange={handleInputChange}
                    />
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel>{t('phoneNumber')}</FormLabel>
                    <InputGroup>
                      <Input
                        type="number"
                        name="phoneNumber"
                        placeholder={t('enterPhoneNumber')}
                        value={adminData.phoneNumber}
                        onChange={handleInputChange}
                      />
                    </InputGroup>
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel>{t('email')}</FormLabel>
                    <Input
                      type="email"
                      name="email"
                      placeholder={t('enterEmail')}
                      value={adminData.email}
                      onChange={handleInputChange}
                    />
                  </FormControl>
                </SimpleGrid>
                <Button mt={6} colorScheme="blue" onClick={handleAddAdmin}>
                  {t('submet')}
                </Button>
              </Box>
            ) : (
              selectedUserType ? (
                <Box borderRadius="xl" shadow="xl" borderWidth="1px" p={6}>
                  <Heading size="md" mb={4}>{t(`${selectedUserType}Details`)}</Heading>
                  {isUserDetailsLoading ? (
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                      {Array.from({ length: 4 }).map((_, index) => (
                        <Skeleton key={index} height="150px" borderRadius="xl" />
                      ))}
                    </SimpleGrid>
                  ) : (
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                      {userDetails.map((user, index) => (
                        <Box key={index} p={6} borderRadius="xl" shadow="md" borderWidth="1px">
                          <Text><strong>{t('address')}:</strong> {user.address}</Text>
                          <Text><strong>{t('role')}:</strong> {user.role}</Text>
                          <Text><strong>{t('nationalId')}:</strong> {user.nationalId}</Text>
                          <Text><strong>{t('firstName')}:</strong> {user.firstName}</Text>
                          <Text><strong>{t('lastName')}:</strong> {user.lastName}</Text>
                          <Text><strong>{t('email')}:</strong> {user.email}</Text>
                          <Text><strong>{t('phoneNumber')}:</strong> {user.phoneNumber}</Text>
                        </Box>
                      ))}
                    </SimpleGrid>
                  )}
                  <Button mt={6} colorScheme="blue" onClick={() => setSelectedUserType(null)}>
                    {t('backToStats')}
                  </Button>
                </Box>
              ) : (
                <Box borderRadius="xl" shadow="xl" borderWidth="1px" p={6}>
                  <Heading size="md" mb={4}>{t('adminStatistics')}</Heading>
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                    <Box p={6} borderRadius="xl" shadow="md" borderWidth="1px" cursor="pointer" onClick={() => handleStatClick('students')}>
                      <Stat>
                        <StatLabel>{t('studentsCount')}</StatLabel>
                        <StatNumber>{adminStatistics?.studentCount || 0}</StatNumber>
                      </Stat>
                    </Box>
                    <Box p={6} borderRadius="xl" shadow="md" borderWidth="1px" cursor="pointer" onClick={() => handleStatClick('admins')}>
                      <Stat>
                        <StatLabel>{t('AdminsCount')}</StatLabel>
                        <StatNumber>{adminStatistics?.adminCount || 0}</StatNumber>
                      </Stat>
                    </Box>
                    <Box p={6} borderRadius="xl" shadow="md" borderWidth="1px" cursor="pointer" onClick={() => handleStatClick('employers')}>
                      <Stat>
                        <StatLabel>{t('employersCount')}</StatLabel>
                        <StatNumber>{adminStatistics?.employerCount || 0}</StatNumber>
                      </Stat>
                    </Box>
                    <Box p={6} borderRadius="xl" shadow="md" borderWidth="1px">
                      <Stat>
                        <StatLabel>{t('totalUserCount')}</StatLabel>
                        <StatNumber>{adminStatistics?.totalUserCount || 0}</StatNumber>
                      </Stat>
                    </Box>
                  </SimpleGrid>
                </Box>
              )
            )}
          </GridItem>
        </Grid>
      </Container>
    </Box>
  );
}
