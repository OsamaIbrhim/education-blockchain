import { useState, useEffect, useCallback } from 'react';
import { usePublicClient } from 'wagmi';
import { useAccount } from 'wagmi';
import { Exam, ExamResult, ExamStatistics, StudentStructOutput } from 'types/examManagement';
import { Toast } from '@chakra-ui/react';
import { useContract } from './useContract';
import { Certificate } from 'crypto';
import { getUserExams } from 'services/examManagement';
import { getUserCertificates } from 'services/certificate';
import { useAppData } from './useAppData';

interface UseStudentReturn {
    student: StudentStructOutput | null;
    loading: boolean;
    error: string | null;
}

export const useStudent = () => {
    const { address: account } = useAccount();
    const { certificates, isLoading: appDataLoading } = useAppData();
    const { examManagementContract, certificateContract, isInitialized, isCorrectNetwork, isLoading: contractsLoading } = useContract();
    const [error, setError] = useState<string | null>(null);
    const [exams, setExams] = useState<Exam[]>([]);
    const [certificatesData, setCertificatesData] = useState<any[]>([]);
    const [selectedExamResults, setSelectedExamResults] = useState<ExamResult[]>([]);
    const [examStatistics, setExamStatistics] = useState<ExamStatistics | null>(null);
    const [isLoading, setIsLoading] = useState(false);

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
    }, [account, examManagementContract, certificates, isInitialized, isCorrectNetwork]);

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
            const updatedExams = await getUserExams(userAddress) as unknown as Exam[];
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
    }, [account, certificates, isInitialized, isCorrectNetwork]);

    const loadCertificatesFromContract = async (userAddress: string) => {
        if (!userAddress) {
            return [];
        }

        try {
            setIsLoading(true);
            const updatedCertificats = await getUserCertificates(userAddress);
            setCertificatesData(updatedCertificats);
            setIsLoading(false);
        } catch (error: any) {
            console.error('Error loading certificates:', error);
            setError(error?.message || 'Error loading certificates');
            setIsLoading(false);
            return [];
        }
    };

    return {
        loading: isLoading || contractsLoading || appDataLoading,
        error,
        exams,
        certificatesData,
        selectedExamResults,
        examStatistics,
        checkAccess,
    };
};