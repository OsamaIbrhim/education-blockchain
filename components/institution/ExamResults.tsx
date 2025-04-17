// ExamResults component
import React from 'react';
import {
  Box,
  VStack,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  useDisclosure,
  Stat,
  StatLabel,
  StatNumber,
  StatGroup,
  Grid,
  Text,
  Badge,
  HStack,
  useToast,
  Select,
  Spinner,
  Center,
} from '@chakra-ui/react';
import { AddIcon } from '@chakra-ui/icons';
import ResultsModal from './ResultsModal';
import { Exam, ExamResult, ExamStatistics } from '../../types/institution';

interface ExamResultsProps {
  exams: Exam[];
  selectedExamId: string | null;
  onSelectExam: (examId: string) => void;
  results: ExamResult[];
  statistics: ExamStatistics | null;
  onSubmitResults: (examId: string, results: ExamResult[]) => Promise<boolean>;
  loading: boolean;
}

export function ExamResults({
  exams,
  selectedExamId,
  onSelectExam,
  results,
  statistics,
  onSubmitResults,
  loading
}: ExamResultsProps) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const handleSubmitResult = async (result: ExamResult): Promise<boolean> => {
    if (!selectedExamId) {
      toast({
        title: 'يرجى اختيار اختبار | Please select an exam',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return false;
    }

    try {
      await onSubmitResults(selectedExamId, [...results, result]);
      toast({
        title: 'تم إضافة النتيجة بنجاح | Result added successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      onClose();
      return true;
    } catch (error: any) {
      toast({
        title: 'حدث خطأ | Error occurred',
        description: error.message || 'Unknown error occurred',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return false;
    }
  };

  const getGradeColor = (grade: string) => {
    const colors: { [key: string]: string } = {
      'A': 'green',
      'B': 'blue',
      'C': 'yellow',
      'D': 'orange',
      'F': 'red'
    };
    return colors[grade] || 'gray';
  };

  if (loading) {
    return (
      <Center p={8}>
        <Spinner size="xl" />
      </Center>
    );
  }

  return (
    <Box>
      <VStack spacing={6} align="stretch">
        <HStack justify="space-between">
          <Heading size="lg">نتائج الاختبار | Exam Results</Heading>
          <Button leftIcon={<AddIcon />} colorScheme="blue" onClick={onOpen} isDisabled={!selectedExamId}>
            إضافة نتيجة | Add Result
          </Button>
        </HStack>

        {/* Exam Selection */}
        <Box>
          <Text mb={2}>اختر الاختبار | Select Exam</Text>
          <Select
            placeholder="اختر اختبار | Select an exam"
            value={selectedExamId || ''}
            onChange={(e) => onSelectExam(e.target.value)}
          >
            {exams.map((exam) => (
              <option key={exam.id} value={exam.id}>
                {exam.title}
              </option>
            ))}
          </Select>
        </Box>

        {/* Statistics */}
        {statistics && (
          <Box>
            <Heading size="md" mb={4}>الإحصائيات | Statistics</Heading>
            <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }} gap={4}>
              <StatGroup>
                <Stat>
                  <StatLabel>إجمالي الطلاب | Total Students</StatLabel>
                  <StatNumber>{statistics.totalStudents}</StatNumber>
                </Stat>
              </StatGroup>

              <StatGroup>
                <Stat>
                  <StatLabel>نسبة النجاح | Pass Rate</StatLabel>
                  <StatNumber>{statistics.passRate}%</StatNumber>
                </Stat>
              </StatGroup>

              <StatGroup>
                <Stat>
                  <StatLabel>متوسط الدرجات | Average Score</StatLabel>
                  <StatNumber>{statistics.averageScore.toFixed(2)}</StatNumber>
                </Stat>
              </StatGroup>
            </Grid>

            <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={4} mt={4}>
              <Box>
                <Text fontWeight="bold" mb={2}>توزيع الدرجات | Grade Distribution</Text>
                <VStack align="start">
                  <Text>A: {statistics.aCount} طالب</Text>
                  <Text>B: {statistics.bCount} طالب</Text>
                  <Text>C: {statistics.cCount} طالب</Text>
                  <Text>D: {statistics.dCount} طالب</Text>
                  <Text>F: {statistics.fCount} طالب</Text>
                </VStack>
              </Box>

              <Box>
                <Text fontWeight="bold" mb={2}>الدرجة الأكثر شيوعاً | Most Common Grade</Text>
                <Badge colorScheme={getGradeColor(statistics.mostCommonGrade)} fontSize="lg">
                  {statistics.mostCommonGrade}
                </Badge>
              </Box>
            </Grid>
          </Box>
        )}

        {/* Results Table */}
        <Box>
          <Heading size="md" mb={4}>قائمة النتائج | Results List</Heading>
          {results.length > 0 ? (
            <Box overflowX="auto">
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>عنوان الطالب | Student Address</Th>
                    <Th>الدرجة | Score</Th>
                    <Th>التقدير | Grade</Th>
                    <Th>ملاحظات | Notes</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {results.map((result, index) => (
                    <Tr key={index}>
                      <Td>{result.studentAddress}</Td>
                      <Td>{result.score}</Td>
                      <Td>
                        <Badge colorScheme={getGradeColor(result.grade)}>
                          {result.grade}
                        </Badge>
                      </Td>
                      <Td>{result.notes}</Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          ) : (
            <Text textAlign="center" color="gray.500">
              لا توجد نتائج بعد | No results yet
            </Text>
          )}
        </Box>
      </VStack>

      <ResultsModal
        isOpen={isOpen}
        onClose={onClose}
        onSubmit={handleSubmitResult}
        loading={loading}
      />
    </Box>
  );
} 