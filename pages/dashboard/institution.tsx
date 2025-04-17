import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  useColorModeValue,
  Spinner,
  Center,
  Text,
  VStack,
  Heading,
  Button,
  useToast,
  Progress
} from '@chakra-ui/react';
import { useInstitution } from '../../hooks/useInstitution';
import { CertificateManagement } from '../../components/institution/CertificateManagement';
import { ExamManagement } from '../../components/institution/ExamManagement';
import { ExamResults } from '../../components/institution/ExamResults';
import { TutorialModal } from '../../components/institution/TutorialModal';
import { useRouter } from 'next/router';
import { getUserRole, issueCertificate } from '../../utils/contracts';
import LogoutButton from '../../components/LogoutButton';
import { useAccount } from 'wagmi';

export default function InstitutionDashboard() {
  const {
    institution,
    exams,
    certificates,
    isLoading,
    isInitialized,
    hasAccess,
    selectedExamResults,
    examStatistics,
    createExam,
    updateExamStatus,
    handleSubmitResults,
    handleEnrollStudent,
    issueCertificate,
    loadExamResults,
    registerStudents
  } = useInstitution();

  const router = useRouter();
  const toast = useToast();
  const { address } = useAccount();

  const [isTutorialOpen, setIsTutorialOpen] = React.useState(true);
  const [selectedExamId, setSelectedExamId] = React.useState<string | null>(null);

  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const containerBgColor = useColorModeValue('white', 'gray.800');

  useEffect(() => {
    if (!isLoading && !hasAccess) {
      toast({
        title: 'خطأ في الوصول - Access Denied',
        description: 'هذه الصفحة للمؤسسات التعليمية فقط - This page is for educational institutions only',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top',
      });
      router.push('/');
    }
  }, [isLoading, hasAccess, router, toast]);

  if (isLoading) {
    return (
      <Center h="100vh">
        <VStack spacing={4}>
          <Spinner size="xl" />
          <Text>جاري التحميل... - Loading...</Text>
          <Progress size="xs" isIndeterminate width="200px" />
        </VStack>
      </Center>
    );
  }

  if (!hasAccess) {
    return null;
  }

  const handleViewResults = (examId: string) => {
    setSelectedExamId(examId);
    loadExamResults(examId);
  };

  return (
    <Box minH="100vh" bg={bgColor}>
      <Container maxW="container.xl" py={8}>
        <Box bg={containerBgColor} borderRadius="lg" boxShadow="sm" overflow="hidden">
          <Tabs>
            <TabList px={4} pt={4}>
              <Tab>الشهادات - Certificates</Tab>
              <Tab>الاختبارات - Exams</Tab>
              {selectedExamId && <Tab>نتائج الاختبار - Exam Results</Tab>}
            </TabList>

            <TabPanels>
              <TabPanel>
                <CertificateManagement
                  certificates={certificates}
                  onIssueCertificate={issueCertificate}
                  loading={isLoading}
                />
              </TabPanel>

              <TabPanel>
                <ExamManagement
                  exams={exams?.map(exam => ({
                    ...exam,
                    date: typeof exam.date === 'string' ? new Date(exam.date).getTime() : exam.date
                  })) || []}
                  onCreateExam={createExam}
                  onUpdateStatus={updateExamStatus}
                  onRegisterStudents={registerStudents}
                  loading={isLoading}
                />
              </TabPanel>

              {selectedExamId && (
                <TabPanel>
                  <ExamResults
                    exams={exams || []}
                    selectedExamId={selectedExamId}
                    onSelectExam={handleViewResults}
                    results={selectedExamResults}
                    statistics={examStatistics}
                    onSubmitResults={handleSubmitResults}
                    loading={isLoading}
                  />
                </TabPanel>
              )}
            </TabPanels>
          </Tabs>
        </Box>
      </Container>

      <TutorialModal
        isOpen={isTutorialOpen}
        onClose={() => setIsTutorialOpen(false)}
      />
    </Box>
  );
}
