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
import CourseEnrollment from 'components/student/CourseEnrollment';

// const departments = new Map([
//   ['CS', 'Computer Science'],
//   ['Math', 'Mathematics'],
//   ['Physics', 'Physics'],
// ]);

const CoursePage = () => {
  const { t } = useLanguage();
  const { courses, isLoading, addCourse, departments, addDepartment } = useAppData();
  const toast = useToast();
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [newCourse, setNewCourse] = useState<{ id: string; name: string; credits: number | undefined; department: string }>({ id: '', name: '', credits: 0, department: '' });
  const [newDepartmentName, setNewDepartmentName] = useState('');
  const styles = useMultiStyleConfig('CoursePage', {});

  return (
    <Box sx={styles.container}>
      <Container maxW="container.xl" pb="100px">
        <Skeleton isLoaded={!isLoading} borderRadius="xl">
          <CourseEnrollment />
        </Skeleton>
      </Container>
    </Box>
  );
};

export default CoursePage;