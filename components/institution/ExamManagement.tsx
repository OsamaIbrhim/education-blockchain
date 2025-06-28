import React, { useState } from 'react';
import {
  Box,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  VStack,
  Heading,
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
  Textarea,
  HStack,
  useToast,
  Stat,
  StatLabel,
  StatNumber,
  StatGroup,
  Grid,
  Flex,
  useColorModeValue
} from '@chakra-ui/react';
import { AddIcon, ViewIcon } from '@chakra-ui/icons';
import { Exam, ExamData, NewExam } from '../../types/examManagement';
import ExamList from './ExamList';
import { uploadPdfToIPFS } from 'utils/ipfsUtils';
import { useLanguage } from 'context/LanguageContext';

interface ExamManagementProps {
  exams: ExamData[];
  onCreateExam: (exam: NewExam) => Promise<any>;
  onUpdateStatus: (examId: string, exam: any) => Promise<boolean>;
  onRegisterStudents: (examId: string, students: string[]) => Promise<boolean>;
  loading: boolean;
}

export function ExamManagement({
  exams,
  onCreateExam,
  onUpdateStatus,
  onRegisterStudents,
  loading
}: ExamManagementProps) {
  const { t } = useLanguage();
  const { isOpen: isCreateOpen, onOpen: onCreateOpen, onClose: onCreateClose } = useDisclosure();
  const { isOpen: isEnrollOpen, onOpen: onEnrollOpen, onClose: onEnrollClose } = useDisclosure();
  const [selectedExamId, setSelectedExamId] = useState<string>('');
  const [newExam, setNewExam] = useState({
    title: '',
    description: '',
    date: '',
    duration: '',
    ipfsHash: '',
    pdfFile: null as unknown as File
  });
  const [studentAddresses, setStudentAddresses] = useState<string>('');
  const toast = useToast();

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const exam = await onCreateExam({
        address: '',
        title: newExam.title,
        description: newExam.description,
        date: new Date(newExam.date).getTime(),
        duration: parseInt(newExam.duration),
        ipfsHash: newExam.ipfsHash,
        pdfFile: newExam.pdfFile,
      });

      if (exam) {
        toast({
          title: t('examCreated'),
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        onCreateClose();
        setNewExam({ title: '', description: '', date: '', duration: '', ipfsHash: '', pdfFile: null as unknown as File });
      }
    } catch (error: any) {
      toast({
        title: t('errorOccurred'),
        description: error.message || t('unknownError'),
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleEnrollSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const addresses = studentAddresses
        .split('\n')
        .map(addr => addr.trim())
        .filter(addr => addr !== '');

      const success = await onRegisterStudents(selectedExamId, addresses);
      if (success) {
        toast({
          title: t('studentsEnrolled'),
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        onEnrollClose();
        setStudentAddresses('');
      }
    } catch (error: any) {
      toast({
        title: t('errorOccurred'),
        description: error.message || t('unknownError'),
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleStatusUpdate = async (examId: string, exam: any) => {
    try {
      const success = await onUpdateStatus(examId, exam);
      if (success) {
        toast({
          title: t('examStatusUpdated'),
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error: any) {
      toast({
        title: t('errorOccurred'),
        description: error.message || t('unknownError'),
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Statistics
  const totalExams = exams.length;
  const activeExams = exams.filter(exam => exam.status === 'IN_PROGRESS').length;
  const completedExams = exams.filter(exam => exam.status === 'COMPLETED').length;
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
            <Heading size="lg">{t('examManagement')}</Heading>
            <Button leftIcon={<AddIcon />} colorScheme="blue" onClick={onCreateOpen}>
              {t('createNewExam')}
            </Button>
          </HStack>

          {/* Statistics */}
          <StatGroup>
            <Grid templateColumns="repeat(3, 1fr)" gap={4} w="100%">
              <Stat>
                <StatLabel>{t('totalExams')}</StatLabel>
                <StatNumber>{totalExams}</StatNumber>
              </Stat>
              <Stat>
                <StatLabel>{t('activeExams')}</StatLabel>
                <StatNumber>{activeExams}</StatNumber>
              </Stat>
              <Stat>
                <StatLabel>{t('completedExams')}</StatLabel>
                <StatNumber>{completedExams}</StatNumber>
              </Stat>
            </Grid>
          </StatGroup>

          {/* Exams Table */}
          <Box overflowX="auto">
            <ExamList
              exams={exams}
              onUpdateStatus={handleStatusUpdate}
              onSelectExam={(exam) => {
                setSelectedExamId(exam.address);
                onEnrollOpen();
              }}
              onOpenResultsModal={() => { }}
            />
          </Box>
        </Box>
      </VStack>

      {/* Create Exam Modal */}
      <Modal isOpen={isCreateOpen} onClose={onCreateClose}>
        <ModalOverlay />
        <ModalContent>
          <form onSubmit={handleCreateSubmit}>
            <ModalHeader>{t('createNewExam')}</ModalHeader>
            <ModalBody>
              <VStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>{t('examTitle')}</FormLabel>
                  <Input
                    value={newExam.title}
                    onChange={e => setNewExam({ ...newExam, title: e.target.value })}
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>{t('examPdfFile')}</FormLabel>
                  <Input
                    type="file"
                    accept="application/pdf"
                    onChange={(e) => {
                      const target = e.target as HTMLInputElement;
                      const file = target.files?.[0];
                      if (file) {
                        setNewExam((prev) => ({ ...prev, pdfFile: file }));
                      }
                    }}
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>{t('examDescription')}</FormLabel>
                  <Textarea
                    value={newExam.description}
                    onChange={e => setNewExam({ ...newExam, description: e.target.value })}
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>{t('examDate')}</FormLabel>
                  <Input
                    type="datetime-local"
                    value={newExam.date}
                    onChange={e => setNewExam({ ...newExam, date: e.target.value })}
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>{t('examDuration')}</FormLabel>
                  <Input
                    type="number"
                    value={newExam.duration}
                    onChange={e => setNewExam({ ...newExam, duration: e.target.value })}
                  />
                </FormControl>
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button type="submit" colorScheme="blue" mr={3} isLoading={loading}>
                {t('create')}
              </Button>
              <Button onClick={onCreateClose}>{t('cancel')}</Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>

      {/* Enroll Student Modal */}
      <Modal isOpen={isEnrollOpen} onClose={onEnrollClose}>
        <ModalOverlay />
        <ModalContent>
          <form onSubmit={handleEnrollSubmit}>
            <ModalHeader>{t('enrollStudent')}</ModalHeader>
            <ModalBody>
              <FormControl isRequired>
                <FormLabel>{t('studentAddress')}</FormLabel>
                <Textarea
                  value={studentAddresses}
                  onChange={e => setStudentAddresses(e.target.value)}
                  placeholder="0x...&#x0a;0x...&#x0a;..."
                />
              </FormControl>
            </ModalBody>
            <ModalFooter>
              <Button type="submit" colorScheme="blue" mr={3} isLoading={loading}>
                {t('enroll')}
              </Button>
              <Button onClick={onEnrollClose}>{t('cancel')}</Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </Box>
  );
}