import React from 'react';
import {
  Box,
  Button,
  VStack,
  Text,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  FormControl,
  FormLabel,
  Input,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  useColorModeValue,
  Select,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Textarea,
  HStack,
  Divider,
} from '@chakra-ui/react';
import { Certificate } from '../../types/certificate';

interface CertificateManagementProps {
  certificates: Certificate[];
  onIssueCertificate: (studentAddress: string, certificate: { title: string; description: string }) => Promise<boolean>;
  loading: boolean;
}

export const CertificateManagement: React.FC<CertificateManagementProps> = ({
  certificates,
  onIssueCertificate,
  loading,
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [studentAddress, setStudentAddress] = React.useState('');
  const [studentName, setStudentName] = React.useState('');
  const [degree, setDegree] = React.useState('بكالوريوس');
  const [grade, setGrade] = React.useState('');
  const [percentage, setPercentage] = React.useState<number>(0);
  const [totalScore, setTotalScore] = React.useState<number>(0);
  const [maxScore, setMaxScore] = React.useState<number>(0);
  const [stamps, setStamps] = React.useState('');

  const handleSubmit = async () => {
    const title = `شهادة ${degree} في تقنية المعلومات`;
    const description = `
      اسم الطالب: ${studentName}
      الدرجة العلمية: ${degree}
      التقدير العام: ${grade}
      النسبة المئوية: ${percentage}%
      مجموع الدرجات: ${totalScore} من ${maxScore}
      الأختام: ${stamps}
    `;

    // I should make the data ipfs hash and save it
    // const ipfsHash = await saveToIPFS({ title, description });

    await onIssueCertificate(studentAddress, { title, description });
    onClose();
    // Reset form
    setStudentAddress('');
    setStudentName('');
    setGrade('');
    setPercentage(0);
    setTotalScore(0);
    setMaxScore(0);
    setStamps('');
  };

  const bgColor = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  return (
    <Box>
      <VStack spacing={6} align="stretch">
        <Box 
          p={6} 
          bg={bgColor} 
          borderRadius="xl" 
          borderWidth="1px" 
          borderColor={borderColor}
          shadow="sm"
        >
          <HStack justify="space-between" mb={4}>
            <Text fontSize="xl" fontWeight="bold">
              إجمالي الشهادات المصدرة | Total Certificates: {certificates.length}
            </Text>
            <Button 
              colorScheme="blue" 
              onClick={onOpen}
              isLoading={loading}
            >
              إصدار شهادة جديدة | Issue New Certificate
            </Button>
          </HStack>

          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>عنوان الطالب | Student Address</Th>
                <Th>اسم الطالب | Student Name</Th>
                <Th>الدرجة العلمية | Degree</Th>
                <Th>التقدير | Grade</Th>
                <Th>تاريخ الإصدار | Issue Date</Th>
                <Th>الحالة | Status</Th>
              </Tr>
            </Thead>
            <Tbody>
              {certificates.map((cert, index) => (
                <Tr key={index}>
                  <Td fontSize="sm">{cert.studentAddress}</Td>
                  <Td>{cert.title.split(' ')[1]}</Td>
                  <Td>{cert.title.split(' ')[0]}</Td>
                  <Td>{cert.description.split('\n')[2].split(': ')[1]}</Td>
                  <Td>{new Date(cert.issueDate).toLocaleDateString()}</Td>
                  <Td>
                    <Badge 
                      colorScheme={cert.status === 'issued' ? 'green' : 'yellow'}
                    >
                      {cert.status === 'issued' ? 'تم الإصدار | Issued' : 'معلق | Pending'}
                    </Badge>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      </VStack>

      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay backdropFilter="blur(10px)" />
        <ModalContent>
          <ModalHeader>إصدار شهادة جديدة | Issue New Certificate</ModalHeader>
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>عنوان الطالب | Student Address</FormLabel>
                <Input
                  value={studentAddress}
                  onChange={(e) => setStudentAddress(e.target.value)}
                  placeholder="0x..."
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>اسم الطالب | Student Name</FormLabel>
                <Input
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="أدخل اسم الطالب الكامل"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>الدرجة العلمية | Degree</FormLabel>
                <Select
                  value={degree}
                  onChange={(e) => setDegree(e.target.value)}
                >
                  <option value="بكالوريوس">بكالوريوس | Bachelor</option>
                  <option value="ماجستير">ماجستير | Master</option>
                  <option value="دكتوراه">دكتوراه | PhD</option>
                </Select>
              </FormControl>

              <FormControl isRequired>
                <FormLabel>التقدير العام | Grade</FormLabel>
                <Select
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                >
                  <option value="ممتاز مع مرتبة الشرف">ممتاز مع مرتبة الشرف | Excellent with Honors</option>
                  <option value="ممتاز">ممتاز | Excellent</option>
                  <option value="جيد جداً">جيد جداً | Very Good</option>
                  <option value="جيد">جيد | Good</option>
                  <option value="مقبول">مقبول | Pass</option>
                </Select>
              </FormControl>

              <HStack width="100%" spacing={4}>
                <FormControl isRequired>
                  <FormLabel>النسبة المئوية | Percentage</FormLabel>
                  <NumberInput
                    value={percentage}
                    onChange={(_, value) => setPercentage(value)}
                    min={0}
                    max={100}
                  >
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>مجموع الدرجات | Total Score</FormLabel>
                  <NumberInput
                    value={totalScore}
                    onChange={(_, value) => setTotalScore(value)}
                  >
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>من أصل | Max Score</FormLabel>
                  <NumberInput
                    value={maxScore}
                    onChange={(_, value) => setMaxScore(value)}
                  >
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>
              </HStack>

              <FormControl isRequired>
                <FormLabel>الأختام | Stamps</FormLabel>
                <Textarea
                  value={stamps}
                  onChange={(e) => setStamps(e.target.value)}
                  placeholder="أدخل معلومات الأختام والتوقيعات"
                />
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              إلغاء | Cancel
            </Button>
            <Button 
              colorScheme="blue" 
              onClick={handleSubmit}
              isLoading={loading}
            >
              إصدار | Issue
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}; 