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
  useColorModeValue
} from '@chakra-ui/react';
import { AddIcon } from '@chakra-ui/icons';
import ResultsModal from './ResultsModal';
import { Exam, ExamData, ExamResult, ExamStatistics } from '../../types/examManagement';
import { useLanguage } from 'context/LanguageContext';

interface ExamResultsProps {
  exams: ExamData[];
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
  const { t, language } = useLanguage();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const handleSubmitResult = async (result: ExamResult): Promise<boolean> => {
    if (!selectedExamId) {
      toast({
        title: t('pleaseSelectExam'),
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return false;
    }

    try {
      await onSubmitResults(selectedExamId, [...results, result]);
      toast({
        title: t('resultAdded'),
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      onClose();
      return true;
    } catch (error: any) {
      toast({
        title: t('errorOccurred'),
        description: error.message || t('unknownError'),
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
          <HStack justify="space-between">
            <Heading size="lg">{t('examResults')}</Heading>
            <Button leftIcon={<AddIcon />} colorScheme="blue" onClick={onOpen} isDisabled={!selectedExamId}>
              {t('addResult')}
            </Button>
          </HStack>

          {/* Exam Selection */}
          <Box mt={4} mb={6}>
            <Select
              placeholder={t('selectExamPlaceholder')}
              value={selectedExamId || ''}
              onChange={(e) => onSelectExam(e.target.value)}
              pr={language === 'ar' ? 8 : 8}
              pl={language === 'ar' ? 8 : 8}
            >
              {exams.map((exam) => (
                <option key={exam.address} value={exam.address}>
                  {exam.title}
                </option>
              ))}
            </Select>
          </Box>

          {/* Statistics */}
          {statistics && (
            <Box>
              <Heading size="md" mb={4}>{t('statistics')}</Heading>
              <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }} gap={4}>
                <StatGroup>
                  <Stat>
                    <StatLabel>{t('totalStudents')}</StatLabel>
                    <StatNumber>{statistics.totalStudents}</StatNumber>
                  </Stat>
                </StatGroup>

                <StatGroup>
                  <Stat>
                    <StatLabel>{t('passRate')}</StatLabel>
                    <StatNumber>{statistics.passRate}%</StatNumber>
                  </Stat>
                </StatGroup>

                <StatGroup>
                  <Stat>
                    <StatLabel>{t('averageScore')}</StatLabel>
                    <StatNumber>{statistics.averageScore.toFixed(2)}</StatNumber>
                  </Stat>
                </StatGroup>
              </Grid>

              <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={4} mt={4}>
                <Box>
                  <Text fontWeight="bold" mb={2}>{t('gradeDistribution')}</Text>
                  <VStack align="start">
                    <Text>A: {statistics.aCount} {t('students')}</Text>
                    <Text>B: {statistics.bCount} {t('students')}</Text>
                    <Text>C: {statistics.cCount} {t('students')}</Text>
                    <Text>D: {statistics.dCount} {t('students')}</Text>
                    <Text>F: {statistics.fCount} {t('students')}</Text>
                  </VStack>
                </Box>

                <Box>
                  <Text fontWeight="bold" mb={2}>{t('mostCommonGrade')}</Text>
                  <Badge colorScheme={getGradeColor(statistics.mostCommonGrade)} fontSize="lg">
                    {statistics.mostCommonGrade}
                  </Badge>
                </Box>
              </Grid>
            </Box>
          )}

          {/* Results Table */}
          <Box>
            <Heading size="md" mb={4}>{t('resultsList')}</Heading>
            {results.length > 0 ? (
              <Box overflowX="auto">
                <Table variant="simple">
                  <Thead>
                    <Tr>
                      <Th>{t('studentAddress')}</Th>
                      <Th>{t('score')}</Th>
                      <Th>{t('grade')}</Th>
                      <Th>{t('notes')}</Th>
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
                        {/* <Td>{result.notes}</Td> */}
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
            ) : (
              <Text textAlign="center" color="gray.500">
                {t('noResultsYet')}
              </Text>
            )}
          </Box>
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