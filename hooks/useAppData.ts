import { useState, useEffect, useCallback } from 'react';
import { usePublicClient } from 'wagmi';
import { useAccount } from 'wagmi';
import { Toast } from '@chakra-ui/react';
import { useContract } from './useContract';

// Services
import { getUserData, verifyUser as verifyUserService, getUserRole, getUsersByRole } from 'services/identity';
import { createExam, getExamResults, getUserExams, registerStudentsForExam, submitExamResult, updateExam } from 'services/examManagement';
import { getUserCertificates, issueCertificate } from 'services/certificate';
import { uploadToIPFS } from 'utils/ipfsUtils';

// Types
import { Exam, ExamData, ExamResult, ExamStatistics, NewExam, StudentStructOutput } from 'types/examManagement';
import { Institution } from 'types/institution';
import { Hash } from 'viem';
import { useRouter } from 'next/router';

interface UseAppDataReturn {
    isLoading: boolean;
    isVerified: boolean;
    error: string | null;
    isInitialized: boolean | undefined;
    isCorrectNetwork: boolean | undefined;
    exams: ExamData[];
    certificates: any[];
    selectedExamResults: ExamResult[];
    examStatistics: ExamStatistics | null;
    institutionData: Institution | null;
    userRole: string | null;
    account: `0x${string}` | undefined;
    checkAccess: () => Promise<void>;
    createNewExam: (exam: NewExam) => Promise<any>;
    saveInstitutionProfile: (data: Institution) => Promise<void>;
    updateExamData: (examId: string, exam: any) => Promise<boolean>;
    registerStudents: (examId: string, students: string[]) => Promise<boolean>;
    handleSubmitResults: (examId: string, results: ExamResult[]) => Promise<boolean>;
    handleEnrollStudents: (examId: string, studentAddresses: string[]) => Promise<boolean>;
    loadExamResults: (examId: string) => Promise<void>;
    issueNewCertificate: (studentAddress: string, certificate: { title: string; metadata: any; studentAddress?: string; institutionAddress?: string }) => Promise<boolean>;
    allInstitutions: Institution[];
    verifyUser: (userAddress: string) => Promise<any>;
    loadAllInstitutionData: () => Promise<void>;
}

export const useAppData = (): UseAppDataReturn => {
    const { address: account } = useAccount();
    const { identityContract, examManagementContract, certificateContract, isInitialized, isCorrectNetwork, isLoadingContract } = useContract();
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isVerified, setIsVerified] = useState(false);
    const [exams, setExams] = useState<ExamData[]>([]);
    const [certificates, setCertificates] = useState<any[]>([]);
    const [selectedExamResults, setSelectedExamResults] = useState<ExamResult[]>([]);
    const [examStatistics, setExamStatistics] = useState<ExamStatistics | null>(null);
    const publicClient = usePublicClient();
    const [institutionData, setInstitutionData] = useState<Institution | null>(null);
    const [allInstitutions, setAllInstitutions] = useState<Institution[]>([]);
    const [userRole, setUserRole] = useState<string | null>(null);
    const router = useRouter();

    // Access & Verification check
    useEffect(() => {
        if (typeof window !== "undefined" && window.ethereum) {
            const handleAccountsChanged = () => {
                router.push("/");
            };

            window.ethereum.on?.("accountsChanged", handleAccountsChanged);

            return () => {
                window.ethereum?.removeListener?.("accountsChanged", handleAccountsChanged);
            };
        }

        if (
            !identityContract?.address ||
            !examManagementContract?.address ||
            !certificateContract?.address
        ) {
            router.push("/login");
        }
    }, [
        router,
        identityContract?.address,
        examManagementContract?.address,
        certificateContract?.address,
    ]);

    const checkAccess = async () => {
        try {
            setIsLoading(true);
            if (!account || !isInitialized || !isCorrectNetwork) {
                // throw new Error('');
                return;
            }

            if (!examManagementContract || !certificateContract) {
                throw new Error('Contracts not initialized');
            }

            setError(null);
            setIsLoading(false);
        } catch (error: any) {
            console.error('Error checking institution access:', error);
            setError(error?.message || 'Error checking institution access');
            Toast({
                title: 'Error',
                description: `Failed to verify institution access: ${error?.message || 'Unknown error'}`,
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
            setIsLoading(false);
            return;
        }
    };

    useEffect(() => {
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

    useEffect(() => {
        const fetchRole = async () => {
            if (account) {
                const role = await getUserRole(account);
                setUserRole(role);
            }
        };
        fetchRole();
    }, [account]);

    // load exams
    useEffect(() => {
        if (account && examManagementContract && isInitialized && isCorrectNetwork) {
            loadExamsFromContract(account);
        }
    }, [account, examManagementContract, isInitialized, isCorrectNetwork]);

    const loadExamsFromContract = async (userAddress: string) => {
        if (!examManagementContract || !userAddress) {
            return [];
        }

        try {
            setIsLoading(true);
            const updatedExams = await getUserExams(userAddress);
            setExams(updatedExams || []);
            setIsLoading(false);
        } catch (error: any) {
            setIsLoading(false);
            setError(error?.message || 'Error loading exams');
            return [];
        }
    };

    // load certificates
    useEffect(() => {
        if (account && examManagementContract && isInitialized && isCorrectNetwork) {
            loadCertificatesFromContract(account);
        }
    }, [account, certificateContract, isInitialized, isCorrectNetwork]);

    const loadCertificatesFromContract = async (userAddress: string) => {
        if (!userAddress) {
            return [];
        }

        try {
            setIsLoading(true);
            const updatedCertificats = await getUserCertificates(userAddress);
            setCertificates(updatedCertificats);
            setIsLoading(false);
        } catch (error: any) {
            console.error('Error loading certificates:', error);
            setError(error?.message || 'Error loading certificates');
            setIsLoading(false);
            return [];
        }
    };

    // Exam Managment
    const createNewExam = async (exam: NewExam): Promise<any> => {
        if (!account || !examManagementContract || !publicClient) {
            Toast({
                title: 'خطأ في العنوان | Address Error',
                description: 'لم يتم العثور على عنوان المحفظة أو العقد | Wallet address or contract not found',
                status: 'error',
                duration: 3000,
            });
            return false;
        }

        try {
            setIsLoading(true);

            const examData = await createExam(exam);

            if (!examData) {
                throw new Error('Failed to create exam. Please try again.');
            }

            if (examData) {
                try {
                    // await publicClient.waitForTransactionReceipt({ hash: hash as `0x${string}` });
                    Toast({
                        title: 'Transaction Confirmed',
                        description: 'Exam creation transaction mined.',
                        status: 'info',
                        duration: 2000,
                    });
                } catch (error) {
                    Toast({
                        title: 'Transaction Wait Error',
                        description: `Could not confirm transaction status. Check block explorer: ${error}`,
                        status: 'warning',
                        duration: 5000,
                    });
                }
            } else {
                console.warn("Transaction hash not received from createExamService. Reloading might show stale data.");
                Toast({
                    title: 'Transaction Not Sent?',
                    description: 'Could not get transaction hash. Exam might not have been created.',
                    status: 'warning',
                    duration: 5000,
                });
            }

            await loadExamsFromContract(account);

            if (examData) {
                Toast({
                    title: 'Exam Created & List Refreshed',
                    description: 'Your exam has been created successfully',
                    status: 'success',
                    duration: 3000,
                });
            }

            return examData;
        } catch (err: any) {
            Toast({
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

    const updateExamData = async (examId: string, exam: any): Promise<boolean> => {
        if (!account) {
            Toast({
                title: 'خطأ في العنوان | Address Error',
                description: 'لم يتم العثور على عنوان المحفظة | Wallet address not found',
                status: 'error',
                duration: 3000,
            });
            return false;
        }

        try {
            setIsLoading(true);
            await updateExam(examId, exam);
            await loadExamsFromContract(account);
            return true;
        } catch (err: any) {
            Toast({
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
            Toast({
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
                Toast({ title: 'Student Registered', status: 'success' });
                await loadExamsFromContract(account!);
            }
            return true;
        } catch (err: any) {
            console.error('Error registering students:', err);
            Toast({
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
            Toast({
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
            Toast({
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
            Toast({
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
            Toast({
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
                Toast({ title: 'Student Registered', status: 'success' });
                await loadExamsFromContract(account!);
            }
            return true;
        } catch (err: unknown) {
            console.error('Error enrolling student:', err);
            Toast({
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

    // Issue Certificate
    const issueNewCertificate = async (studentAddress: string, certificate: { title: string; metadata: any; studentAddress?: string; institutionAddress?: string }): Promise<boolean> => {
        if (!account) {
            Toast({
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
            await issueCertificate(studentAddress, ipfsHash);
            await loadCertificatesFromContract(account);
            return true;
        } catch (err: any) {
            console.error('Error issuing certificate:', err);
            Toast({
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
            Toast({
                title: 'تم الحفظ بنجاح | Saved Successfully',
                status: 'success',
                duration: 3000,
                isClosable: true,
            });
        } catch (error) {
            console.error('Error saving institution profile:', error);
            Toast({
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

    // Admin functions
    const loadAllInstitutionData = useCallback(async (): Promise<void> => {
        if (!account || !identityContract) return;
        try {
            setIsLoading(true);
            const institutions = await getUsersByRole(2);
            setAllInstitutions(institutions);
        } catch (error: any) {
            console.error('Error loading institution data:', error);
            setError(error?.message || 'Error loading institution data');
        } finally {
            setIsLoading(false);
        }
    }, [account, identityContract]);

    useEffect(() => {
        loadAllInstitutionData();
    }, [account, identityContract]);

    const verifyUser = async (userAddress: string): Promise<any> => {
        if (!identityContract || !account) {
            throw new Error('Contract or address not available');
        }
        try {
            setIsLoading(true);
            const { status } = await verifyUserService(userAddress);
            if (status === 'success') {
                await loadAllInstitutionData();
            }
            return { status };
        } catch (error) {
            console.error('Error verifying user:', error);
            Toast({
                title: 'Error Verifying User',
                description: error instanceof Error ? error.message : 'An unknown error occurred',
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
            throw error;
        } finally {
            setIsLoading(false);
        }
    }

    return {
        isLoading: isLoading || isLoadingContract,
        isVerified,
        error,
        isInitialized,
        isCorrectNetwork,
        exams,
        certificates,
        selectedExamResults,
        examStatistics,
        institutionData,
        allInstitutions,
        userRole,
        account,
        checkAccess,
        createNewExam,
        saveInstitutionProfile,
        updateExamData,
        registerStudents,
        handleSubmitResults,
        handleEnrollStudents,
        loadExamResults,
        issueNewCertificate,
        verifyUser,
        loadAllInstitutionData,
    };
};