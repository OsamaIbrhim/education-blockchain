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
  useTheme,
  Center,
  Progress,
  useColorModeValue,
} from '@chakra-ui/react';
import Layout from 'components/layout/Layout';
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
  const { loadCourseByDepartment, courses, isLoading: loading } = useAppData();
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);
  const [courseList, setCourseList] = useState(courses);
  const [isAddingCourse, setIsAddingCourse] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const theme = useTheme();

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
    loadCourseByDepartment(department);
    setIsAddingCourse(false);
  };

  const handleAddCourseClick = () => {
    setIsAddingCourse(true);
  };

  const handleSaveCourse = () => {
    setIsAddingCourse(false);
    setSelectedDepartment(null);
  };

  if (loading) {
    return (
      <Box minH="100vh" bg={useColorModeValue('gray.50', 'gray.900')}>
        <LoadingSpinner />
      </Box>
    );
  }

  return (
    <Box minH="100vh" bg={theme.colors.gray[50]}>
      <Container maxW="container.xl" pb="100px">
        <Grid templateColumns="repeat(12, 1fr)" gap={6}>
          {/* Left Card: Department Selection */}
          <GridItem colSpan={{ base: 12, md: 3 }}>
            <Box
              bg={theme.colors.white}
              borderRadius="xl"
              shadow="xl"
              borderWidth="1px"
              borderColor={theme.colors.gray[200]}
              p={6}
            >
              <Heading size="md" mb={4} color={theme.colors.gray[800]}>
                {t('departments')}
              </Heading>
              <VStack spacing={4} align="stretch">
                {Array.from(departments.keys()).map((department) => (
                  <Button
                    key={department}
                    variant={selectedDepartment === department ? 'solid' : 'outline'}
                    colorScheme="teal"
                    onClick={() => handleDepartmentClick(department)}
                  >
                    {departments.get(department)}
                  </Button>
                ))}
              </VStack>
            </Box>
          </GridItem>

          {/* Main Content Card */}
          <GridItem colSpan={{ base: 12, md: 6 }}>
            <Box
              bg={theme.colors.white}
              borderRadius="xl"
              shadow="xl"
              borderWidth="1px"
              borderColor={theme.colors.gray[200]}
              p={8}
              position="relative"
            >
              {isAddingCourse ? (
                <VStack spacing={4} align="stretch">
                  <Heading size="md" mb={4} color={theme.colors.gray[800]}>
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
                  <Heading size="md" mb={4} color={theme.colors.gray[800]}>
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
                      <Box
                        key={course.id}
                        p={4}
                        borderWidth="1px"
                        borderRadius="md"
                        borderColor={theme.colors.gray[200]}
                      >
                        <Heading size="sm" mb={2} color={theme.colors.gray[800]}>
                          {course.name}
                        </Heading>
                        <Text color={theme.colors.gray[600]}>{course.description}</Text>
                      </Box>
                    ))
                  ) : (
                    <Text color={theme.colors.gray[600]}>{t('noCoursesAvailable')}</Text>
                  )}
                </VStack>
              ) : (
                <VStack spacing={4} align="center">
                  <Heading size="lg" color={theme.colors.gray[800]}>
                    {t('universityName')}
                  </Heading>
                  <Box
                    position="absolute"
                    top="50%"
                    left="50%"
                    transform="translate(-50%, -50%)"
                    opacity={0.1}
                    fontSize="6xl"
                    fontWeight="bold"
                    color={theme.colors.gray[400]}
                  >
                    {t('universityLogo')}
                  </Box>
                </VStack>
              )}
            </Box>
          </GridItem>

          {/* Right Card: Actions */}
          <GridItem colSpan={{ base: 12, md: 3 }}>
            <Box
              bg={theme.colors.white}
              borderRadius="xl"
              shadow="xl"
              borderWidth="1px"
              borderColor={theme.colors.gray[200]}
              p={6}
            >
              <Heading size="md" mb={4} color={theme.colors.gray[800]}>
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