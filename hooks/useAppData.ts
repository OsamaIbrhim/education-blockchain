import { useState, useEffect, useCallback } from 'react';
import { usePublicClient } from 'wagmi';
import { useAccount } from 'wagmi';
import { Toast } from '@chakra-ui/react';
import { useContract } from './useContract';

// Services
import { getUserData, verifyUser as verifyUserService, isOwner, getUsersByRole, registerAdminUser, adminRole } from 'services/identity';
import { createExam, getExamResult, getUserExams, registerStudentsForExam, submitResult, updateExam } from 'services/examManagement';
import { getUserCertificates, issueCertificate } from 'services/certificate';
import { uploadToIPFS } from 'utils/ipfsUtils';
import { getCoursesByDepartment } from 'services/courseManagement';

// Types
import { ExamData, ExamResult, ExamStatistics, NewExam } from 'types/examManagement';
import { Institution } from 'types/institution';
import { Hash } from 'viem';
import { useRouter } from 'next/router';

interface User {
    address: string; // userAddress
    role: number; // role (uint8)
    nationalId: string; // nationalId
    firstName: string; // firstName
    lastName: string; // lastName
    phoneNumber: string; // phoneNumber
    email: string; // email
    enrolledCourses: string[]; // enrolledCourses
    status: number; // status (uint8)
    isVerified: boolean // isVerified
}

interface UseAppDataReturn {
    isLoading: boolean;
    isVerified: boolean;
    error: string | null;
    isInitialized: boolean | undefined;
    isCorrectNetwork: boolean | undefined;
    exams: ExamData[];
    courses: any[];
    certificates: any[];
    selectedExamResults: ExamResult[];
    examStatistics: ExamStatistics | null;
    institutionData: Institution | null;
    userRole: string | null;
    address: `0x${string}` | undefined;
    account: User;
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
    loadCourseByDepartment: (department: string) => Promise<any[]>;
    addAdmin: (adminData: { address: string; nationalId: string; firstName: string; lastName: string; phoneNumber: string; email: string; }) => Promise<void>;
    getAdminStats: (institutionAddress: string) => Promise<{
        studentCount: number;
        employerCount: number;
        adminCount: number;
        totalUserCount: number;
    }>;
    isUserOwner: boolean;
}

export const useAppData = (): UseAppDataReturn => {
    const { address } = useAccount();
    const { identityContract, examManagementContract, certificateContract, courseManagementContract, isInitialized, isCorrectNetwork, isLoadingContract } = useContract();
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isVerified, setIsVerified] = useState(false);
    const [exams, setExams] = useState<ExamData[]>([]);
    const [certificates, setCertificates] = useState<any[]>([]);
    const [courses, setCourses] = useState<any[]>([]);
    const [selectedExamResults, setSelectedExamResults] = useState<ExamResult[]>([]);
    const [examStatistics, setExamStatistics] = useState<ExamStatistics | null>(null);
    const publicClient = usePublicClient();
    const [institutionData, setInstitutionData] = useState<Institution | null>(null);
    const [allInstitutions, setAllInstitutions] = useState<Institution[]>([]);
    const [userRole, setUserRole] = useState<string | null>(null);
    const [account, setAccount] = useState<any>({});
    const [isUserOwner, setUserIsOwner] = useState<boolean>(false);
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
            // Don't redirect - let the blockchain connection work normally
            return;
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
            if (!address || !isInitialized || !isCorrectNetwork) {
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
    }, [address, examManagementContract, certificateContract, isInitialized, isCorrectNetwork]);

    useEffect(() => {
        const checkVerificationStatus = async () => {
            if (!address || !examManagementContract || !isInitialized || !isCorrectNetwork) {
                return;
            }

            try {
                // The function returns multiple values, we need to destructure them
                const institution = await getUserData(address);

                setIsVerified(true);
            } catch (error) {
                console.error('Error checking verification status:', error);
                setIsVerified(false);
            }
        };
        checkVerificationStatus();
    }, [address, examManagementContract, isInitialized, isCorrectNetwork]);

    useEffect(() => {
        const fetchUserData = async () => {
            if (address) {
                const user = await getUserData(address);
                if (!user) {
                    setUserRole('unknown');
                    return;
                }

                // Sanitize string fields
                const sanitizeString = (value: any): string => (typeof value === 'string' ? value.trim() : '');

                const sanitizedUser = {
                    ...user,
                    firstName: sanitizeString(user.firstName),
                    lastName: sanitizeString(user.lastName),
                    email: sanitizeString(user.email),
                    phoneNumber: sanitizeString(user.phoneNumber),
                };

                const role = sanitizedUser.role;
                setAccount({
                    ...sanitizedUser,
                });
                setIsVerified(sanitizedUser.isVerified);
                setUserRole(role);
            }
        };
        fetchUserData();
    }, [address]);

    // load exams
    useEffect(() => {
        if (address && examManagementContract && isInitialized && isCorrectNetwork) {
            loadExamsFromContract(address);
        }
    }, [address, examManagementContract, isInitialized, isCorrectNetwork]);

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
        if (address && examManagementContract && isInitialized && isCorrectNetwork) {
            loadCertificatesFromContract(address);
        }
    }, [address, certificateContract, isInitialized, isCorrectNetwork]);

    const loadCertificatesFromContract = async (userAddress: string) => {
        if (!userAddress) {
            return [];
        }

        try {
            setIsLoading(true);
            const certificates = await getUserCertificates(userAddress);
            setCertificates(certificates);
            setIsLoading(false);
        } catch (error: any) {
            console.error('Error loading certificates:', error);
            setError(error?.message || 'Error loading certificates');
            setIsLoading(false);
        }
    };

    // effect to load courses
    // useEffect(() => {
    //     if (address && courseManagementContract && isInitialized && isCorrectNetwork) {
    //         loadCoursesFromContract();
    //     }
    // }, [address, courseManagementContract, isInitialized, isCorrectNetwork]);

    const loadCourseByDepartment = async (department: string): Promise<any[]> => {
        if (!courseManagementContract /*|| !userAddress*/) {
            return [];
        }

        try {
            setIsLoading(true);
            const courses = await getCoursesByDepartment(department);
            setCourses(courses);
            setIsLoading(false);
            return courses;
        } catch (error) {
            console.error('Error loading certificates:', error);
            setIsLoading(false);
            return [];
        }
    };

    // Exam Managment
    const createNewExam = async (exam: NewExam): Promise<any> => {
        if (!address || !examManagementContract || !publicClient) {
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

            await loadExamsFromContract(address);

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
        if (!address) {
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
            await updateExam(examId, exam, exam.date, exam.isActive);
            await loadExamsFromContract(address);
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
        if (!address) {
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
            const success = await registerStudentsForExam(examId, students);
            if (success) {
                Toast({ title: 'Student Registered', status: 'success' });
                await loadExamsFromContract(address!);
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
        if (!address) {
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
                await submitResult(examId, result.studentAddress, result.score, result.grade, '');
            }
            await loadExamsFromContract(address);
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
            const currentExam = exams.find(exam => exam.examId === examId);
            if (!currentExam || !currentExam.students || currentExam.students.length === 0) {
                console.warn('Exam not found or has no students:', examId);
                setSelectedExamResults([]);
                setExamStatistics(null);
                return;
            }

            const examResultsPromises = currentExam.students.map(async (studentId: string) => {
                try {
                    const result = await getExamResult(examId, studentId);
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
                examId: examId,
                score: Number(entry.result.score),
                grade: entry.result.grade,
                notes: entry.result.notes ?? '',
                submissionTime: entry.result.submissionTime,
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

            // setExamStatistics({
            //     totalStudents: BigInt(totalStudents),
            //     passingCount: passingStudents,
            //     aCount: gradeCount.A,
            //     bCount: gradeCount.B,
            //     cCount: gradeCount.C,
            //     dCount: gradeCount.D,
            //     fCount: gradeCount.F,
            //     averageScore: BigInt(totalStudents > 0 ? totalScore / totalStudents : 0),
            //     passRate: BigInt(totalStudents > 0 ? (passingStudents * 100) / totalStudents : 0),
            //     mostCommonGrade
            // });

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
        if (!address) {
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
            const success = await registerStudentsForExam(examId, studentAddresses);
            if (success) {
                Toast({ title: 'Student Registered', status: 'success' });
                await loadExamsFromContract(address!);
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
        if (!address) {
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
            certificate.institutionAddress = address;
            const ipfsHash = await uploadToIPFS({
                data: certificate,
                timestamp: new Date().toISOString()
            });
            await issueCertificate(studentAddress, ipfsHash);
            await loadCertificatesFromContract(address);
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
        if (!examManagementContract || !address || !publicClient) {
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
        if (!address || !identityContract) return;
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
    }, [address, identityContract]);

    useEffect(() => {
        loadAllInstitutionData();
    }, [address, identityContract]);

    const verifyUser = async (userAddress: string): Promise<any> => {
        if (!identityContract || !address) {
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

    const addAdmin = async (adminData: {
        address: string;
        nationalId: string;
        firstName: string;
        lastName: string;
        phoneNumber: string;
        email: string;
    }): Promise<void> => {
        if (!identityContract || !address) {
            throw new Error('Contract or address not available');
        }

        try {
            setIsLoading(true);
            const { status } = await registerAdminUser(
                adminData.address,
                adminData.nationalId,
                adminData.firstName,
                adminData.lastName,
                adminData.phoneNumber,
                adminData.email
            );
            if (status === 'success') {
                Toast({
                    title: 'Admin Added Successfully',
                    status: 'success',
                    duration: 3000,
                    isClosable: true,
                });
            }
        } catch (error) {
            console.error('Error adding admin:', error);
            Toast({
                title: 'Error Adding Admin',
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

    const getAdminStats = async (institutionAddress: string): Promise<{
        studentCount: number;
        employerCount: number;
        adminCount: number;
        totalUserCount: number;
    }> => {
        if (!examManagementContract || !institutionAddress) {
            throw new Error('Contract or institution address not available');
        }
        try {
            setIsLoading(true);
            const {
                studentCount,
                employerCount,
                adminCount,
                totalUserCount,
            } = await adminRole.getAdminStats();

            return {
                studentCount: Number(studentCount),
                employerCount: Number(employerCount),
                adminCount: Number(adminCount),
                totalUserCount: Number(totalUserCount),
            };
        } catch (error) {
            console.error('Error fetching admin stats:', error);
            throw new Error(error instanceof Error ? error.message : 'An unknown error occurred');
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        const checkOwnerStatus = async () => {
            if (!address) return;
            try {
                const ownerStatus = await isOwner(address);
                setUserIsOwner(ownerStatus);
            } catch (error) {
                console.error('Error checking owner status:', error);
            }
        };

        checkOwnerStatus();
    }, [address]);

    return {
        isLoading: isLoading || isLoadingContract,
        isVerified,
        error,
        isInitialized,
        isCorrectNetwork,
        exams,
        courses,
        certificates,
        selectedExamResults,
        examStatistics,
        institutionData,
        allInstitutions,
        userRole,
        address,
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
        loadCourseByDepartment,
        addAdmin,
        getAdminStats,
        isUserOwner,
    };
};

type RoleString = 'none' | 'student' | 'institution' | 'employer' | 'admin' | 'unknown';

export const getUserRoleText = (roleId: number): RoleString => {
    switch (roleId) {
        case 0:
            return 'none';
        case 1:
            return 'student';
        case 2:
            return 'institution';
        case 3:
            return 'employer';
        case 4:
            return 'admin';
        default:
            return 'unknown';
    }
};