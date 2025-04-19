import { useState, useEffect } from 'react';
import { useToast } from '@chakra-ui/react';
import { useAccount, usePublicClient } from 'wagmi';
import { useContract } from './useContract';
import type { Hash } from 'viem';
import { Certificate, Exam, ExamResult, ExamStatistics, NewExam } from '../types/institution';
import { InstitutionData } from '../components/institution/InstitutionProfile';
import { uploadToIPFS, getFromIPFS } from '../utils/ipfs';
import {
  getUserRole,
  isVerifiedUser,
  getCertificates,
  getInstitutionExams,
  updateExamStatus as updateExamStatusUtil,
  submitExamResult,
  getExamResult,
  enrollStudent as enrollStudentUtil,
  createExam as createExamUtil,
  issueCertificate as issueCertificateUtil
} from '../utils/contracts';

// Add type for local storage
const INSTITUTION_STORAGE_KEY = 'institution_data';
const EXAMS_STORAGE_KEY = 'institution_exams';
const CERTIFICATES_STORAGE_KEY = 'institution_certificates';

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

  useEffect(() => {
    const checkAccess = async () => {
      try {
        if (!account || !isInitialized || !isCorrectNetwork) {
          return;
        }

        if (!examManagement || !certificates) {
          console.log('Contracts not initialized');
          return;
        }

        // Check if user is an institution
        const isInstitution = await examManagement.read.isInstitution([account]) as boolean;
        if (!isInstitution) {
          setError('Not registered as an institution');
          return;
        }

        // Get institution data
        const data = await examManagement.read.getInstitution([account]) as InstitutionResponse;
        if (!data || !data.exists) {
          setError('Institution data not found');
          return;
        }

        const institutionDataFormatted: InstitutionData = {
          name: data.name,
          ministry: data.ministry,
          university: data.university,
          college: data.college,
          description: data.description,
          imageUrl: data.imageUrl,
          website: data.website,
          email: data.email,
          phone: data.phone
        };

        setInstitutionData(institutionDataFormatted);
        setIsVerified(data.isVerified);
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
  }, [account, examManagement, certificates, isInitialized, isCorrectNetwork, toast]);

  const loadExamsFromContract = async (userAddress: `0x${string}`): Promise<Exam[]> => {
    if (!examManagement || !userAddress) {
      return [];
    }

    try {
      const result = await examManagement.read.getInstitutionExams([userAddress]) as unknown as Exam[];
      return result;
    } catch (error) {
      console.error('Error loading exams:', error);
      return [];
    }
  };

  const loadCertificatesFromContract = async (userAddress: `0x${string}`): Promise<Certificate[]> => {
    if (!certificates || !userAddress) {
      return [];
    }

    try {
      const result = await certificates.read.getInstitutionCertificates([userAddress]) as unknown as Certificate[];
      return result;
    } catch (error) {
      console.error('Error loading certificates:', error);
      return [];
    }
  };

  const createExam = async (exam: NewExam): Promise<boolean> => {
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
      const hash = await examManagement.write.createExam([exam.title, exam.description, exam.date]) as Hash;
      await publicClient.waitForTransactionReceipt({ hash });
      await loadExamsFromContract(account);
      return true;
    } catch (err: any) {
      console.error('Error creating exam:', err);
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
      console.error('Error updating exam status:', err);
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
        await enrollStudentUtil(examId, student);
      }
      await loadExamsFromContract(account);
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
      const currentExam = exams.find(exam => exam.id === examId);
      if (!currentExam) {
        throw new Error('Exam not found');
      }

      const examResultsList = await Promise.all(
        currentExam.students.map(async (studentId: string) => {
          try {
            const result = await getExamResult(examId, studentId);
            return result;
          } catch {
            return null;
          }
        })
      );

      const validResults = examResultsList.filter((result): result is ExamResult => result !== null);
      setSelectedExamResults(validResults);

      if (validResults.length === 0) {
        setExamStatistics(null);
        return;
      }

      // Calculate statistics
      const totalStudents = validResults.length;
      const passingStudents = validResults.filter(result => result.score >= 60).length;
      const totalScore = validResults.reduce((sum, result) => sum + result.score, 0);

      const gradeCount = {
        A: validResults.filter(result => result.grade === 'A').length,
        B: validResults.filter(result => result.grade === 'B').length,
        C: validResults.filter(result => result.grade === 'C').length,
        D: validResults.filter(result => result.grade === 'D').length,
        F: validResults.filter(result => result.grade === 'F').length
      };

      const mostCommonGrade = Object.entries(gradeCount)
        .reduce((a, b) => a[1] > b[1] ? a : b)[0];

      setExamStatistics({
        totalStudents,
        passingCount: passingStudents,
        aCount: gradeCount.A,
        bCount: gradeCount.B,
        cCount: gradeCount.C,
        dCount: gradeCount.D,
        fCount: gradeCount.F,
        averageScore: totalScore / totalStudents,
        passRate: (passingStudents * 100) / totalStudents,
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
      await enrollStudentUtil(examId, studentAddress);
      toast({
        title: 'Student enrolled successfully',
        status: 'success',
        duration: 3000,
      });
      await loadExamsFromContract(account);
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
      const hash = await examManagement.write.updateInstitutionProfile([
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