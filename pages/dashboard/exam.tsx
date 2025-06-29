import React, { useState } from 'react';
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
    useColorModeValue,
    useMultiStyleConfig,
    Skeleton,
} from '@chakra-ui/react';
import { useLanguage } from 'context/LanguageContext';
import { useAppData } from 'hooks/useAppData';

const ExamPage = () => {
    const { t } = useLanguage();
    const { exams, isLoading: loading } = useAppData();
    const [selectedTab, setSelectedTab] = useState<string | null>(null);
     const [examList, setExamList] = useState(exams);
    const [isAddingExam, setIsAddingExam] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const styles = useMultiStyleConfig('CoursePage', {});

    const tabs = new Map([
        ['Overview', 'overview'],
        ['Upcoming Exams', 'upcoming'],
        ['Results', 'results'],
    ]);

    // useEffect(() => {
    //     if (selectedTab) {
    //         const filteredExams = exams.filter(
    //             (exam) =>
    //                 exam.department === selectedTab &&
    //                 (exam.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    //                     exam.id.toLowerCase().includes(searchQuery.toLowerCase()))
    //         );
    //         setExamList(filteredCourses);
    //     }
    // }, [selectedTab, exams, searchQuery]);

    const handleTabClick = (tab: string) => {
        setSelectedTab(tab);
        setIsAddingExam(false);
    };

    const handleAddExamlick = () => {
        setIsAddingExam(true);
    };

    const handleSaveExam = () => {
        setIsAddingExam(false);
        setSelectedTab(null);
    };

    return (
        <Box sx={styles.container}>
            <Container maxW="container.xl" pb="100px">
                <Grid templateColumns="repeat(12, 1fr)" gap={6}>
                    {/* Left Card: Department Selection */}
                    <GridItem colSpan={{ base: 12, md: 3 }}>
                        <Box sx={styles.card}>
                            <Heading size="md" mb={4}>
                                {t('examTypes')}
                            </Heading>
                            <VStack spacing={4} align="stretch">
                                {Array.from(tabs.keys()).map((tab) => (
                                    <Button
                                        key={tab}
                                        variant={selectedTab === tab ? 'solid' : 'outline'}
                                        colorScheme="teal"
                                        onClick={() => {
                                            setSelectedTab(tab);
                                            setIsAddingExam(false);
                                        }}
                                    >
                                        {tab}
                                    </Button>
                                ))}
                            </VStack>
                        </Box>
                    </GridItem>

                    {/* Main Content */}
                    <GridItem colSpan={{ base: 12, md: 6 }}>
                        {false ? (
                            Array.from({ length: 1 }).map((_, index) => (
                                <Skeleton key={index} height="350px" borderRadius="xl" />
                            ))
                        ) : (
                            <Box sx={styles.card} position="relative" minH="350px">
                                {isAddingExam ? (
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
                                        {/* <Button colorScheme="teal" onClick={handleSaveCourse}>
                                            {t('save')}
                                        </Button> */}
                                    </VStack>
                                ) : selectedTab ? (
                                    <VStack spacing={4} align="stretch">
                                        <Heading size="md" mb={4}>
                                            {t('examsIn')} {tabs.get(selectedTab)}
                                        </Heading>
                                        <Input
                                            placeholder={t('searchexam')}
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            mb={4}
                                        />
                                        {/* {ex.length > 0 ? (
                                            tabList.map((tab) => (
                                                <Box key={course.id} sx={styles.courseItem}>
                                                    <Heading size="sm" mb={2}>
                                                        {course.name}
                                                    </Heading>
                                                    <Text>{course.description}</Text>
                                                </Box>
                                            ))
                                        ) : (
                                            <Text>{t('noCoursesAvailable')}</Text>
                                        )} */}
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

                    {/* Actions */}
                    <GridItem colSpan={{ base: 12, md: 3 }}>
                        <Box sx={styles.card}>
                            <Heading size="md" mb={4}>
                                {t('actions')}
                            </Heading>
                            <Button
                                colorScheme="blue"
                                size="lg"
                                onClick={() => {
                                    setIsAddingExam(true);
                                    setSelectedTab(null);
                                }}
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