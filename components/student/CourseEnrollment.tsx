import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  Heading,
  Text,
  Button,
  Checkbox,
  CheckboxGroup,
  Stack,
  useToast,
  useColorModeValue,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import { useAppData } from 'hooks/useAppData';
import { useLanguage } from 'context/LanguageContext';

interface CourseEnrollmentProps {
  onSubmit?: (selectedCourses: string[]) => void;
}

export const CourseEnrollment: React.FC<CourseEnrollmentProps> = ({ onSubmit }) => {
  const { t } = useLanguage();
  const toast = useToast();
  const { account, courses, isLoading, loadAllCourses, departments } = useAppData();
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [creditSum, setCreditSum] = useState(0);
  const [minCredits, setMinCredits] = useState(12); // TODO: fetch from contract
  const [maxCredits, setMaxCredits] = useState(21); // TODO: fetch from contract
  const [error, setError] = useState<string | null>(null);

  // Filter courses by student's department
  const department = account?.department || '';
  const departmentCourses = courses.filter((course: any) => course.department === department);

  useEffect(() => {
    loadAllCourses();
  }, [department]);

  useEffect(() => {
    // Calculate total credits
    const total = departmentCourses
      .filter((course: any) => selectedCourses.includes(course.courseId))
      .reduce((sum: number, course: any) => sum + (Number(course.credits) / 10), 0);
    setCreditSum(total);
  }, [selectedCourses, departmentCourses]);

  const handleSubmit = () => {
    if (creditSum < minCredits) {
      setError(t('minCreditsError') + ` (${minCredits})`);
      return;
    }
    if (creditSum > maxCredits) {
      setError(t('maxCreditsError') + ` (${maxCredits})`);
      return;
    }
    setError(null);
    toast({
      title: t('enrollmentSubmitted'),
      description: t('pendingAdminApproval'),
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
    if (onSubmit) onSubmit(selectedCourses);
  };

  return (
    <Box bg={useColorModeValue('white', 'gray.800')} p={6} borderRadius="xl" shadow="xl" borderWidth="1px">
      <Heading size="md" mb={4}>{t('courseEnrollment')}</Heading>
      <Text mb={2}>{t('selectCoursesForTerm')}</Text>
      <Text mb={2} color="gray.500">{t('yourDepartment')}: <b>{department}</b></Text>
      <Text mb={2} color="gray.500">{t('creditHourRange')}: <b>{minCredits} - {maxCredits}</b></Text>
      <CheckboxGroup
        value={selectedCourses}
        onChange={(value) => setSelectedCourses(value.map(String))}
      >
        <Stack direction="column" spacing={2} mb={4}>
          {departmentCourses.length === 0 && <Text>{t('noCoursesForDepartment')}</Text>}
          {departmentCourses.map((course: any) => (
            <Checkbox key={course.courseId} value={course.courseId} isDisabled={isLoading}>
              {course.name} ({course.credits} {t('credits')})
            </Checkbox>
          ))}
        </Stack>
      </CheckboxGroup>
      <Text mb={2}>{t('totalSelectedCredits')}: <b>{creditSum}</b></Text>
      {error && <Alert status="error" mb={2}><AlertIcon />{error}</Alert>}
      <Button colorScheme="blue" onClick={handleSubmit} isDisabled={isLoading || departmentCourses.length === 0}>
        {t('submitEnrollment')}
      </Button>
    </Box>
  );
};

export default CourseEnrollment;
