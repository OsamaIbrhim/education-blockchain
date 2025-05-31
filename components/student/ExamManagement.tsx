import React, { useState } from 'react';
import {
    Box,
    VStack,
    Heading,
    Text,
    useColorModeValue,
    Spinner,
    Container,
    ScaleFade,
    Center,
} from '@chakra-ui/react';
import { ExamData } from '../../types/examManagement';
import { InfoIcon } from '@chakra-ui/icons';
import ExamList from './ExamList';
import { useLanguage } from 'context/LanguageContext';

interface ExamManagementProps {
    exams: ExamData[];
    loading: boolean;
}

export function ExamManagement({
    exams,
    loading
}: ExamManagementProps) {
    const { onOpen: onEnrollOpen } = { onOpen: () => {} }; // dummy if not used
    const [selectedExamId, setSelectedExamId] = useState<string>('');
    const cardBg = useColorModeValue('gray.50', 'gray.800');
    const mutedTextColor = useColorModeValue('gray.500', 'gray.400');
    const borderColor = useColorModeValue('gray.200', 'gray.700');
    const { t } = useLanguage();

    if (loading) {
        return (
            <Container centerContent py={10}>
                <Spinner size="xl" />
                <Text mt={4}>{t('loading')}</Text>
            </Container>
        );
    }

    return (
        <ScaleFade initialScale={0.9} in={true}>
            <Box
                bg={cardBg}
                borderRadius="xl"
                shadow="xl"
                overflow="hidden"
                borderWidth="1px"
                position="relative"
                borderColor={borderColor}
                transition="all 0.2s"
                _hover={{
                    transform: 'translateY(-4px)',
                    shadow: '2xl',
                    borderColor: 'blue.400'
                }}
            >
                <Box p={6}>
                    <VStack spacing={6} align="stretch">
                        <Heading size="lg" mb={4}>
                            {t('examManagement')}
                        </Heading>
                        <Text color={mutedTextColor}>
                            {t('activeExams')} | {t('examManagement')}
                        </Text>
                        <Box overflowX="auto">
                            {exams.length === 0 ? (
                                <Center p={8}>
                                    <VStack spacing={3}>
                                        <InfoIcon boxSize="40px" color="blue.500" />
                                        <Text fontSize="lg">{t('noResultsYet')}</Text>
                                        <Text color={mutedTextColor}>
                                            {t('noResultsYet')}
                                        </Text>
                                    </VStack>
                                </Center>
                            ) : (
                                <Box overflowX="auto">
                                    <ExamList
                                        exams={exams}
                                        onSelectExam={(exam) => {
                                            setSelectedExamId(exam.address);
                                            onEnrollOpen();
                                        }}
                                        onOpenResultsModal={() => { }}
                                    />
                                </Box>
                            )}
                        </Box>
                    </VStack>
                </Box>
            </Box>
        </ScaleFade>
    );
}