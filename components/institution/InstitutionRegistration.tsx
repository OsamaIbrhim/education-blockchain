import React, { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  useToast,
  Text,
  Textarea,
  Image,
  Center,
  Icon,
  Grid,
  GridItem,
  Heading,
  Badge,
  Divider,
  List,
  ListItem,
  ListIcon,
} from '@chakra-ui/react';
import { FaBuilding, FaUpload, FaCheckCircle, FaTimesCircle, FaGraduationCap, FaCertificate, FaUsers } from 'react-icons/fa';
import { useIPFS } from '../../hooks/useIPFS';

interface InstitutionData {
  name: string;
  description: string;
  address: string;
  email: string;
  phone: string;
  website: string;
  logo: string;
  services: string[];
  type: string;
  registrationNumber: string;
}

interface Props {
  onSubmit: (data: InstitutionData) => Promise<boolean>;
  isLoading: boolean;
  isVerified: boolean;
}

export const InstitutionRegistration: React.FC<Props> = ({ onSubmit, isLoading, isVerified }) => {
  const [institutionData, setInstitutionData] = useState<InstitutionData>({
    name: '',
    description: '',
    address: '',
    email: '',
    phone: '',
    website: '',
    logo: '',
    services: [],
    type: '',
    registrationNumber: '',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const toast = useToast();
  const { uploadToIPFS } = useIPFS();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (imageFile) {
        const ipfsHash = await uploadToIPFS(imageFile);
        const success = await onSubmit({
          ...institutionData,
          logo: ipfsHash,
        });
        if (success) {
          toast({
            title: "تم تقديم طلب التسجيل بنجاح | Registration submitted successfully",
            status: "success",
            duration: 5000,
          });
        }
      }
    } catch (error: any) {
      toast({
        title: "حدث خطأ | Error occurred",
        description: error.message || "Please try again",
        status: "error",
        duration: 5000,
      });
    }
  };

  return (
    <Grid templateColumns={{ base: "1fr", lg: "2fr 1fr" }} gap={8}>
      <GridItem>
        <Box
          as="form"
          onSubmit={handleSubmit}
          bg="white"
          p={8}
          borderRadius="xl"
          shadow="lg"
          border="1px"
          borderColor="gray.200"
        >
          <VStack spacing={6} align="stretch">
            <Heading size="lg" textAlign="center" mb={4}>
              تسجيل المؤسسة | Institution Registration
            </Heading>

            <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={6}>
              <FormControl isRequired>
                <FormLabel>اسم المؤسسة | Institution Name</FormLabel>
                <Input
                  value={institutionData.name}
                  onChange={(e) => setInstitutionData({ ...institutionData, name: e.target.value })}
                  placeholder="أدخل اسم المؤسسة | Enter institution name"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>رقم التسجيل | Registration Number</FormLabel>
                <Input
                  value={institutionData.registrationNumber}
                  onChange={(e) => setInstitutionData({ ...institutionData, registrationNumber: e.target.value })}
                  placeholder="أدخل رقم التسجيل | Enter registration number"
                />
              </FormControl>
            </Grid>

            <FormControl isRequired>
              <FormLabel>الوصف | Description</FormLabel>
              <Textarea
                value={institutionData.description}
                onChange={(e) => setInstitutionData({ ...institutionData, description: e.target.value })}
                placeholder="وصف المؤسسة وأهدافها | Institution description and objectives"
                rows={4}
              />
            </FormControl>

            <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={6}>
              <FormControl isRequired>
                <FormLabel>البريد الإلكتروني | Email</FormLabel>
                <Input
                  type="email"
                  value={institutionData.email}
                  onChange={(e) => setInstitutionData({ ...institutionData, email: e.target.value })}
                  placeholder="example@domain.com"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>رقم الهاتف | Phone</FormLabel>
                <Input
                  type="tel"
                  value={institutionData.phone}
                  onChange={(e) => setInstitutionData({ ...institutionData, phone: e.target.value })}
                  placeholder="+1234567890"
                />
              </FormControl>
            </Grid>

            <FormControl>
              <FormLabel>الموقع الإلكتروني | Website</FormLabel>
              <Input
                type="url"
                value={institutionData.website}
                onChange={(e) => setInstitutionData({ ...institutionData, website: e.target.value })}
                placeholder="https://example.com"
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>شعار المؤسسة | Institution Logo</FormLabel>
              <Box
                border="2px dashed"
                borderColor="gray.300"
                borderRadius="md"
                p={4}
                textAlign="center"
                cursor="pointer"
                onClick={() => document.getElementById('logo-upload')?.click()}
              >
                {imagePreview ? (
                  <Image src={imagePreview} alt="Logo preview" maxH="200px" mx="auto" />
                ) : (
                  <Center flexDir="column" h="200px">
                    <Icon as={FaUpload} w={10} h={10} color="gray.400" />
                    <Text mt={2}>اضغط لرفع الشعار | Click to upload logo</Text>
                  </Center>
                )}
                <Input
                  id="logo-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  hidden
                />
              </Box>
            </FormControl>

            <Button
              type="submit"
              colorScheme="blue"
              size="lg"
              isLoading={isLoading}
              loadingText="جاري التسجيل | Registering..."
              isDisabled={!isVerified}
            >
              تسجيل المؤسسة | Register Institution
            </Button>
          </VStack>
        </Box>
      </GridItem>

      <GridItem>
        <VStack spacing={6}>
          <Box
            bg="white"
            p={6}
            borderRadius="xl"
            shadow="lg"
            border="1px"
            borderColor="gray.200"
            w="full"
          >
            <Heading size="md" mb={4}>
              حالة التسجيل | Registration Status
            </Heading>
            <Badge
              colorScheme={isVerified ? "green" : "yellow"}
              p={2}
              borderRadius="md"
              w="full"
              textAlign="center"
            >
              {isVerified ? "تم التحقق | Verified" : "في انتظار التحقق | Pending Verification"}
            </Badge>
          </Box>

          <Box
            bg="white"
            p={6}
            borderRadius="xl"
            shadow="lg"
            border="1px"
            borderColor="gray.200"
            w="full"
          >
            <Heading size="md" mb={4}>
              الوظائف المتاحة | Available Functions
            </Heading>
            <List spacing={3}>
              <ListItem>
                <ListIcon as={FaGraduationCap} color="blue.500" />
                إدارة الاختبارات | Exam Management
              </ListItem>
              <ListItem>
                <ListIcon as={FaCertificate} color="green.500" />
                إصدار الشهادات | Certificate Issuance
              </ListItem>
              <ListItem>
                <ListIcon as={FaUsers} color="purple.500" />
                إدارة الطلاب | Student Management
              </ListItem>
            </List>
          </Box>
        </VStack>
      </GridItem>
    </Grid>
  );
}; 