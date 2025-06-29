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
} from '@chakra-ui/react';
import { useLanguage } from 'context/LanguageContext';
import { useAppData } from 'hooks/useAppData';
import LoadingSpinner from 'components/LoadingSpinner';

const departments = new Map([
  ['CS', 'Computer Science'],
  ['Math', 'Mathematics'],
  ['Physics', 'Physics'],
]);

const CoursePage = () => {
  const { t } = useLanguage();
  const { courses, isLoading: loading } = useAppData();
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);
  const [courseList, setCourseList] = useState(courses);
  const [isAddingCourse, setIsAddingCourse] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const styles = useMultiStyleConfig('CoursePage', {});

  useEffect(() => {
    if (selectedDepartment) {
      const filteredCourses = courses.filter(
        (course) =>
          course.department === selectedDepartment &&
          (course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            course.id.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setCourseList(filteredCourses);
    }
  }, [selectedDepartment, courses, searchQuery]);

  const handleDepartmentClick = (department: string) => {
    setSelectedDepartment(department);
    setIsAddingCourse(false);
  };

  const handleAddCourseClick = () => {
    setIsAddingCourse(true);
  };

  const handleSaveCourse = () => {
    setIsAddingCourse(false);
    setSelectedDepartment(null);
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
                {Array.from(departments.keys()).map((department) => (
                  <Button
                    key={department}
                    variant={selectedDepartment === department ? 'solid' : 'outline'}
                    colorScheme="teal"
                    onClick={() => handleDepartmentClick(department)}
                    sx={styles.departmentButton}
                  >
                    {departments.get(department)}
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
                {isAddingCourse ? (
                  <VStack spacing={4} align="stretch">
                    <Heading size="md" mb={4}>
                      {t('addNewCourse')}
                    </Heading>
                    <FormControl>
                      <FormLabel>{t('courseName')}</FormLabel>
                      <Input placeholder={t('enterCourseName')} />
                    </FormControl>
                    <FormControl>
                      <FormLabel>{t('courseDescription')}</FormLabel>
                      <Input placeholder={t('enterCourseDescription')} />
                    </FormControl>
                    <Button colorScheme="teal" onClick={handleSaveCourse}>
                      {t('save')}
                    </Button>
                  </VStack>
                ) : selectedDepartment ? (
                  <VStack spacing={4} align="stretch">
                    <Heading size="md" mb={4}>
                      {t('coursesIn')} {departments.get(selectedDepartment)}
                    </Heading>
                    <Input
                      placeholder={t('searchCourses')}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      mb={4}
                    />
                    {courseList.length > 0 ? (
                      courseList.map((course) => (
                        <Box key={course.id} sx={styles.courseItem}>
                          <Heading size="sm" mb={2}>
                            {course.name}
                          </Heading>
                          <Text>{course.description}</Text>
                        </Box>
                      ))
                    ) : (
                      <Text>{t('noCoursesAvailable')}</Text>
                    )}
                  </VStack>
                ) : (
                  <>
                    <VStack sx={styles.welcomeMessage}>
                      <Heading size="lg">{t('universityName')}</Heading>
                    </VStack>
                    <Box sx={styles.logo} />
                  </>
                )}
              </Box>
            )}
          </GridItem>

          {/* Right Card: Actions */}
          <GridItem colSpan={{ base: 12, md: 3 }}>
            <Box sx={styles.card}>
              <Heading size="md" mb={4}>
                {t('actions')}
              </Heading>
              <Button
                colorScheme="teal"
                size="lg"
                onClick={handleAddCourseClick}
                isDisabled={isAddingCourse}
              >
                {t('addNewCourse')}
              </Button>
            </Box>
          </GridItem>
        </Grid>
      </Container>
    </Box>
  );
};

export default CoursePage;