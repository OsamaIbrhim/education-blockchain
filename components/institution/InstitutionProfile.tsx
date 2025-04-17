import React, { useState, useCallback } from 'react';
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
} from '@chakra-ui/react';
import { DeleteIcon, PhoneIcon, EmailIcon, LinkIcon, InfoIcon } from '@chakra-ui/icons';
import { FaUniversity, FaGraduationCap, FaBuilding } from 'react-icons/fa';

interface InstitutionProfileProps {
  onSave: (data: InstitutionData) => Promise<void>;
  initialData?: InstitutionData;
  loading?: boolean;
}

export interface InstitutionData {
  name: string;
  ministry: string;
  university: string;
  college: string;
  description: string;
  imageUrl: string;
  website?: string;
  email: string;
  phone: string;
}

export default function InstitutionProfile({
  onSave,
  initialData,
  loading = false,
}: InstitutionProfileProps) {
  const [data, setData] = useState<InstitutionData>(
    initialData || {
      name: '',
      ministry: '',
      university: '',
      college: '',
      description: '',
      imageUrl: '',
      website: '',
      email: '',
      phone: '',
    }
  );
  const [imageFile, setImageFile] = useState<File | null>(null);
  const toast = useToast();

  const bgColor = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const labelColor = useColorModeValue('gray.600', 'gray.300');
  const cardBg = useColorModeValue('white', 'gray.800');

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      setData({ ...data, imageUrl: URL.createObjectURL(file) });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Here you would typically upload the image first and get its URL
      // For now we'll just use the local URL
      await onSave(data);
      toast({
        title: 'تم حفظ البيانات بنجاح | Data saved successfully',
        status: 'success',
        duration: 3000,
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
    setData({ ...data, imageUrl: '' });
  };

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
                      {data.imageUrl ? (
                        <Box position="relative">
                          <Image
                            src={data.imageUrl}
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
                        </Box>
                      ) : (
                        <VStack spacing={3}>
                          <Icon as={FaBuilding} boxSize={12} color="gray.400" />
                          <Button
                            as="label"
                            htmlFor="image-upload"
                            colorScheme="blue"
                            variant="outline"
                            leftIcon={<Icon as={FaBuilding} />}
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
                            PNG, JPG حتى 5MB
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
                        onChange={(e) => setData({ ...data, name: e.target.value })}
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
                        onChange={(e) => setData({ ...data, ministry: e.target.value })}
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
                      onChange={(e) => setData({ ...data, university: e.target.value })}
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
                      onChange={(e) => setData({ ...data, college: e.target.value })}
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
                  onChange={(e) => setData({ ...data, description: e.target.value })}
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
                        onChange={(e) => setData({ ...data, email: e.target.value })}
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
                        onChange={(e) => setData({ ...data, phone: e.target.value })}
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
                        onChange={(e) => setData({ ...data, website: e.target.value })}
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
                  isLoading={loading}
                  loadingText="جاري الحفظ... | Saving..."
                  leftIcon={<Icon as={FaUniversity} />}
                  px={8}
                >
                  حفظ البيانات | Save Details
                </Button>
              </Flex>
            </VStack>
          </form>
        </CardBody>
      </Card>
    </Container>
  );
} 