import { useState, useEffect, useRef } from 'react';
import { useToast } from '@chakra-ui/react';
import { useAccount, usePublicClient } from 'wagmi';
import { useContract } from './useContract';
import type { Hash } from 'viem';
import { Exam, ExamResult, ExamStatistics, NewExam, ExamResultStructOutput, ExamData } from '../types/examManagement';
import { Certificate } from '../types/certificate';
import { Institution } from 'types/institution';
import { useRouter } from 'next/router';

// services
import {
  issueCertificate as issueCertificateService,
  getUserCertificates
} from 'services/certificate';
import {
  getExamResults,
  submitExamResult,
  createExam as createExamService,
  getUserExams,
  registerStudentsForExam,
  updateExam as updateExamService,
} from 'services/examManagement';
import { getUserData } from 'services/identity';
import { uploadToIPFS } from 'utils/ipfsUtils';

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
  const { examManagementContract, certificateContract, isInitialized, isCorrectNetwork, isLoading: contractsLoading } = useContract();
  const [institutionData, setInstitutionData] = useState<Institution | null>(null);
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exams, setExams] = useState<ExamData[]>([]);
  const [certificatesData, setCertificatesData] = useState<any[]>([]);
  const [selectedExamResults, setSelectedExamResults] = useState<ExamResult[]>([]);
  const [examStatistics, setExamStatistics] = useState<ExamStatistics | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const checkAccess = async () => {
      try {
        if (!account || !isInitialized || !isCorrectNetwork) {
          // throw new Error('');
          return;
        }

        if (!examManagementContract || !certificateContract) {
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

  }, [account, examManagementContract, certificateContract, isInitialized, isCorrectNetwork]);

  useEffect(() => {
    const checkVerificationStatus = async () => {
      if (!account || !examManagementContract || !isInitialized || !isCorrectNetwork) {
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
  }, [account, examManagementContract, isInitialized, isCorrectNetwork]);

  // effect to load exams
  useEffect(() => {
    if (account && examManagementContract && isInitialized && isCorrectNetwork) {
      loadExamsFromContract(account);
    }
  }, [account, examManagementContract, isInitialized, isCorrectNetwork]);

  const loadExamsFromContract = async (userAddress: `0x${string}`) => {
    if (!examManagementContract || !userAddress) {
      return [];
    }

    try {
      const updatedExams = await getUserExams(userAddress) as unknown as ExamData[];
      console.log("Loaded exams:", updatedExams);
      setExams(updatedExams || []);
    } catch (error) {
      console.error('Error loading exams:', error);
      return [];
    }
  };

  // effect to load certificates
  useEffect(() => {
    if (account && examManagementContract && isInitialized && isCorrectNetwork) {
      loadCertificatesFromContract(account);
    }
  }, [account, certificateContract, isInitialized, isCorrectNetwork]);

  const loadCertificatesFromContract = async (userAddress: `0x${string}`) => {
    if (!certificateContract || !userAddress) {
      return [];
    }

    try {
      setIsLoading(true);
      const updatedCertificats = await getUserCertificates(userAddress);
      setCertificatesData(updatedCertificats);
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading certificates:', error);
      setIsLoading(false);
      return [];
    }
  };

  // create exam
  const createExam = async (exam: NewExam): Promise<any> => {
    if (!account || !examManagementContract || !publicClient) {
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

  const updateExam = async (examId: string, exam: any): Promise<boolean> => {
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
      await updateExamService(examId, exam);
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
      const success = await registerStudentsForExam(examId, students, null);
      if (success) {
        toast({ title: 'Student Registered', status: 'success' });
        await loadExamsFromContract(account!);
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
        notes: '',
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

  const handleEnrollStudents = async (examId: string, studentAddresses: string[]) => {
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
      const success = await registerStudentsForExam(examId, studentAddresses, null);
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

  const issueCertificate = async (studentAddress: string, certificate: { title: string; metadata: any; studentAddress?:string; institutionAddress?: string }): Promise<boolean> => {
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
      certificate.studentAddress = studentAddress;
      certificate.institutionAddress = account;
      const ipfsHash = await uploadToIPFS({
        data: certificate,
        timestamp: new Date().toISOString()
      });
      await issueCertificateService(studentAddress, ipfsHash);
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

  const saveInstitutionProfile = async (data: Institution): Promise<void> => {
    if (!examManagementContract || !account || !publicClient) {
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
      const hash = await examManagementContract.updateInstitutionProfile([
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
  // const logContractMethods = (contract: any, name: string) => {
  //   if (!contract) return;

  //   console.log(`Contract ${name} methods:`, {
  //     contractExists: !!contract,
  //     methods: Object.keys(contract),
  //     hasCreateExam: typeof contract.createExam,
  //     hasUpdateProfile: typeof contract.updateInstitutionProfile
  //   });
  // };

  // // Call this function in useEffect to log contract methods when they load
  // useEffect(() => {
  //   if (examManagement && certificates) {
  //     logContractMethods(examManagement, 'examManagement');
  //     logContractMethods(certificates, 'certificates');
  //   }
  // }, [examManagement, certificates]);

  return {
    institutionData,
    isVerified,
    isLoading: isLoading || contractsLoading,
    error,
    isInitialized,
    isCorrectNetwork,
    exams,
    certificatesData,
    selectedExamResults,
    examStatistics,
    createExam,
    saveInstitutionProfile,
    updateExam,
    registerStudents,
    handleSubmitResults,
    handleEnrollStudents,
    loadExamResults,
    issueCertificate,
  };
};