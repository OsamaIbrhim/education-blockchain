import { useState, useEffect, useRef } from 'react';
import { useToast } from '@chakra-ui/react';
import { useAccount, usePublicClient } from 'wagmi';
import { useContract } from './useContract';
import type { Hash } from 'viem';
import { Exam, ExamResult, ExamStatistics, NewExam, ExamResultStructOutput } from '../types/examManagement';
import { Certificate } from '../types/certificate';
import { InstitutionData } from '../components/institution/InstitutionProfile';
import { useRouter } from 'next/router';

// services
import {
  issueCertificate as issueCertificateUtil,
} from 'services/certificate';
import {
  getExamResults,
  submitExamResult,
  createExam as createExamService,
  getInstitutionExams,
  registerStudentForExam,
  updateExamStatus as updateExamStatusUtil
} from 'services/examManagement';
import { getUserData } from 'services/identity';

interface InstitutionResponse {
  name: string;
  ministry: string;
  university: string;
  college: string;
  description: string;
  imageUrl: string;
  website: string;
  email: string;
  phone: string;
  exists: boolean;
  isVerified: boolean;
}

export const useInstitution = () => {
  const { address: account } = useAccount();
  const publicClient = usePublicClient();
  const toast = useToast();
  const { examManagement, certificates, isInitialized, isCorrectNetwork, isLoading: contractsLoading } = useContract();
  const [institutionData, setInstitutionData] = useState<InstitutionData | null>(null);
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exams, setExams] = useState<Exam[]>([]);
  const [certificatesData, setCertificatesData] = useState<Certificate[]>([]);
  const [hasAccess, setHasAccess] = useState(false);
  const [selectedExamResults, setSelectedExamResults] = useState<ExamResult[]>([]);
  const [examStatistics, setExamStatistics] = useState<ExamStatistics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const unauthorizedToastShownRef = useRef(false);

  useEffect(() => {
    const checkAccess = async () => {
      try {
        if (!account || !isInitialized || !isCorrectNetwork) {
          // throw new Error('');
          return;
        }

        if (!examManagement || !certificates) {
          throw new Error('Contracts not initialized');
        }

        setError(null);
      } catch (error: any) {
        console.error('Error checking institution access:', error);
        setError(error?.message || 'Error checking institution access');
        toast({
          title: 'Error',
          description: `Failed to verify institution access: ${error?.message || 'Unknown error'}`,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    };

    checkAccess();

  }, [account, examManagement, certificates, isInitialized, isCorrectNetwork]);


  useEffect(() => {
    const checkVerificationStatus = async () => {
      if (!account || !examManagement || !isInitialized || !isCorrectNetwork) {
        return;
      }

      try {
        // The function returns multiple values, we need to destructure them
        const institution = await getUserData(account);

        setIsVerified(institution?.isVerified);
      } catch (error) {
        console.error('Error checking verification status:', error);
        setIsVerified(false);
      }
    };
    checkVerificationStatus();
  }, [account, examManagement, isInitialized, isCorrectNetwork]);

  // useEffect(() => {
  //   // Only run redirection logic after initial loading is complete
  //   if (isLoading) {
  //     return;
  //   }

  //   const currentPath = router.pathname;
  //   const profilePath = '/dashboard/institution/profile';

  //   if (!isVerified) {
  //     // If NOT verified and NOT already on the profile page...
  //     if (currentPath !== profilePath) {
  //       router.push(profilePath);

  //       // Show toast only once using the ref
  //       if (!unauthorizedToastShownRef.current) {
  //         toast({
  //           title: 'غير مصرح | Unauthorized',
  //           description: 'يرجى إكمال ملفك الشخصي وانتظار التحقق من قبل المسؤول | Please complete your profile and wait for admin verification',
  //           status: 'warning',
  //           duration: 9000, // Longer duration
  //           isClosable: true,
  //           position: 'top', // Position at the top
  //         });
  //         unauthorizedToastShownRef.current = true; // Mark toast as shown
  //       }
  //     }
  //   } else {
  //     // If VERIFIED, reset the toast ref so it can show again if they become unverified later
  //     unauthorizedToastShownRef.current = false;

  //     // Optional: If verified and currently on the profile page, redirect to main dashboard
  //     if (currentPath === profilePath) {
  //        router.push('/dashboard/institution'); // Adjust target dashboard path if needed
  //     }
  //   }
  // }, [isLoading, isVerified, router, toast]); 

  const loadExamsFromContract = async (userAddress: `0x${string}`) => {
    if (!examManagement || !userAddress) {
      return [];
    }

    try {
      const updatedExams = await getInstitutionExams(userAddress) as unknown as Exam[];
      console.log("Loaded exams:", updatedExams);
      setExams(updatedExams || []);
    } catch (error) {
      console.error('Error loading exams:', error);
      return [];
    }
  };

  const loadCertificatesFromContract = async (userAddress: `0x${string}`) => {
    if (!certificates || !userAddress) {
      return [];
    }

    try {
      const updatedCertificats = await certificates.getInstitutionCertificates([userAddress]) as unknown as Certificate[];
      setCertificatesData(updatedCertificats || []);
    } catch (error) {
      console.error('Error loading certificates:', error);
      return [];
    }
  };

  // effect to load exams
  useEffect(() => {
    if (account && examManagement && isInitialized && isCorrectNetwork) {
      loadExamsFromContract(account);
    }
  }, [account, examManagement, isInitialized, isCorrectNetwork]);

  // effect to load certificates
  useEffect(() => {
    if (account && examManagement && isInitialized && isCorrectNetwork) {
      loadCertificatesFromContract(account);
    }
  }, [account, certificates, isInitialized, isCorrectNetwork]);

  // create exam
  const createExam = async (exam: NewExam): Promise<any> => {
    if (!account || !examManagement || !publicClient) {
      toast({
        title: 'خطأ في العنوان | Address Error',
        description: 'لم يتم العثور على عنوان المحفظة أو العقد | Wallet address or contract not found',
        status: 'error',
        duration: 3000,
      });
      return false;
    }

    try {
      setIsLoading(true);

      const examData = await createExamService(exam);

      if (!examData) {
        throw new Error('Failed to create exam. Please try again.');
      }

      if (examData) {
        try {
          // await publicClient.waitForTransactionReceipt({ hash: hash as `0x${string}` });
          toast({
            title: 'Transaction Confirmed',
            description: 'Exam creation transaction mined.',
            status: 'info',
            duration: 2000,
          });
        } catch (error) {
          toast({
            title: 'Transaction Wait Error',
            description: `Could not confirm transaction status. Check block explorer: ${error}`,
            status: 'warning',
            duration: 5000,
          });
        }
      } else {
        console.warn("Transaction hash not received from createExamService. Reloading might show stale data.");
        toast({
          title: 'Transaction Not Sent?',
          description: 'Could not get transaction hash. Exam might not have been created.',
          status: 'warning',
          duration: 5000,
        });
      }

      await loadExamsFromContract(account);

      if (examData) {
        toast({
          title: 'Exam Created & List Refreshed',
          description: 'Your exam has been created successfully',
          status: 'success',
          duration: 3000,
        });
      }

      return examData;
    } catch (err: any) {
      toast({
        title: 'Error creating exam',
        description: err instanceof Error ? err.message : 'An unknown error occurred',
        status: 'error',
        duration: 3000,
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const updateExamStatus = async (examId: string, status: string): Promise<boolean> => {
    if (!account) {
      toast({
        title: 'خطأ في العنوان | Address Error',
        description: 'لم يتم العثور على عنوان المحفظة | Wallet address not found',
        status: 'error',
        duration: 3000,
      });
      return false;
    }

    try {
      setIsLoading(true);
      await updateExamStatusUtil(examId, status);
      await loadExamsFromContract(account);
      return true;
    } catch (err: any) {
      toast({
        title: 'Error updating exam status',
        description: err instanceof Error ? err.message : 'An unknown error occurred',
        status: 'error',
        duration: 3000,
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const registerStudents = async (examId: string, students: string[]): Promise<boolean> => {
    if (!account) {
      toast({
        title: 'خطأ في العنوان | Address Error',
        description: 'لم يتم العثور على عنوان المحفظة | Wallet address not found',
        status: 'error',
        duration: 3000,
      });
      return false;
    }

    try {
      setIsLoading(true);
      for (const student of students) {
        const success = await registerStudentForExam(examId, student, null);
        if (success) {
          toast({ title: 'Student Registered', status: 'success' });
          await loadExamsFromContract(account!);
        }
      }
      return true;
    } catch (err: any) {
      console.error('Error registering students:', err);
      toast({
        title: 'Error registering students',
        description: err instanceof Error ? err.message : 'An unknown error occurred',
        status: 'error',
        duration: 3000,
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitResults = async (examId: string, results: ExamResult[]): Promise<boolean> => {
    if (!account) {
      toast({
        title: 'خطأ في العنوان | Address Error',
        description: 'لم يتم العثور على عنوان المحفظة | Wallet address not found',
        status: 'error',
        duration: 3000,
      });
      return false;
    }

    try {
      setIsLoading(true);
      for (const result of results) {
        await submitExamResult(examId, result.studentAddress, result.score, result.grade, '');
      }
      await loadExamsFromContract(account);
      return true;
    } catch (err: any) {
      console.error('Error submitting results:', err);
      toast({
        title: 'Error submitting results',
        description: err instanceof Error ? err.message : 'An unknown error occurred',
        status: 'error',
        duration: 3000,
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const loadExamResults = async (examId: string) => {
    try {
      const currentExam = exams.find(exam => exam.address === examId);
      if (!currentExam || !currentExam.students || currentExam.students.length === 0) {
        console.warn('Exam not found or has no students:', examId);
        setSelectedExamResults([]);
        setExamStatistics(null);
        return;
      }

      const examResultsPromises = currentExam.students.map(async (studentId: string) => {
        try {
          const result = await getExamResults(examId, studentId);
          return { studentId, result };
        } catch (err) {
          console.error(`Failed to get result for student ${studentId} in exam ${examId}:`, err);
          return { studentId, result: null };
        }
      });

      const resultsWithStudentId = await Promise.all(examResultsPromises);

      const validRawResults = resultsWithStudentId.filter(
        (entry): entry is { studentId: string; result: NonNullable<typeof entry.result> } =>
          entry.result !== null && 'exists' in entry.result
      );

      const finalResults: ExamResult[] = validRawResults.map(entry => ({
        studentAddress: entry.studentId,
        score: Number(entry.result[0]),
        grade: entry.result[1],
        ipfsHash: entry.result[2],
        exists: true,
      }));

      setSelectedExamResults(finalResults);

      if (finalResults.length === 0) {
        setExamStatistics(null);
        return;
      }

      const totalStudents = finalResults.length;
      const passingStudents = finalResults.filter(result => result.score >= 60).length;
      const totalScore = finalResults.reduce((sum, result) => sum + result.score, 0);

      const gradeCount = {
        A: finalResults.filter(result => result.grade === 'A').length,
        B: finalResults.filter(result => result.grade === 'B').length,
        C: finalResults.filter(result => result.grade === 'C').length,
        D: finalResults.filter(result => result.grade === 'D').length,
        F: finalResults.filter(result => result.grade === 'F').length
      };

      const mostCommonGradeEntry = Object.entries(gradeCount).reduce((a, b) => a[1] >= b[1] ? a : b, ["", 0]);
      const mostCommonGrade = mostCommonGradeEntry[1] > 0 ? mostCommonGradeEntry[0] : 'N/A';

      setExamStatistics({
        totalStudents,
        passingCount: passingStudents,
        aCount: gradeCount.A,
        bCount: gradeCount.B,
        cCount: gradeCount.C,
        dCount: gradeCount.D,
        fCount: gradeCount.F,
        averageScore: totalStudents > 0 ? totalScore / totalStudents : 0,
        passRate: totalStudents > 0 ? (passingStudents * 100) / totalStudents : 0,
        mostCommonGrade
      });

    } catch (err: unknown) {
      console.error('Error loading exam results:', err);
      toast({
        title: 'Error loading results',
        description: err instanceof Error ? err.message : 'An unknown error occurred',
        status: 'error',
        duration: 3000
      });
      setSelectedExamResults([]);
      setExamStatistics(null);
    }
  };

  const handleEnrollStudent = async (examId: string, studentAddress: string) => {
    if (!account) {
      toast({
        title: 'خطأ في العنوان | Address Error',
        description: 'لم يتم العثور على عنوان المحفظة | Wallet address not found',
        status: 'error',
        duration: 3000,
      });
      return false;
    }

    try {
      setIsLoading(true);
      const success = await registerStudentForExam(examId, studentAddress, null);
      if (success) {
          toast({ title: 'Student Registered', status: 'success' });
          await loadExamsFromContract(account!);
      }
      return true;
    } catch (err: unknown) {
      console.error('Error enrolling student:', err);
      toast({
        title: 'Error enrolling student',
        description: err instanceof Error ? err.message : 'An unknown error occurred',
        status: 'error',
        duration: 3000,
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const issueCertificate = async (studentAddress: string, certificate: { title: string; description: string }): Promise<boolean> => {
    if (!account) {
      toast({
        title: 'خطأ في العنوان | Address Error',
        description: 'لم يتم العثور على عنوان المحفظة | Wallet address not found',
        status: 'error',
        duration: 3000,
      });
      return false;
    }

    try {
      setIsLoading(true);
      await issueCertificateUtil(studentAddress, JSON.stringify(certificate));
      await loadCertificatesFromContract(account);
      return true;
    } catch (err: any) {
      console.error('Error issuing certificate:', err);
      toast({
        title: 'Error issuing certificate',
        description: err instanceof Error ? err.message : 'An unknown error occurred',
        status: 'error',
        duration: 3000,
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const saveInstitutionProfile = async (data: InstitutionData): Promise<void> => {
    if (!examManagement || !account || !publicClient) {
      throw new Error('Contract or address not available');
    }

    // Validate required fields
    if (!data.name || !data.ministry || !data.university || !data.college ||
      !data.description || !data.imageUrl || !data.website || !data.email || !data.phone) {
      throw new Error('جميع الحقول مطلوبة | All fields are required');
    }

    try {
      setIsLoading(true);
      // Direct function call without using write property
      const hash = await examManagement.updateInstitutionProfile([
        data.name,
        data.ministry,
        data.university,
        data.college,
        data.description,
        data.imageUrl || '',
        data.website || '',
        data.email || '',
        data.phone || ''
      ]) as Hash;

      await publicClient.waitForTransactionReceipt({ hash });
      setInstitutionData(data);
      toast({
        title: 'تم الحفظ بنجاح | Saved Successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error saving institution profile:', error);
      toast({
        title: 'خطأ في الحفظ | Error Saving',
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Add this to help with troubleshooting contract methods
  const logContractMethods = (contract: any, name: string) => {
    if (!contract) return;

    console.log(`Contract ${name} methods:`, {
      contractExists: !!contract,
      methods: Object.keys(contract),
      hasCreateExam: typeof contract.createExam,
      hasUpdateProfile: typeof contract.updateInstitutionProfile
    });
  };

  // Call this function in useEffect to log contract methods when they load
  useEffect(() => {
    if (examManagement && certificates) {
      logContractMethods(examManagement, 'examManagement');
      logContractMethods(certificates, 'certificates');
    }
  }, [examManagement, certificates]);

  return {
    institutionData,
    isVerified,
    isLoading: isLoading || contractsLoading,
    error,
    isInitialized,
    isCorrectNetwork,
    exams,
    certificatesData,
    hasAccess,
    selectedExamResults,
    examStatistics,
    createExam,
    saveInstitutionProfile,
    updateExamStatus,
    registerStudents,
    handleSubmitResults,
    handleEnrollStudent,
    loadExamResults,
    issueCertificate,
  };
};