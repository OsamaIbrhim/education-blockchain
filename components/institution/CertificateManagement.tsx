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
import { useLanguage } from 'context/LanguageContext';

interface CertificateManagementProps {
  certificates: Certificate[];
  onIssueCertificate: (studentAddress: string, certificate: { title: string; metadata: any }) => Promise<boolean>;
  loading: boolean;
}

export const CertificateManagement: React.FC<CertificateManagementProps> = ({
  certificates,
  onIssueCertificate,
  loading,
}) => {
  const { t } = useLanguage();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [studentAddress, setStudentAddress] = React.useState('');
  const [studentName, setStudentName] = React.useState('');
  const [degree, setDegree] = React.useState('bachelor');
  const [grade, setGrade] = React.useState('');
  const [percentage, setPercentage] = React.useState<number>(0);
  const [totalScore, setTotalScore] = React.useState<number>(0);
  const [maxScore, setMaxScore] = React.useState<number>(0);
  const [stamps, setStamps] = React.useState('');

  const handleSubmit = async () => {
    const title = `${t('certificateTitlePrefix')} ${t(degree)} ${t('inInformationTechnology')}`;
    const metadata = {
      studentName,
      degree: t(degree),
      grade: t(grade),
      stamps,
      totalScore,
      maxScore,
      percentage,
    };

    await onIssueCertificate(studentAddress, { title, metadata });
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
          <HStack justify="space-between" mb={6}>
            <Text fontSize="xl" fontWeight="bold">
              {t('totalCertificates')}: {certificates.length}
            </Text>
            <Button
              colorScheme="blue"
              onClick={onOpen}
              isLoading={loading}
            >
              {t('issueNewCertificate')}
            </Button>
          </HStack>

          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>{t('studentAddress')}</Th>
                <Th>{t('studentName')}</Th>
                <Th>{t('degree')}</Th>
                <Th>{t('grade')}</Th>
                <Th>{t('issueDate')}</Th>
                <Th>{t('status')}</Th>
              </Tr>
            </Thead>
            <Tbody>
              {certificates.map((cert, index) => (
                <Tr key={index}>
                  <Td maxW="180px" overflow="hidden" textOverflow="ellipsis" whiteSpace="nowrap" title={cert.studentAddress}>
                    {cert.studentAddress}
                  </Td>
                  <Td maxW="180px" title={cert.metadata?.studentName}>
                    {cert.metadata?.studentName || '-'}
                  </Td>
                  <Td maxW="180px" title={cert.metadata?.degree}>
                    {cert.metadata?.degree || '-'}
                  </Td>
                  <Td maxW="180px" title={cert.metadata?.grade}>
                    {cert.metadata?.grade || '-'}
                  </Td>
                  <Td>{new Date(cert.issueDate).toLocaleDateString()}</Td>
                  <Td>
                    <Badge
                      colorScheme={cert.status === 'issued' ? 'green' : 'yellow'}
                    >
                      {cert.status === 'issued' ? t('issued') : t('pending')}
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
          <ModalHeader>{t('issueNewCertificate')}</ModalHeader>
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>{t('studentAddress')}</FormLabel>
                <Input
                  value={studentAddress}
                  onChange={(e) => setStudentAddress(e.target.value)}
                  placeholder="0x..."
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>{t('studentName')}</FormLabel>
                <Input
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder={t('enterFullStudentName')}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>{t('degree')}</FormLabel>
                <Select
                  value={degree}
                  onChange={(e) => setDegree(e.target.value)}
                >
                  <option value="bachelor">{t('bachelor')}</option>
                  <option value="master">{t('master')}</option>
                  <option value="phd">{t('phd')}</option>
                </Select>
              </FormControl>

              <FormControl isRequired>
                <FormLabel>{t('grade')}</FormLabel>
                <Select
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                >
                  <option value="excellentWithHonors">{t('excellentWithHonors')}</option>
                  <option value="excellent">{t('excellent')}</option>
                  <option value="veryGood">{t('veryGood')}</option>
                  <option value="good">{t('good')}</option>
                  <option value="pass">{t('pass')}</option>
                </Select>
              </FormControl>

              <HStack width="100%" spacing={4}>
                <FormControl isRequired>
                  <FormLabel>{t('percentage')}</FormLabel>
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
                  <FormLabel>{t('totalScore')}</FormLabel>
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
                  <FormLabel>{t('maxScore')}</FormLabel>
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
                <FormLabel>{t('stamps')}</FormLabel>
                <Textarea
                  value={stamps}
                  onChange={(e) => setStamps(e.target.value)}
                  placeholder={t('enterStampsInfo')}
                />
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              {t('cancel')}
            </Button>
            <Button
              colorScheme="blue"
              onClick={handleSubmit}
              isLoading={loading}
            >
              {t('issue')}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};