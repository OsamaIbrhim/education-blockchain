import React, { useState, useEffect } from 'react';
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
import { NewExam } from 'types/examManagement';


const ExamPage = () => {
    const { t } = useLanguage();
    const { exams, isLoading: loading, createNewExam, courses } = useAppData();
    const [isAddingExam, setIsAddingExam] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [examList, setExamList] = useState(exams);
    const [newExam, setNewExam] = useState<NewExam>({
        courseId: '',
        courseName: '',
        description: '',
        date: new Date(),
        duration: 0,
        department: '',
    });
    const [error, setError] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const styles = useMultiStyleConfig('CoursePage', {});
    const toast = useToast();

    useEffect(() => {
        if (searchQuery) {
            const filtered = exams.filter(
                (exam) =>
                    exam.courseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    exam.id.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setExamList(filtered);
        } else {
            setExamList(exams);
        }
    }, [searchQuery, exams]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setNewExam((prev) => ({ ...prev, [name]: value }));
    };

    const handleSaveExam = async () => {
        if (!newExam.courseName || !newExam.courseId || !newExam.description || !newExam.date || !newExam.duration || !newExam.department) {
            setError(t('pleaseFillAllFields'));
            return;
        }
        setIsSaving(true);
        try {
            await createNewExam(newExam);
            setNewExam({ courseId: '', courseName: '', description: '', date: new Date(), duration: 0, department: '' });
            setIsAddingExam(false);
            toast({
                title: t('success'),
                description: t('examCreated'),
                status: 'success',
                duration: 4000,
                isClosable: true,
            });
        } catch (err) {
            toast({
                title: t('error'),
                description: err instanceof Error ? err.message : 'Unknown error',
                status: 'error',
                duration: 4000,
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
                    {/* Main Content */}
                    <GridItem colSpan={{ base: 12, md: 8 }}>
                        <Box sx={styles.card} position="relative" minH="350px">
                            {isAddingExam ? (
                                <VStack spacing={4} align="stretch">
                                    <Heading size="md" mb={4}>{t('addNewExam')}</Heading>
                                    <FormControl>
                                        <FormLabel>{t('courseName')}</FormLabel>
                                        <Select
                                            name="courseId"
                                            value={newExam.courseId}
                                            onChange={(e) => {
                                                if (e.target.value !== 'selectCourse') {
                                                    const selectedCourse = courses.find((c) => c[0] === e.target.value);
                                                    setNewExam((prev) => ({
                                                        ...prev,
                                                        courseId: e.target.value,
                                                        courseName: selectedCourse ? selectedCourse.name : '',
                                                    }));
                                                }
                                            }}
                                            placeholder={t('selectCourse')}
                                        >
                                            {courses && courses.length > 0 ? (
                                                courses.map((course) => (
                                                    <option key={course.id} value={course.id}>
                                                        {course[0]}
                                                    </option>
                                                ))
                                            ) : (
                                                <option value="" disabled>
                                                    {t('noCoursesAvailable')}
                                                </option>
                                            )}
                                        </Select>
                                    </FormControl>
                                    <FormControl>
                                        <FormLabel>{t('examDescription')}</FormLabel>
                                        <Input name="description" value={newExam.description} onChange={handleInputChange} placeholder={t('enterExamDescription')} />
                                    </FormControl>
                                    <FormControl>
                                        <FormLabel>{t('examDate')}</FormLabel>
                                        <Input
                                            name="date"
                                            type="date"
                                            value={
                                                typeof newExam.date === 'string'
                                                    ? newExam.date
                                                    : newExam.date instanceof Date && !isNaN(newExam.date.getTime())
                                                        ? newExam.date.toISOString().split('T')[0]
                                                        : ''
                                            }
                                            onChange={handleInputChange}
                                        />
                                    </FormControl>
                                    <FormControl>
                                        <FormLabel>{t('examDuration')}</FormLabel>
                                        <Input name="duration" type="number" value={newExam.duration} onChange={handleInputChange} placeholder={t('enterExamDuration')} />
                                    </FormControl>
                                    <FormControl>
                                        <FormLabel>{t('department')}</FormLabel>
                                        <Select
                                            name="department"
                                            value={newExam.department}
                                            onChange={(e) => setNewExam((prev) => ({ ...prev, department: e.target.value }))}
                                            placeholder={t('selectDepartment')}
                                        >
                                            {/* Example departments, replace with dynamic list if available */}
                                            <option value="CS">Computer Science</option>
                                            <option value="Math">Mathematics</option>
                                            <option value="Physics">Physics</option>
                                        </Select>
                                    </FormControl>
                                    {error && <Text color="red.500">{error}</Text>}
                                    <Button colorScheme="teal" onClick={handleSaveExam} isLoading={isSaving}>{t('save')}</Button>
                                    <Button variant="ghost" onClick={() => setIsAddingExam(false)}>{t('cancel')}</Button>
                                </VStack>
                            ) : (
                                <VStack spacing={4} align="stretch">
                                    <Heading size="md" mb={4}>{t('exams')}</Heading>
                                    <Input
                                        placeholder={t('searchCourses')}
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        mb={4}
                                    />
                                    {loading ? (
                                        <Skeleton height="200px" borderRadius="xl" />
                                    ) : examList.length > 0 ? (
                                        examList.map((exam) => (
                                            <Box key={exam.id} sx={styles.courseItem}>
                                                <Heading size="sm" mb={2}>{exam.courseName}</Heading>
                                                <Text>{t('examId')}: {exam.id}</Text>
                                                <Text>{t('examDescription')}: {exam.description}</Text>
                                                <Text>{t('examDate')}: {exam.date instanceof Date ? exam.date.toLocaleDateString() : exam.date}</Text>
                                                <Text>{t('examDuration')}: {exam.duration}</Text>
                                                <Text>{t('department')}: {exam.department}</Text>
                                            </Box>
                                        ))
                                    ) : (
                                        <Text>{t('noCoursesAvailable')}</Text>
                                    )}
                                </VStack>
                            )}
                        </Box>
                    </GridItem>
                    {/* Actions */}
                    <GridItem colSpan={{ base: 12, md: 4 }}>
                        <Box sx={styles.card}>
                            <Heading size="md" mb={4}>{t('actions')}</Heading>
                            <Button
                                colorScheme="blue"
                                size="lg"
                                onClick={() => setIsAddingExam(true)}
                                isDisabled={isAddingExam}
                            >
                                {t('addNewExam')}
                            </Button>
                        </Box>
                    </GridItem>
                </Grid>
            </Container>
        </Box>
    );
};

export default ExamPage;