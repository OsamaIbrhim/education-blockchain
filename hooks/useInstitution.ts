import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { ethers } from 'ethers';
import {
  getUserRole,
  isVerifiedUser,
  getCertificates,
  getInstitutionExams,
  updateExamStatus,
  submitExamResult,
  getExamResult,
  enrollStudent,
  createExam,
  getContract
} from '../utilsFront/contracts';
import { uploadToIPFS, getFromIPFS } from '../utils/ipfs';
import { Certificate, Exam, ExamResult, ExamStatistics, NewExam } from '../types/institution';
import { useAccount } from 'wagmi';
import { useContract } from './useContract';
import { InstitutionData } from '../components/institution/InstitutionProfile';

// Add type for local storage
const INSTITUTION_STORAGE_KEY = 'institution_data';
const EXAMS_STORAGE_KEY = 'institution_exams';
const CERTIFICATES_STORAGE_KEY = 'institution_certificates';

export const useInstitution = () => {
  const { 
    examManagementContract, 
    certificatesContract, 
    isInitialized: contractsInitialized,
    isLoading: contractsLoading 
  } = useContract();
  const { address = undefined, isConnected = false } = useAccount() || {};
  const toast = useToast();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [initializationAttempts, setInitializationAttempts] = useState(0);
  const [institution, setInstitution] = useState<InstitutionData | null>(null);
  const [exams, setExams] = useState<Exam[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [hasAccess, setHasAccess] = useState(false);
  const [selectedExamResults, setSelectedExamResults] = useState<ExamResult[]>([]);
  const [examStatistics, setExamStatistics] = useState<ExamStatistics | null>(null);

  const checkAccess = async (userAddress: string) => {
    console.log('[CheckAccess] Starting access check for:', userAddress);

    if (!examManagementContract) {
      console.error('[CheckAccess] Contract not initialized');
      toast({ 
        title: 'Error',
        description: 'Contract not initialized. Please try again.',
        status: 'error'
      });
      return false;
    }

    try {
      console.log('[CheckAccess] Checking if address is institution...');
      const isInstitutionResult = await examManagementContract.isInstitution(userAddress);
      console.log('[CheckAccess] isInstitution result:', isInstitutionResult);

      if (!isInstitutionResult) {
        console.log('[CheckAccess] Address is not registered as institution');
        toast({ 
          title: 'Error',
          description: 'Address is not registered as an institution',
          status: 'error'
        });
        return false;
      }

      console.log('[CheckAccess] Getting institution data...');
      const institutionData = await examManagementContract.getInstitution(userAddress);
      console.log('[CheckAccess] Institution data:', institutionData);

      if (!institutionData || institutionData.length < 10) {
        console.error('[CheckAccess] Invalid institution data received');
        toast({ 
          title: 'Error',
          description: 'Invalid institution data',
          status: 'error'
        });
        return false;
      }

      const isVerified = Boolean(institutionData[9]);
      console.log('[CheckAccess] Institution verification status:', isVerified);

      if (!isVerified) {
        toast({ 
          title: 'Error',
          description: 'Institution is not verified',
          status: 'error'
        });
        return false;
      }

      console.log('[CheckAccess] Access granted');
      return true;
    } catch (error) {
      console.error('[CheckAccess] Error checking access:', error);
      toast({ 
        title: 'Error',
        description: 'Error checking institution access',
        status: 'error'
      });
      return false;
    }
  };

  useEffect(() => {
    let isMounted = true;
    let initTimeout: NodeJS.Timeout;

    const initializeData = async () => {
      try {
        const initState = {
          isConnected,
          hasAddress: !!address,
          hasExamContract: !!examManagementContract,
          hasCertificatesContract: !!certificatesContract,
          contractsInitialized,
          contractsLoading,
          attempts: initializationAttempts
        };

        console.log('Institution initialization state:', initState);

        if (!isConnected || !address) {
          console.log('Not connected or no address available');
          if (isMounted) {
            setIsLoading(false);
            setHasAccess(false);
            setIsInitialized(false);
          }
          return;
        }

        // Wait for contracts to finish loading
        if (contractsLoading) {
          console.log('Contracts are still loading...');
          return;
        }

        // Check contract initialization
        if (!examManagementContract || !certificatesContract || !contractsInitialized) {
          console.error('Contract initialization check failed:', {
            hasExamContract: !!examManagementContract,
            hasCertificatesContract: !!certificatesContract,
            isInitialized: contractsInitialized
          });

          if (isMounted) {
            setIsLoading(false);
            setHasAccess(false);
            setIsInitialized(false);
            
            // Retry initialization if under max attempts
            if (initializationAttempts < 3) {
              console.log(`Scheduling retry attempt ${initializationAttempts + 1}/3...`);
              initTimeout = setTimeout(() => {
                setInitializationAttempts(prev => prev + 1);
              }, 2000 * (initializationAttempts + 1)); // Exponential backoff
            } else {
              console.error('Max initialization attempts reached');
              toast({
                title: 'خطأ في تهيئة العقود | Contract Initialization Error',
                description: 'فشل في تهيئة العقود بعد عدة محاولات. يرجى التأكد من اتصال المحفظة والشبكة الصحيحة | Failed to initialize contracts after several attempts. Please check your wallet connection and network.',
                status: 'error',
                duration: 5000,
                isClosable: true,
              });
            }
          }
        }

        // Reset attempts on successful initialization
        if (initializationAttempts > 0) {
          setInitializationAttempts(0);
        }

        if (isMounted) {
          setIsLoading(true);
        }

        // Check access first
        const accessGranted = await checkAccess(address);
        console.log('Access check result:', accessGranted);
        
        if (!isMounted) return;
        
        setHasAccess(accessGranted);

        if (!accessGranted) {
          setIsLoading(false);
          setIsInitialized(false);
          return;
        }

        // Load data only if access is granted
        const [institutionData, examsData, certificatesData] = await Promise.all([
          loadInstitutionFromContract(address),
          loadExamsFromContract(address),
          loadCertificatesFromContract(address)
        ]);

        if (!isMounted) return;

        if (institutionData) {
          setInstitution(institutionData);
          setIsInitialized(true);
        } else {
          console.error('Failed to load institution data');
          setIsInitialized(false);
        }

        if (examsData) {
          setExams(examsData);
        }

        if (certificatesData) {
          setCertificates(certificatesData);
        }

      } catch (error) {
        console.error('Critical initialization error:', {
          error: error instanceof Error ? {
            name: error.name,
            message: error.message,
            stack: error.stack
          } : 'Unknown error',
          state: {
            address,
            contractStatus: {
              hasExamContract: !!examManagementContract,
              hasCertificatesContract: !!certificatesContract,
              isInitialized: contractsInitialized,
              isLoading: contractsLoading
            }
          }
        });
        
        if (isMounted) {
          setIsInitialized(false);
          setHasAccess(false);
          toast({
            title: 'خطأ في تهيئة البيانات | Data Initialization Error',
            description: error instanceof Error 
              ? `${error.message} | يرجى المحاولة مرة أخرى` 
              : 'حدث خطأ غير معروف | An unknown error occurred',
            status: 'error',
            duration: 5000,
            isClosable: true,
          });
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    initializeData();

    return () => {
      isMounted = false;
      if (initTimeout) {
        clearTimeout(initTimeout);
      }
    };
  }, [
    isConnected, 
    address, 
    examManagementContract, 
    certificatesContract, 
    contractsInitialized,
    contractsLoading,
    initializationAttempts,
    toast
  ]);

  // Helper functions with proper type checking
  const loadInstitutionFromContract = async (userAddress: `0x${string}`): Promise<InstitutionData | null> => {
    if (!examManagementContract || !userAddress) return null;

    try {
      const data = await examManagementContract.getInstitution(userAddress);
      return {
        name: data.name,
        ministry: data.ministry,
        university: data.university,
        college: data.college,
        description: data.description,
        imageUrl: data.imageUrl,
        website: data.website,
        email: data.email,
        phone: data.phone,
      };
    } catch (error) {
      console.error('Error loading institution:', error);
      return null;
    }
  };

  const loadExamsFromContract = async (userAddress: `0x${string}`): Promise<Exam[]> => {
    if (!examManagementContract || !userAddress) {
      return [];
    }

    try {
      return await examManagementContract.getInstitutionExams(userAddress);
    } catch (error) {
      console.error('Error loading exams:', error);
      return [];
    }
  };

  const loadCertificatesFromContract = async (userAddress: `0x${string}`): Promise<Certificate[]> => {
    if (!certificatesContract || !userAddress) {
      return [];
    }

    try {
      return await certificatesContract.getInstitutionCertificates(userAddress);
    } catch (error) {
      console.error('Error loading certificates:', error);
      return [];
    }
  };

  const createExam = async (exam: NewExam): Promise<boolean> => {
    if (!address) {
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
      const contract = await getContract();
      const tx = await contract.createExam(exam.title, exam.description, exam.date);
      await tx.wait();
      await loadExamsFromContract(address);
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
    if (!address) {
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
      const contract = await getContract();
      const tx = await contract.updateExamStatus(examId, status);
      await tx.wait();
      await loadExamsFromContract(address);
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
    try {
      setIsLoading(true);
      const contract = await getContract();
      const tx = await contract.registerStudents(examId, students);
      await tx.wait();
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
    try {
      setIsLoading(true);
      const contract = await getContract();
      const tx = await contract.submitResults(examId, results);
      await tx.wait();
      await loadExamResults(examId);
      toast({
        title: 'تم إضافة النتائج بنجاح | Results submitted successfully',
        status: 'success',
        duration: 3000,
      });
      return true;
    } catch (err: unknown) {
      console.error('Error submitting results:', err);
      toast({
        title: 'حدث خطأ | Error occurred',
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
    if (!address) {
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
      await enrollStudent(examId, studentAddress);
      toast({
        title: 'Student enrolled successfully',
        status: 'success',
        duration: 3000,
      });
      await loadExamsFromContract(address);
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
    if (!address) {
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
      const contract = await getContract();
      const tx = await contract.issueCertificate(studentAddress, certificate.title, certificate.description);
      await tx.wait();
      await loadCertificatesFromContract(address);
      toast({
        title: 'Certificate issued successfully',
        status: 'success',
        duration: 3000,
      });
      return true;
    } catch (err: unknown) {
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
    if (!examManagementContract || !address) {
      throw new Error('Contract or address not available');
    }

    // Validate required fields
    if (!data.name || !data.ministry || !data.university || !data.college || 
        !data.description || !data.imageUrl || !data.website || !data.email || !data.phone) {
      throw new Error('جميع الحقول مطلوبة | All fields are required');
    }

    try {
      setIsLoading(true);
      const tx = await examManagementContract.write.updateInstitutionProfile({
        args: [
          data.name,
          data.ministry,
          data.university,
          data.college,
          data.description,
          data.imageUrl || '',
          data.website || '',
          data.email || '',
          data.phone || ''
        ]
      });
      await tx.wait();
      setInstitution(data);
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
    institution,
    exams,
    certificates,
    isLoading,
    isInitialized,
    hasAccess,
    selectedExamResults,
    examStatistics,
    saveInstitutionProfile,
    createExam,
    updateExamStatus,
    registerStudents,
    handleSubmitResults,
    handleEnrollStudent,
    loadExamResults,
    issueCertificate,
  };
}; 