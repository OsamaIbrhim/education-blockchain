import React, { useEffect, useState } from 'react';
import {
  Box,
  VStack,
  Heading,
  Text,
  Button,
  Input,
  FormControl,
  FormLabel,
  Container,
  Grid,
  GridItem,
  useMultiStyleConfig,
  Skeleton,
  Select,
  useToast,
} from '@chakra-ui/react';
import { useLanguage } from 'context/LanguageContext';
import { useAppData } from 'hooks/useAppData';

// const departments = new Map([
//   ['CS', 'Computer Science'],
//   ['Math', 'Mathematics'],
//   ['Physics', 'Physics'],
// ]);

const CoursePage = () => {
  const { t } = useLanguage();
  const { courses, isLoading: loading, addCourse, departments, addDepartment } = useAppData();
  const toast = useToast();
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(departments.length > 0 ? departments[0] : null);
  const [courseList, setCourseList] = useState(courses);
  const [isAddingCourse, setIsAddingCourse] = useState(false);
  const [isAddingDepartment, setIsAddingDepartment] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [newCourse, setNewCourse] = useState<{ id: string; name: string; credits: number | undefined; department: string }>({ id: '', name: '', credits: 0, department: '' });
  const [newDepartmentName, setNewDepartmentName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const styles = useMultiStyleConfig('CoursePage', {});

  useEffect(() => {
    if (selectedDepartment) {
      const filteredCourses = courses.filter(
        (course) =>
          course[3] === selectedDepartment &&
          (course[1].toLowerCase().includes(searchQuery.toLowerCase()) ||
            course[0].toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setCourseList(filteredCourses);
    }
  }, [selectedDepartment, courses, searchQuery]);

  const handleDepartmentClick = (department: string) => {
    setSelectedDepartment(department);
    setIsAddingCourse(false);
  };

  const handleAddCourseClick = (f: boolean) => {
    if (!f) {
      setIsAddingCourse(false);
      setNewCourse({ id: '', name: '', credits: 0, department: '' });
      return;
    }
    setIsAddingCourse(true);
  };

  const handleAddDepartmentClick = (f: boolean) => {
    if (!f) {
      setIsAddingDepartment(false);
      return;
    }
    setIsAddingDepartment(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewCourse((prev) => ({ ...prev, [name]: name === 'credits' ? Number(value) : value }));
  };

  const handleDepartmentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { value } = e.target;
    setNewCourse((prev) => ({ ...prev, department: value }));
  };

  const handleSaveCourse = async () => {
    if (
      !newCourse.department ||
      !newCourse.id ||
      !newCourse.name ||
      typeof newCourse.credits !== 'number' ||
      newCourse.credits <= 0
    ) {
      setError('Please fill in all fields correctly.');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      await addCourse(newCourse.id, newCourse.name, newCourse.credits, newCourse.department);
      setCourseList((prev) => [...prev, { ...newCourse }]);
      setNewCourse({ id: '', name: '', credits: 0, department: '' });
      setIsAddingCourse(false);
    } catch (err) {
      toast({
        title: 'Error Adding Course',
        description: err instanceof Error ? err.message : 'An unknown error occurred',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSaving(false);
      setError(null);
    }
  };

  const handleSaveDepartment = async () => {
    if (!newDepartmentName.trim()) {
      setError('Please fill in all fields correctly.');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      await addDepartment(newDepartmentName);
      setNewDepartmentName('');
      setIsAddingDepartment(false);
      setSelectedDepartment(newDepartmentName);
    } catch (err) {
      toast({
        title: 'Error Adding Department',
        description: err instanceof Error ? err.message : 'An unknown error occurred',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSaving(false);
      setError(null);
    }
  };

  return (
    <Box sx={styles.container}>
      <Container maxW="container.xl" pb="100px">
        <Grid templateColumns="repeat(12, 1fr)" gap={6}>
          {/* Left Card: Department Selection */}
          <GridItem colSpan={{ base: 12, md: 3 }}>
            <Box sx={styles.card}>
              <Heading size="md" mb={4}>
                {t('departments')}
              </Heading>
              <VStack spacing={4} align="stretch">
                {departments.map((department) => (
                  <Button
                    key={department}
                    variant={selectedDepartment === department ? 'solid' : 'outline'}
                    colorScheme="teal"
                    onClick={() => handleDepartmentClick(department)}
                    sx={styles.departmentButton}
                  >
                    {department}
                  </Button>
                ))}
              </VStack>
            </Box>
          </GridItem>

          {/* Main Content Card */}
          <GridItem colSpan={{ base: 12, md: 6 }}>
            {loading ? (
              Array.from({ length: 1 }).map((_, index) => (
                <Skeleton key={index} height="350px" borderRadius="xl" />
              ))
            ) : (
              <Box sx={styles.card} position="relative" minH="350px">
                {isAddingDepartment ? (
                  <VStack spacing={4} align="stretch">
                    <Heading size="md" mb={4}>{t('addDepartment')}</Heading>
                    <FormControl>
                      <FormLabel>{t('departmentName')}</FormLabel>
                      <Input
                        name="departmentName"
                        value={newDepartmentName}
                        onChange={(e) => setNewDepartmentName(e.target.value)}
                        placeholder={t('enterDepartmentName')}
                      />
                    </FormControl>
                    {error && <Text color="red.500">{error}</Text>}
                    <Button
                      colorScheme="teal"
                      onClick={handleSaveDepartment}
                      isLoading={isSaving}
                    >
                      {t('saveDepartment')}
                    </Button>
                  </VStack>
                ) : isAddingCourse ? (
                  <VStack spacing={4} align="stretch">
                    <Heading size="md" mb={4}>
                      {t('addNewCourse')}
                    </Heading>
                    <FormControl>
                      <FormLabel>{t('courseId')}</FormLabel>
                      <Input
                        name="id"
                        value={newCourse.id}
                        onChange={handleInputChange}
                        placeholder={t('enterCourseId')}
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel>{t('courseName')}</FormLabel>
                      <Input
                        name="name"
                        value={newCourse.name}
                        onChange={handleInputChange}
                        placeholder={t('enterCourseName')}
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel>{t('credits')}</FormLabel>
                      <Input
                        name="credits"
                        type="number"
                        value={newCourse.credits === 0 && newCourse.credits !== undefined ? '0' : newCourse.credits}
                        onChange={(e) => {
                          const value = Number(e.target.value);
                          if (value >= 0 && value <= 4) {
                            setNewCourse((prev) => ({ ...prev, credits: value }));
                          } else {
                            e.target.value = String(newCourse.credits);
                          }
                        }}
                        onFocus={(e) => {
                          if (e.target.value === '') {
                            e.target.value = '';
                          }
                        }}
                        placeholder={t('enterCredits')}
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel>{t('department')}</FormLabel>
                      <Select
                        name="department"
                        value={newCourse.department || ''}
                        onChange={handleDepartmentChange}
                        bg="gray.800"
                        color="white"
                        borderColor="gray.600"
                        borderRadius="xl"
                        _hover={{ borderColor: 'gray.500' }}
                        _focus={{
                          borderColor: 'teal.400',
                          boxShadow: '0 0 0 1px teal.400',
                        }}
                        sx={{
                          '& option': {
                            backgroundColor: 'rgba(26, 32, 44, 0.8)',
                            color: 'white',
                            backdropFilter: 'blur(4px)',
                          },
                          '& option[hidden]': {
                            display: 'none',
                          },
                        }}
                      >
                        <option value="" hidden>{t('selectDepartment')}</option>
                        {departments.map((department) => (
                          <option key={department} value={department}>
                            {department}
                          </option>
                        ))}
                      </Select>
                    </FormControl>
                    {error && <Text color="red.500">{error}</Text>}
                    <Button
                      colorScheme="teal"
                      onClick={handleSaveCourse}
                      isLoading={isSaving}
                    >
                      {t('saveCourse')}
                    </Button>
                  </VStack>
                ) : selectedDepartment ? (
                  <VStack spacing={4} align="stretch">
                    <Heading size="md" mb={4}>
                      {t('coursesIn')} {selectedDepartment}
                    </Heading>
                    <Input
                      placeholder={t('searchexam')}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      mb={4}
                    />
                    {courseList.map((course) => (
                      <Box key={course[0]} p={4} borderWidth={1} borderRadius="md">
                        <Text fontWeight="bold">{course[1]}</Text>
                        <Text>{t('courseId')}: {course[0]}</Text>
                        <Text>{t('credits')}: {Number(course[2]) / 10}</Text>
                        <Text>{course[4] ? t('courseIsActive') : t('courseIsNotActive')}</Text>
                      </Box>
                    ))}
                  </VStack>
                ) : (
                  <VStack sx={styles.welcomeMessage}>
                    <Heading size="lg">{t('universityName')}</Heading>
                  </VStack>
                )}
                <Box sx={styles.logo} />
              </Box>
            )}
          </GridItem>

          {/* Right Card: Add Course Button */}
          <GridItem colSpan={{ base: 12, md: 3 }}>
            <Box sx={styles.card}>
              {isAddingCourse || isAddingDepartment ? (
                <>
                  <Button
                    colorScheme="teal"
                    onClick={() => { handleAddCourseClick(false); setIsAddingDepartment(false); }}
                    isDisabled={isSaving}
                  >
                    {t('closeButton')}
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    colorScheme="teal"
                    onClick={() => handleAddCourseClick(true)}
                    isDisabled={isSaving}
                  >
                    {t('addCourse')}
                  </Button>
                  <Button
                    mt={4}
                    colorScheme="teal"
                    onClick={() => handleAddDepartmentClick(true)}
                    isDisabled={isSaving}
                  >
                    {t('addDepartment')}
                  </Button>
                </>
              )
              }
            </Box>
          </GridItem>
        </Grid>
      </Container>
    </Box>
  );
};

export default CoursePage;