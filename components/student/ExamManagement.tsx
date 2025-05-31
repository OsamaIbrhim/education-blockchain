import React, { useState, useEffect } from 'react';
import {
    Box,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    Badge,
    VStack,
    Heading,
    Text,
    useColorModeValue,
    Spinner,
    Container,
    ScaleFade,
    Center,
    HStack,
    Tooltip,
    Button,
    Link,
    useDisclosure
} from '@chakra-ui/react';
import { ExamData } from '../../types/examManagement';
import { CheckCircleIcon, InfoIcon } from '@chakra-ui/icons';
import { AlertCircleIcon } from 'components/Icons';
import ExamList from './ExamList';

interface ExamManagementProps {
    exams: ExamData[];
    loading: boolean;
}

export function ExamManagement({
    exams,
    loading
}: ExamManagementProps) {
    const { onOpen: onEnrollOpen } = useDisclosure();
    const [selectedExamId, setSelectedExamId] = useState<string>('');

    const bgColor = useColorModeValue('white', 'gray.700');
    const cardBg = useColorModeValue('gray.50', 'gray.800');
    const textColor = useColorModeValue('gray.700', 'gray.300');
    const mutedTextColor = useColorModeValue('gray.500', 'gray.400');
    const borderColor = useColorModeValue('gray.200', 'gray.700');

    if (loading) {
        return (
            <Container centerContent py={10}>
                <Spinner size="xl" />
                <Text mt={4}>جاري التحميل... | Loading...</Text>
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
                            الاختبارات الأكاديمية| Academic Exams
                        </Heading>
                        <Text color={mutedTextColor}>
                            قائمة بجميع الاختبارات الأكاديمية وتفاصيلها
                            <br />
                            List of all your academic exams and their details
                        </Text>
                        <Box overflowX="auto">
                            {exams.length === 0 ? (
                                <Center p={8}>
                                    <VStack spacing={3}>
                                        <InfoIcon boxSize="40px" color="blue.500" />
                                        <Text fontSize="lg">لا توجد أختبارات بعد</Text>
                                        <Text color={mutedTextColor}>
                                            No Exams yet
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