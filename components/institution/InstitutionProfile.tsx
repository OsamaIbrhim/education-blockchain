import React, { useState, useCallback, useEffect } from 'react';
import {
  Box,
  VStack,
  FormControl,
  FormLabel,
  Input,
  Button,
  Image,
  Text,
  useToast,
  Card,
  CardBody,
  Select,
  Textarea,
  HStack,
  IconButton,
  Container,
  SimpleGrid,
  Heading,
  Divider,
  useColorModeValue,
  InputGroup,
  InputLeftElement,
  InputLeftAddon,
  FormHelperText,
  Badge,
  Flex,
  Icon,
  Tooltip,
  Spinner,
} from '@chakra-ui/react';
import { DeleteIcon, PhoneIcon, EmailIcon, LinkIcon, InfoIcon } from '@chakra-ui/icons';
import { FaUniversity, FaGraduationCap, FaBuilding, FaCloudUploadAlt } from 'react-icons/fa';
import { useIPFS } from '../../hooks/useIPFS';
import { getFromIPFS, getCIDFromContract, getImageUrlFromIPFS } from '../../utils/ipfsUtils';
import { getUserData } from '../../services/identity';
import { Institution } from '../../types/institution';

interface InstitutionProfileProps {
  onSave: (data: Institution) => Promise<void>;
  initialData?: Institution;
  loading?: boolean;
  contract: any;
  userAddress?: string;
}

export default function InstitutionProfile({
  onSave,
  initialData,
  loading = false,
  contract,
  userAddress,
}: InstitutionProfileProps) {
  const [data, setData] = useState<Institution>(
    initialData || {
      name: '',
      address: '',
      imageIpfsCid: undefined,
      logo: '',
      ministry: '',
      university: '',
      college: '',
      description: '',
      imageUrl: '',
      website: '',
      email: '',
      phone: '',
      isVerified: false, // Added missing property
    }
  );
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageLoading, setImageLoading] = useState<boolean>(false);
  const [loadingProfile, setLoadingProfile] = useState<boolean>(false);
  const [hasChanges, setHasChanges] = useState<boolean>(false);
  const [originalData, setOriginalData] = useState<Institution | null>(null);
  const toast = useToast();

  // Initialize the IPFS hook with the contract instance
  const { upload, setCID, getData, uploadAndSetCID, getDataFromContract, isLoading, error } = useIPFS();

  const bgColor = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const labelColor = useColorModeValue('gray.600', 'gray.300');
  const cardBg = useColorModeValue('white', 'gray.800');

  // Load profile data from IPFS if a CID exists for the user
  useEffect(() => {
    const fetchProfileData = async () => {
      if (!contract || !userAddress) return;
      
      try {
        setLoadingProfile(true);
        const userData = await getUserData(userAddress);
        
        if (userData && userData.ipfsHash && userData.ipfsHash !== '') {
          const profileData = await getFromIPFS(userData.ipfsHash);
          if (profileData) {
            // Ensure we don't display image if imageIpfsCid is removed
            if (!profileData.imageIpfsCid) {
              profileData.imageUrl = '';
            }else{
              profileData.imageUrl = getImageUrlFromIPFS(profileData.imageIpfsCid);
            }
            
            setData(profileData);
            setOriginalData(profileData);
            setHasChanges(false);
            toast({
              title: 'تم تحميل البيانات | Data loaded',
              description: 'تم تحميل بيانات المؤسسة من السلسلة | Institution data loaded from blockchain',
              status: 'success',
              duration: 3000,
              isClosable: true,
            });
          }
        }
      } catch (err: any) {
        console.error('Error loading profile data:', err);
        toast({
          title: 'خطأ في تحميل البيانات | Error loading data',
          description: err.message,
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchProfileData();
  }, [contract, userAddress, toast]);

  // Check for changes when data changes
  useEffect(() => {
    if (originalData && Object.keys(originalData).length > 0) {
      // Check if any field has changed
      const isChanged = Object.keys(data).some(key => {
        // Skip lastUpdated when comparing
        if (key === 'lastUpdated') return false;
        // @ts-ignore
        return data[key] !== originalData[key];
      });
      setHasChanges(isChanged || imageFile !== null);
    } else {
      // If we don't have original data yet or it's empty, assume we're creating new data
      setHasChanges(true);
    }
  }, [data, originalData, imageFile]);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: 'حجم الصورة كبير جداً | Image too large',
          description: 'يجب أن يكون حجم الصورة أقل من 5 ميجابايت | Image must be less than 5MB',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      setImageFile(file);
      // Create temporary local URL for preview
      setData({ ...data, imageUrl: URL.createObjectURL(file) });
      setHasChanges(true);

      // Upload image to IPFS
      try {
        setImageLoading(true);
        
        // Convert image file to base64 for IPFS upload
        const reader = new FileReader();
        reader.onloadend = async () => {
          try {
            // Upload image to IPFS
            const imageData = {
              filename: file.name,
              mimetype: file.type,
              content: reader.result
            };
            
            const imageCid = await upload(imageData, `institution-logo-${Date.now()}`);
            
            // Update data with the IPFS CID
            setData(prev => ({ 
              ...prev, 
              imageIpfsCid: imageCid,
              // Keep the local URL for preview
            }));
            
            toast({
              title: 'تم رفع الصورة | Image uploaded',
              description: 'تم رفع الصورة إلى IPFS بنجاح | Image uploaded to IPFS successfully',
              status: 'success',
              duration: 3000,
              isClosable: true,
            });
          } catch (error: any) {
            toast({
              title: 'خطأ في رفع الصورة | Error uploading image',
              description: error.message,
              status: 'error',
              duration: 3000,
              isClosable: true,
            });
          } finally {
            setImageLoading(false);
          }
        };
        reader.readAsDataURL(file);
      } catch (error: any) {
        setImageLoading(false);
        toast({
          title: 'خطأ في رفع الصورة | Error uploading image',
          description: error.message,
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!process.env.NEXT_PUBLIC_IDENTITY_CONTRACT_ADDRESS) {
      toast({
        title: 'خطأ في الاتصال | Connection error',
        description: 'لا يمكن الاتصال بالعقد الذكي | Cannot connect to smart contract',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      // Prepare the data for IPFS storage
      const profileData = {
        ...data,
        lastUpdated: new Date().toISOString()
      };

      // Upload complete profile data to IPFS and store the CID in the contract
      const result = await uploadAndSetCID(profileData, userAddress ?? 'unknown-user');
      
      // Call the parent onSave callback with the updated data
      await onSave(profileData);
      
      toast({
        title: 'تم حفظ البيانات بنجاح | Data saved successfully',
        description: `تم تخزين البيانات في IPFS ورمز CID: ${result.cid} | Data stored in IPFS with CID: ${result.cid}`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error: any) {
      toast({
        title: 'خطأ في حفظ البيانات | Error saving data',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setData({ ...data, imageUrl: '', imageIpfsCid: undefined });
    setHasChanges(true);
  };

  // Display error message if IPFS operations fail
  useEffect(() => {
    if (error) {
      toast({
        title: 'خطأ في عملية IPFS | IPFS operation error',
        description: error,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  }, [error, toast]);

  const updateField = (field: string, value: string) => {
    setData({ ...data, [field]: value });
  };

  if (loadingProfile) {
    return (
      <Container centerContent py={20}>
        <VStack spacing={6}>
          <Spinner size="xl" />
          <Text>جاري تحميل بيانات المؤسسة... | Loading institution data...</Text>
        </VStack>
      </Container>
    );
  }

  return (
    <Container maxW="container.xl" py={8}>
      <Card bg={cardBg} shadow="xl" borderRadius="xl" borderWidth="1px" borderColor={borderColor}>
        <CardBody>
          <form onSubmit={handleSubmit}>
            <VStack spacing={8} align="stretch">
              <Box textAlign="center" pb={6}>
                <Heading size="lg" mb={2}>
                  بيانات المؤسسة | Institution Details
                </Heading>
                <Text color={labelColor}>
                  أدخل معلومات مؤسستك التعليمية | Enter your educational institution information
                </Text>
              </Box>

              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
                {/* Logo Section */}
                <Box>
                  <FormControl>
                    <FormLabel fontSize="lg" color={labelColor}>
                      شعار المؤسسة | Institution Logo
                    </FormLabel>
                    <Box
                      borderWidth="2px"
                      borderStyle="dashed"
                      borderColor={borderColor}
                      borderRadius="xl"
                      p={6}
                      textAlign="center"
                      position="relative"
                      bg={useColorModeValue('gray.50', 'gray.700')}
                      transition="all 0.3s"
                      _hover={{ borderColor: 'blue.400' }}
                    >
                      {imageLoading ? (
                        <VStack spacing={3}>
                          <Spinner size="xl" />
                          <Text>جاري رفع الصورة... | Uploading image...</Text>
                        </VStack>
                      ) : data.imageIpfsCid ? (
                        <Box position="relative">
                          <Image
                            src={data.imageUrl || `https://ipfs.io/ipfs/${data.imageIpfsCid}`}
                            alt="Institution logo"
                            maxH="200px"
                            mx="auto"
                            objectFit="contain"
                            borderRadius="lg"
                          />
                          <IconButton
                            aria-label="Remove image"
                            icon={<DeleteIcon />}
                            position="absolute"
                            top={2}
                            right={2}
                            colorScheme="red"
                            size="sm"
                            onClick={removeImage}
                          />
                          {data.imageIpfsCid && (
                            <Badge
                              position="absolute"
                              bottom={2}
                              right={2}
                              colorScheme="green"
                              px={2}
                              py={1}
                              borderRadius="md"
                            >
                              IPFS: {data.imageIpfsCid.substring(0, 8)}...
                            </Badge>
                          )}
                        </Box>
                      ) : (
                        <VStack spacing={3}>
                          <Icon as={FaBuilding} boxSize={12} color="gray.400" />
                          <Button
                            as="label"
                            htmlFor="image-upload"
                            colorScheme="blue"
                            variant="outline"
                            leftIcon={<Icon as={FaCloudUploadAlt} />}
                          >
                            اختر شعار المؤسسة | Choose Logo
                            <Input
                              id="image-upload"
                              type="file"
                              accept="image/*"
                              onChange={handleImageChange}
                              display="none"
                            />
                          </Button>
                          <Text fontSize="sm" color={labelColor}>
                            PNG, JPG حتى 5MB - سيتم رفع الصورة إلى IPFS
                          </Text>
                        </VStack>
                      )}
                    </Box>
                  </FormControl>
                </Box>

                {/* Basic Information */}
                <VStack spacing={6}>
                  <FormControl isRequired>
                    <FormLabel fontSize="lg" color={labelColor}>
                      اسم المؤسسة | Institution Name
                    </FormLabel>
                    <InputGroup>
                      <InputLeftElement>
                        <Icon as={FaUniversity} color="gray.500" />
                      </InputLeftElement>
                      <Input
                        value={data.name}
                        onChange={(e) => updateField('name', e.target.value)}
                        placeholder="أدخل اسم المؤسسة | Enter institution name"
                        bg={bgColor}
                        size="lg"
                      />
                    </InputGroup>
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel fontSize="lg" color={labelColor}>
                      الوزارة التابعة لها | Ministry
                    </FormLabel>
                    <InputGroup>
                      <InputLeftElement>
                        <Icon as={FaBuilding} color="gray.500" />
                      </InputLeftElement>
                      <Select
                        value={data.ministry}
                        onChange={(e) => updateField('ministry', e.target.value)}
                        placeholder="اختر الوزارة | Select ministry"
                        bg={bgColor}
                        size="lg"
                      >
                        <option value="education">وزارة التعليم | Ministry of Education</option>
                        <option value="higher-education">وزارة التعليم العالي | Ministry of Higher Education</option>
                        <option value="other">أخرى | Other</option>
                      </Select>
                    </InputGroup>
                  </FormControl>
                </VStack>
              </SimpleGrid>

              <Divider my={6} />

              {/* Academic Information */}
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                <FormControl isRequired>
                  <FormLabel fontSize="lg" color={labelColor}>
                    الجامعة | University
                  </FormLabel>
                  <InputGroup>
                    <InputLeftElement>
                      <Icon as={FaUniversity} color="gray.500" />
                    </InputLeftElement>
                    <Input
                      value={data.university}
                      onChange={(e) => updateField('university', e.target.value)}
                      placeholder="أدخل اسم الجامعة | Enter university name"
                      bg={bgColor}
                      size="lg"
                    />
                  </InputGroup>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel fontSize="lg" color={labelColor}>
                    الكلية | College
                  </FormLabel>
                  <InputGroup>
                    <InputLeftElement>
                      <Icon as={FaGraduationCap} color="gray.500" />
                    </InputLeftElement>
                    <Input
                      value={data.college}
                      onChange={(e) => updateField('college', e.target.value)}
                      placeholder="أدخل اسم الكلية | Enter college name"
                      bg={bgColor}
                      size="lg"
                    />
                  </InputGroup>
                </FormControl>
              </SimpleGrid>

              <FormControl isRequired>
                <FormLabel fontSize="lg" color={labelColor}>
                  وصف المؤسسة | Description
                </FormLabel>
                <Textarea
                  value={data.description}
                  onChange={(e) => updateField('description', e.target.value)}
                  placeholder="أدخل وصف المؤسسة | Enter institution description"
                  bg={bgColor}
                  size="lg"
                  minH="150px"
                />
                <FormHelperText>
                  وصف موجز عن المؤسسة ورسالتها | Brief description about the institution and its mission
                </FormHelperText>
              </FormControl>

              <Divider my={6} />

              {/* Contact Information */}
              <Box>
                <Heading size="md" mb={6}>
                  معلومات الاتصال | Contact Information
                </Heading>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                  <FormControl isRequired>
                    <FormLabel fontSize="lg" color={labelColor}>
                      البريد الإلكتروني | Email
                    </FormLabel>
                    <InputGroup>
                      <InputLeftElement>
                        <EmailIcon color="gray.500" />
                      </InputLeftElement>
                      <Input
                        type="email"
                        value={data.email}
                        onChange={(e) => updateField('email', e.target.value)}
                        placeholder="example@institution.edu"
                        bg={bgColor}
                        size="lg"
                      />
                    </InputGroup>
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel fontSize="lg" color={labelColor}>
                      رقم الهاتف | Phone Number
                    </FormLabel>
                    <InputGroup>
                      <InputLeftAddon children="+966" bg={bgColor} />
                      <Input
                        type="tel"
                        value={data.phone}
                        onChange={(e) => updateField('phone', e.target.value)}
                        placeholder="5XXXXXXXX"
                        bg={bgColor}
                        size="lg"
                      />
                    </InputGroup>
                  </FormControl>

                  <FormControl gridColumn={{ md: '1 / -1' }}>
                    <FormLabel fontSize="lg" color={labelColor}>
                      الموقع الإلكتروني | Website
                    </FormLabel>
                    <InputGroup>
                      <InputLeftElement>
                        <LinkIcon color="gray.500" />
                      </InputLeftElement>
                      <Input
                        type="url"
                        value={data.website}
                        onChange={(e) => updateField('website', e.target.value)}
                        placeholder="https://www.example.edu"
                        bg={bgColor}
                        size="lg"
                      />
                    </InputGroup>
                  </FormControl>
                </SimpleGrid>
              </Box>

              <Flex justify="flex-end" mt={8}>
                <Button
                  type="submit"
                  colorScheme="blue"
                  size="lg"
                  isLoading={loading || isLoading}
                  loadingText="جاري الحفظ... | Saving..."
                  leftIcon={<Icon as={FaUniversity} />}
                  px={8}
                  isDisabled={!hasChanges}
                >
                  حفظ البيانات على السلسلة | Save to Blockchain
                </Button>
              </Flex>
            </VStack>
          </form>
        </CardBody>
      </Card>
    </Container>
  );
} 