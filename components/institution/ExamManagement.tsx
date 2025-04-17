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
  Grid
} from '@chakra-ui/react';
import { AddIcon, ViewIcon } from '@chakra-ui/icons';
import { Exam, NewExam } from '../../types/institution';

interface ExamManagementProps {
  exams: Exam[];
  onCreateExam: (exam: NewExam) => Promise<boolean>;
  onUpdateStatus: (examId: string, status: string) => Promise<boolean>;
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
  const { isOpen: isCreateOpen, onOpen: onCreateOpen, onClose: onCreateClose } = useDisclosure();
  const { isOpen: isEnrollOpen, onOpen: onEnrollOpen, onClose: onEnrollClose } = useDisclosure();
  const [selectedExamId, setSelectedExamId] = useState<string>('');
  const [newExam, setNewExam] = useState({
    title: '',
    description: '',
    date: '',
    duration: '',
    ipfsHash: ''
  });
  const [studentAddress, setStudentAddress] = useState('');
  const toast = useToast();

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const success = await onCreateExam({
        title: newExam.title,
        description: newExam.description,
        date: new Date(newExam.date).getTime(),
        duration: parseInt(newExam.duration),
        ipfsHash: newExam.ipfsHash
      });

      if (success) {
        toast({
          title: 'تم إنشاء الاختبار بنجاح | Exam created successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        onCreateClose();
        setNewExam({ title: '', description: '', date: '', duration: '', ipfsHash: '' });
      }
    } catch (error: any) {
      toast({
        title: 'حدث خطأ | Error occurred',
        description: error.message || 'Unknown error occurred',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleEnrollSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const success = await onRegisterStudents(selectedExamId, [studentAddress]);
      if (success) {
        toast({
          title: 'تم تسجيل الطالب بنجاح | Student enrolled successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        onEnrollClose();
        setStudentAddress('');
      }
    } catch (error: any) {
      toast({
        title: 'حدث خطأ | Error occurred',
        description: error.message || 'Unknown error occurred',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleStatusUpdate = async (examId: string, newStatus: string) => {
    try {
      const success = await onUpdateStatus(examId, newStatus);
      if (success) {
        toast({
          title: 'تم تحديث حالة الاختبار بنجاح | Exam status updated successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error: any) {
      toast({
        title: 'حدث خطأ | Error occurred',
        description: error.message || 'Unknown error occurred',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Statistics
  const totalExams = exams.length;
  const activeExams = exams.filter(exam => exam.status === 'active').length;
  const completedExams = exams.filter(exam => exam.status === 'completed').length;

  return (
    <Box>
      <VStack spacing={6} align="stretch">
        <HStack justify="space-between">
          <Heading size="lg">إدارة الاختبارات | Exam Management</Heading>
          <Button leftIcon={<AddIcon />} colorScheme="blue" onClick={onCreateOpen}>
            إنشاء اختبار جديد | Create New Exam
          </Button>
        </HStack>

        {/* Statistics */}
        <StatGroup>
          <Grid templateColumns="repeat(3, 1fr)" gap={4} w="100%">
            <Stat>
              <StatLabel>إجمالي الاختبارات | Total Exams</StatLabel>
              <StatNumber>{totalExams}</StatNumber>
            </Stat>
            <Stat>
              <StatLabel>الاختبارات النشطة | Active Exams</StatLabel>
              <StatNumber>{activeExams}</StatNumber>
            </Stat>
            <Stat>
              <StatLabel>الاختبارات المكتملة | Completed Exams</StatLabel>
              <StatNumber>{completedExams}</StatNumber>
            </Stat>
          </Grid>
        </StatGroup>

        {/* Exams Table */}
        <Box overflowX="auto">
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>العنوان | Title</Th>
                <Th>التاريخ | Date</Th>
                <Th>المدة | Duration</Th>
                <Th>الحالة | Status</Th>
                <Th>الإجراءات | Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {exams.map(exam => (
                <Tr key={exam.id}>
                  <Td>{exam.title}</Td>
                  <Td>{new Date(exam.date).toLocaleDateString()}</Td>
                  <Td>{exam.duration} minutes</Td>
                  <Td>
                    <Badge
                      colorScheme={
                        exam.status === 'active'
                          ? 'green'
                          : exam.status === 'completed'
                          ? 'blue'
                          : 'gray'
                      }
                    >
                      {exam.status}
                    </Badge>
                  </Td>
                  <Td>
                    <HStack spacing={2}>
                      <Button
                        size="sm"
                        leftIcon={<ViewIcon />}
                        onClick={() => {
                          setSelectedExamId(exam.id);
                          onEnrollOpen();
                        }}
                      >
                        تسجيل طالب | Enroll Student
                      </Button>
                      <Button
                        size="sm"
                        onClick={() =>
                          handleStatusUpdate(
                            exam.id,
                            exam.status === 'active' ? 'completed' : 'active'
                          )
                        }
                      >
                        {exam.status === 'active' ? 'إنهاء | Complete' : 'تنشيط | Activate'}
                      </Button>
                    </HStack>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      </VStack>

      {/* Create Exam Modal */}
      <Modal isOpen={isCreateOpen} onClose={onCreateClose}>
        <ModalOverlay />
        <ModalContent>
          <form onSubmit={handleCreateSubmit}>
            <ModalHeader>إنشاء اختبار جديد | Create New Exam</ModalHeader>
            <ModalBody>
              <VStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>العنوان | Title</FormLabel>
                  <Input
                    value={newExam.title}
                    onChange={e => setNewExam({ ...newExam, title: e.target.value })}
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>الوصف | Description</FormLabel>
                  <Textarea
                    value={newExam.description}
                    onChange={e => setNewExam({ ...newExam, description: e.target.value })}
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>التاريخ | Date</FormLabel>
                  <Input
                    type="datetime-local"
                    value={newExam.date}
                    onChange={e => setNewExam({ ...newExam, date: e.target.value })}
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>المدة (بالدقائق) | Duration (minutes)</FormLabel>
                  <Input
                    type="number"
                    value={newExam.duration}
                    onChange={e => setNewExam({ ...newExam, duration: e.target.value })}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>IPFS Hash</FormLabel>
                  <Input
                    value={newExam.ipfsHash}
                    onChange={e => setNewExam({ ...newExam, ipfsHash: e.target.value })}
                  />
                </FormControl>
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button type="submit" colorScheme="blue" mr={3} isLoading={loading}>
                إنشاء | Create
              </Button>
              <Button onClick={onCreateClose}>إلغاء | Cancel</Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>

      {/* Enroll Student Modal */}
      <Modal isOpen={isEnrollOpen} onClose={onEnrollClose}>
        <ModalOverlay />
        <ModalContent>
          <form onSubmit={handleEnrollSubmit}>
            <ModalHeader>تسجيل طالب | Enroll Student</ModalHeader>
            <ModalBody>
              <FormControl isRequired>
                <FormLabel>عنوان الطالب | Student Address</FormLabel>
                <Input
                  value={studentAddress}
                  onChange={e => setStudentAddress(e.target.value)}
                  placeholder="0x..."
                />
              </FormControl>
            </ModalBody>
            <ModalFooter>
              <Button type="submit" colorScheme="blue" mr={3} isLoading={loading}>
                تسجيل | Enroll
              </Button>
              <Button onClick={onEnrollClose}>إلغاء | Cancel</Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </Box>
  );
} 