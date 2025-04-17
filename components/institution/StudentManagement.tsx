import React, { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  useToast,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  HStack,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  Text,
  Icon,
  Flex,
  InputGroup,
  InputLeftElement,
} from '@chakra-ui/react';
import { FaUserPlus, FaUserGraduate, FaSearch } from 'react-icons/fa';

interface Student {
  id: string;
  address: string;
  name: string;
  email: string;
  enrollmentDate: string;
  status: 'active' | 'inactive' | 'graduated';
}

interface Props {
  students: Student[];
  onAddStudent: (student: Omit<Student, 'id'>) => Promise<boolean>;
  onUpdateStatus: (studentId: string, status: Student['status']) => Promise<boolean>;
  loading: boolean;
}

export const StudentManagement: React.FC<Props> = ({
  students,
  onAddStudent,
  onUpdateStatus,
  loading,
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [searchTerm, setSearchTerm] = useState('');
  const [newStudent, setNewStudent] = useState({
    address: '',
    name: '',
    email: '',
    status: 'active' as Student['status'],
  });
  const toast = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const success = await onAddStudent({
        ...newStudent,
        enrollmentDate: new Date().toISOString(),
      });
      if (success) {
        toast({
          title: "تمت إضافة الطالب بنجاح | Student added successfully",
          status: "success",
          duration: 3000,
        });
        onClose();
        setNewStudent({
          address: '',
          name: '',
          email: '',
          status: 'active',
        });
      }
    } catch (error: any) {
      toast({
        title: "حدث خطأ | Error occurred",
        description: error.message || "Please try again",
        status: "error",
        duration: 3000,
      });
    }
  };

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: Student['status']) => {
    switch (status) {
      case 'active':
        return 'green';
      case 'inactive':
        return 'red';
      case 'graduated':
        return 'blue';
      default:
        return 'gray';
    }
  };

  return (
    <Box>
      <Flex justify="space-between" align="center" mb={6}>
        <HStack spacing={4}>
          <Button
            leftIcon={<FaUserPlus />}
            colorScheme="blue"
            onClick={onOpen}
            isLoading={loading}
          >
            إضافة طالب | Add Student
          </Button>
          <Box>
            <FormControl>
              <InputGroup>
                <InputLeftElement pointerEvents="none">
                  <Icon as={FaSearch} color="gray.500" />
                </InputLeftElement>
                <Input
                  placeholder="بحث عن طالب | Search students"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
            </FormControl>
          </Box>
        </HStack>
        <Text fontSize="sm" color="gray.500">
          إجمالي الطلاب: {students.length} | Total Students: {students.length}
        </Text>
      </Flex>

      <Box overflowX="auto">
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>الاسم | Name</Th>
              <Th>العنوان | Address</Th>
              <Th>البريد الإلكتروني | Email</Th>
              <Th>تاريخ التسجيل | Enrollment Date</Th>
              <Th>الحالة | Status</Th>
              <Th>الإجراءات | Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {filteredStudents.map((student) => (
              <Tr key={student.id}>
                <Td>{student.name}</Td>
                <Td>
                  <Text fontSize="sm" fontFamily="monospace">
                    {student.address.slice(0, 6)}...{student.address.slice(-4)}
                  </Text>
                </Td>
                <Td>{student.email}</Td>
                <Td>{new Date(student.enrollmentDate).toLocaleDateString()}</Td>
                <Td>
                  <Badge colorScheme={getStatusColor(student.status)}>
                    {student.status.toUpperCase()}
                  </Badge>
                </Td>
                <Td>
                  <HStack spacing={2}>
                    <Button
                      size="sm"
                      colorScheme={student.status === 'active' ? 'red' : 'green'}
                      onClick={() => onUpdateStatus(student.id, student.status === 'active' ? 'inactive' : 'active')}
                      isLoading={loading}
                    >
                      {student.status === 'active' ? 'تعطيل | Deactivate' : 'تفعيل | Activate'}
                    </Button>
                    {student.status === 'active' && (
                      <Button
                        size="sm"
                        colorScheme="blue"
                        onClick={() => onUpdateStatus(student.id, 'graduated')}
                        isLoading={loading}
                      >
                        تخريج | Graduate
                      </Button>
                    )}
                  </HStack>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>

      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>إضافة طالب جديد | Add New Student</ModalHeader>
          <ModalCloseButton />
          <form onSubmit={handleSubmit}>
            <ModalBody>
              <VStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>عنوان المحفظة | Wallet Address</FormLabel>
                  <Input
                    value={newStudent.address}
                    onChange={(e) => setNewStudent({ ...newStudent, address: e.target.value })}
                    placeholder="0x..."
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>الاسم | Name</FormLabel>
                  <Input
                    value={newStudent.name}
                    onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                    placeholder="اسم الطالب | Student name"
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>البريد الإلكتروني | Email</FormLabel>
                  <Input
                    type="email"
                    value={newStudent.email}
                    onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                    placeholder="student@example.com"
                  />
                </FormControl>
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onClose}>
                إلغاء | Cancel
              </Button>
              <Button
                type="submit"
                colorScheme="blue"
                isLoading={loading}
                leftIcon={<FaUserGraduate />}
              >
                إضافة | Add
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </Box>
  );
}; 