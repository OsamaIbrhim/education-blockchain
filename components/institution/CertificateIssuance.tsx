import {
  VStack,
  Heading,
  Text,
  Button,
  FormControl,
  FormLabel,
  FormHelperText,
  Input,
  Textarea,
  Progress,
  useColorModeValue,
  Box,
  Flex
} from '@chakra-ui/react';
import { AwardIcon } from '../Icons';

interface CertificateIssuanceProps {
  studentAddress: string;
  certificateData: string;
  issuanceProgress: number;
  loading: boolean;
  onStudentAddressChange: (value: string) => void;
  onCertificateDataChange: (value: string) => void;
  onIssueCertificate: () => void;
}

export default function CertificateIssuance({
  studentAddress,
  certificateData,
  issuanceProgress,
  loading,
  onStudentAddressChange,
  onCertificateDataChange,
  onIssueCertificate
}: CertificateIssuanceProps) {
  return (
    <Box
      bg={useColorModeValue('white', 'gray.800')}
      borderRadius="xl"
      shadow="xl"
      p={6}
      borderWidth="1px"
      borderColor={useColorModeValue('gray.200', 'gray.700')}
    >
      <VStack spacing={6} align="stretch">
        <Flex justify="space-between" align="center">
          <Heading size="md">إصدار شهادة جديدة - Issue New Certificate</Heading>
          <Button colorScheme="blue" onClick={onIssueCertificate} leftIcon={<AwardIcon />}>
            إصدار شهادة جديدة - Issue New Certificate
          </Button>
        </Flex>
        <Text color={useColorModeValue('gray.600', 'gray.400')}>
          أدخل بيانات الطالب وتفاصيل الشهادة
          <br />
          Enter student details and certificate information
        </Text>
        <FormControl>
          <FormLabel fontWeight="bold">عنوان الطالب - Student Address</FormLabel>
          <Input
            value={studentAddress}
            onChange={(e) => onStudentAddressChange(e.target.value)}
            placeholder="0x..."
            size="lg"
            bg={useColorModeValue('white', 'gray.700')}
            _focus={{
              borderColor: "blue.400",
              boxShadow: "0 0 0 1px blue.400"
            }}
          />
          <FormHelperText color={useColorModeValue('gray.600', 'gray.400')}>
            يجب أن يكون العنوان صالحاً على شبكة إيثريوم
            <br />
            Must be a valid Ethereum address
          </FormHelperText>
        </FormControl>
        <FormControl mt={4}>
          <FormLabel fontWeight="bold">بيانات الشهادة - Certificate Data</FormLabel>
          <Textarea
            value={certificateData}
            onChange={(e) => onCertificateDataChange(e.target.value)}
            placeholder="أدخل تفاصيل الشهادة... - Enter certificate details..."
            size="lg"
            minH="150px"
            bg={useColorModeValue('white', 'gray.700')}
            _focus={{
              borderColor: "blue.400",
              boxShadow: "0 0 0 1px blue.400"
            }}
          />
          <FormHelperText color={useColorModeValue('gray.600', 'gray.400')}>
            أدخل جميع المعلومات المطلوبة للشهادة
            <br />
            Enter all required certificate information
          </FormHelperText>
        </FormControl>
        <Button
          colorScheme="blue"
          size="lg"
          onClick={onIssueCertificate}
          isLoading={loading}
          loadingText="جاري الإصدار... - Issuing..."
        >
          <AwardIcon mr={2} />
          إصدار الشهادة - Issue Certificate
        </Button>
        {issuanceProgress > 0 && (
          <Progress
            value={issuanceProgress}
            size="xs"
            colorScheme="blue"
            borderRadius="full"
            isAnimated
            hasStripe
          />
        )}
      </VStack>
    </Box>
  );
} 