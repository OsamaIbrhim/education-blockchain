import { useEffect, useState, useCallback } from 'react';
import { useAccount, usePublicClient, useWalletClient, useChainId, useConnect } from 'wagmi';
import { getContract } from 'viem';
import ExamManagementABI from '../contractsJSON/ExamManagement.json';
import CertificatesABI from '../contractsJSON/Certificates.json';
import ExaminationsABI from '../contractsJSON/Examinations.json';
import IdentityABI from '../contractsJSON/Identity.json';
import SecurityUtilsABI from '../contractsJSON/SecurityUtils.json';
import { useToast } from '@chakra-ui/react';

const EXAM_MANAGEMENT_ADDRESS = process.env.NEXT_PUBLIC_EXAM_MANAGEMENT_CONTRACT_ADDRESS || '';
const CERTIFICATES_ADDRESS = process.env.NEXT_PUBLIC_CERTIFICATES_CONTRACT_ADDRESS || '';
const EXAMINATIONS_ADDRESS = process.env.NEXT_PUBLIC_EXAMINATIONS_CONTRACT_ADDRESS || '';
const IDENTITY_ADDRESS = process.env.NEXT_PUBLIC_IDENTITY_CONTRACT_ADDRESS || '';
const SECURITY_UTILS_ADDRESS = process.env.NEXT_PUBLIC_SECURITY_UTILS_CONTRACT_ADDRESS || '';
const TARGET_CHAIN_ID = 1337; // Local network chain ID

interface ExamManagementContract {
  isInstitution: (address: string) => Promise<boolean>;
  getInstitution: (address: string) => Promise<any>;
  getInstitutionExams: (address: string) => Promise<any[]>;
  getExamResults: (examId: string) => Promise<any[]>;
  provider?: any;
  runner?: any;
  write: {
    updateInstitutionProfile: (params: {
      args: [
        name: string,
        ministry: string,
        university: string,
        college: string,
        description: string,
        logo: string,
        website: string,
        email: string,
        phone: string
      ]
    }) => Promise<{ wait: () => Promise<void> }>;
    submitExamResults: (params: {
      args: [examId: string, results: any[]],
      chainId?: number
    }) => Promise<{ wait: () => Promise<void> }>;
    registerStudents: (params: {
      args: [examId: string, students: string[]],
      chainId?: number
    }) => Promise<{ wait: () => Promise<void> }>;
    updateExamStatus: (params: {
      args: [examId: string, status: string],
      chainId?: number
    }) => Promise<{ wait: () => Promise<void> }>;
    createExam: (params: {
      args: [title: string, description: string, date: number],
      chainId?: number
    }) => Promise<{ wait: () => Promise<void> }>;
    issueCertificate: (params: {
      args: [student: string, title: string, description: string],
      chainId?: number
    }) => Promise<{ wait: () => Promise<void> }>;
  };
}

interface CertificatesContract {
  getInstitutionCertificates: (address: string) => Promise<any[]>;
  write: {
    issueCertificate: (params: {
      args: [studentAddress: string, title: string, description: string],
      chainId?: number
    }) => Promise<{ wait: () => Promise<void> }>;
  };
}

interface ExaminationsContract {
  // Add examination contract methods here
  write: {
    createExamination: (params: {
      args: [ipfsHash: string, startTime: number, endTime: number],
      chainId?: number
    }) => Promise<{ wait: () => Promise<void> }>;
    registerForExam: (params: {
      args: [examId: string],
      chainId?: number
    }) => Promise<{ wait: () => Promise<void> }>;
  };
}

interface IdentityContract {
  // Add identity contract methods here
  write: {
    registerIdentity: (params: {
      args: [name: string, email: string],
      chainId?: number
    }) => Promise<{ wait: () => Promise<void> }>;
  };
}

interface SecurityUtilsContract {
  // Add security utils contract methods here
  write: {
    verifyHash: (params: {
      args: [hash: string, signature: string],
      chainId?: number
    }) => Promise<{ wait: () => Promise<void> }>;
  };
}

export const useContract = () => {
  const { address: account } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const chainId = useChainId();
  const { connect } = useConnect();
  const toast = useToast();
  
  // Separate initialization states
  const [initState, setInitState] = useState({
    isLoading: true,
    hasAttemptedConnection: false,
    hasAttemptedNetworkSwitch: false,
    hasVerifiedNetwork: false,
    hasVerifiedContracts: false,
    error: null as string | null,
    retryCount: 0
  });

  // Contract states
  const [contracts, setContracts] = useState({
    examManagementContract: null as ExamManagementContract | null,
    certificatesContract: null as CertificatesContract | null,
    examinationsContract: null as ExaminationsContract | null,
    identityContract: null as IdentityContract | null,
    securityUtilsContract: null as SecurityUtilsContract | null
  });

  // Network verification
  const verifyNetwork = useCallback(async () => {
    if (!publicClient) return false;
    try {
      const currentChainId = await publicClient.getChainId();
      console.log(`Network verification - Current: ${currentChainId}, Target: ${TARGET_CHAIN_ID}`);
      return currentChainId === TARGET_CHAIN_ID;
    } catch (error) {
      console.error('Network verification failed:', error);
      return false;
    }
  }, [publicClient]);

  // Network switching
  const switchNetwork = useCallback(async () => {
    if (!window.ethereum) {
      throw new Error('MetaMask غير مثبت | MetaMask is not installed');
    }

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${TARGET_CHAIN_ID.toString(16)}` }]
      });
    } catch (error: any) {
      if (error.code === 4902) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: `0x${TARGET_CHAIN_ID.toString(16)}`,
            chainName: 'Ganache Local',
            rpcUrls: ['http://127.0.0.1:7545'],
            nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 }
          }]
        });
      } else {
        throw error;
      }
    }
  }, []);

  // Contract verification
  const verifyContracts = useCallback(async () => {
    if (!publicClient) return false;
    try {
      const [examCode, certCode] = await Promise.all([
        publicClient.getBytecode({ address: EXAM_MANAGEMENT_ADDRESS as `0x${string}` }),
        publicClient.getBytecode({ address: CERTIFICATES_ADDRESS as `0x${string}` })
      ]);

      if (!examCode || examCode === '0x') {
        throw new Error('عقد إدارة الاختبارات غير موجود | Exam Management contract not found');
      }

      if (!certCode || certCode === '0x') {
        throw new Error('عقد الشهادات غير موجود | Certificates contract not found');
      }

      return true;
    } catch (error) {
      console.error('Contract verification failed:', error);
      return false;
    }
  }, [publicClient]);

  // Contract initialization
  const initializeContracts = useCallback(async () => {
    if (!publicClient || !walletClient || !account) {
      throw new Error('المتطلبات الأساسية غير متوفرة | Core requirements not available');
    }

    // Create contract instances
    const examManagement = getContract({
      address: EXAM_MANAGEMENT_ADDRESS as `0x${string}`,
      abi: ExamManagementABI.abi,
      client: publicClient,
      // walletClient
    });

    const certificates = getContract({
      address: CERTIFICATES_ADDRESS as `0x${string}`,
      abi: CertificatesABI.abi,
      client: publicClient,
      // walletClient
    });

    // Test contract connections
    try {
      await Promise.all([
        examManagement.read.isInstitution([account]),
        certificates.read.getInstitutionCertificates([account])
      ]);
    } catch (error) {
      console.error('Contract test failed:', error);
      throw new Error('فشل في اختبار الاتصال بالعقود | Contract connection test failed');
    }

    return {
      examManagement,
      certificates
    };
  }, [publicClient, walletClient, account]);

  // Main initialization effect
  useEffect(() => {
    let isMounted = true;
    let retryTimeout: NodeJS.Timeout;

    const initialize = async () => {
      if (!isMounted) return;

      try {
        // 1. Check dependencies
        if (!account || !publicClient || !walletClient) {
          setInitState(prev => ({
            ...prev,
            isLoading: false,
            error: 'يرجى توصيل المحفظة أولاً | Please connect wallet first'
          }));
          return;
        }

        // 2. Verify network
        const isCorrectNetwork = await verifyNetwork();
        if (!isCorrectNetwork) {
          if (initState.retryCount >= 3) {
            throw new Error('فشل في تبديل الشبكة | Network switch failed');
          }

          try {
            await switchNetwork();
            setInitState(prev => ({
              ...prev,
              hasAttemptedNetworkSwitch: true,
              retryCount: prev.retryCount + 1
            }));
            
            // Retry after network switch
            retryTimeout = setTimeout(initialize, 1000);
            return;
          } catch (error) {
            throw new Error('فشل في تبديل الشبكة | Network switch failed');
          }
        }

        // 3. Verify contracts
        const contractsVerified = await verifyContracts();
        if (!contractsVerified) {
          throw new Error('فشل في التحقق من العقود | Contract verification failed');
        }

        // 4. Initialize contracts
        const { examManagement, certificates } = await initializeContracts();

        // 5. Update state with initialized contracts
        if (isMounted) {
          setContracts({
            examManagementContract: {
              isInstitution: async (address: string) => {
                const result = await examManagement.read.isInstitution([address]);
                return result === true;
              },
              getInstitution: async (address: string) => {
                return await examManagement.read.getInstitution([address]);
              },
              getInstitutionExams: async (address: string) => {
                return await examManagement.read.getInstitutionExams([address]) ?? [];
              },
              getExamResults: async (examId: string) => {
                return await examManagement.read.getExamResults([examId]) ?? [];
              },
              write: {
                updateInstitutionProfile: async (params: any) => {
                  const hash = await examManagement.write.updateInstitutionProfile(params.args);
                  return { wait: async () => { await publicClient.waitForTransactionReceipt({ hash }); } };
                },
                submitExamResults: async (params: any) => {
                  const hash = await examManagement.write.submitExamResults(params.args);
                  return { wait: async () => { await publicClient.waitForTransactionReceipt({ hash }); } };
                },
                registerStudents: async (params: any) => {
                  const hash = await examManagement.write.registerStudents(params.args);
                  return { wait: async () => { await publicClient.waitForTransactionReceipt({ hash }); } };
                },
                updateExamStatus: async (params: any) => {
                  const hash = await examManagement.write.updateExamStatus(params.args);
                  return { wait: async () => { await publicClient.waitForTransactionReceipt({ hash }); } };
                },
                createExam: async (params: any) => {
                  const hash = await examManagement.write.createExam(params.args);
                  return { wait: async () => { await publicClient.waitForTransactionReceipt({ hash }); } };
                },
                issueCertificate: async (params: any) => {
                  const hash = await examManagement.write.issueCertificate(params.args);
                  return { wait: async () => { await publicClient.waitForTransactionReceipt({ hash }); } };
                }
              }
            } as ExamManagementContract,
            certificatesContract: {
              getInstitutionCertificates: async (address: string) => {
                return await certificates.read.getInstitutionCertificates([address]) ?? [];
              },
              write: {
                issueCertificate: async (params: any) => {
                  const hash = await certificates.write.issueCertificate(params.args);
                  return { wait: async () => { await publicClient.waitForTransactionReceipt({ hash }); } };
                }
              }
            } as CertificatesContract,
            examinationsContract: null,
            identityContract: null,
            securityUtilsContract: null
          });

          setInitState(prev => ({
            ...prev,
            isLoading: false,
            hasVerifiedNetwork: true,
            hasVerifiedContracts: true,
            error: null
          }));
        }
      } catch (error) {
        console.error('Initialization error:', error);
        if (isMounted) {
          setInitState(prev => ({
            ...prev,
            isLoading: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          }));

          setContracts({
            examManagementContract: null,
            certificatesContract: null,
            examinationsContract: null,
            identityContract: null,
            securityUtilsContract: null
          });

          toast({
            title: 'خطأ في التهيئة | Initialization Error',
            description: error instanceof Error 
              ? `${error.message} | يرجى التأكد من اتصال المحفظة والشبكة الصحيحة`
              : 'حدث خطأ غير معروف | An unknown error occurred',
            status: 'error',
            duration: 5000,
            isClosable: true,
          });
        }
      }
    };

    initialize();

    return () => {
      isMounted = false;
      if (retryTimeout) {
        clearTimeout(retryTimeout);
      }
    };
  }, [account, publicClient, walletClient, chainId, verifyNetwork, verifyContracts, initializeContracts, toast, initState.retryCount]);

  // Network change handler
  useEffect(() => {
    if (typeof window !== 'undefined' && window.ethereum?.on) {
      const handleChainChanged = () => {
        console.log('Network changed, resetting state...');
        setInitState(prev => ({
          ...prev,
          isLoading: true,
          hasVerifiedNetwork: false,
          hasVerifiedContracts: false,
          error: null,
          retryCount: 0
        }));

        setContracts({
          examManagementContract: null,
          certificatesContract: null,
          examinationsContract: null,
          identityContract: null,
          securityUtilsContract: null
        });
      };

      window.ethereum.on('chainChanged', handleChainChanged);
      return () => {
        if (window.ethereum?.removeListener) {
          window.ethereum.removeListener('chainChanged', handleChainChanged);
        }
      };
    }
  }, []);

  return {
    ...contracts,
    account,
    isConnected: !!account && initState.hasVerifiedNetwork && initState.hasVerifiedContracts,
    isInitialized: initState.hasVerifiedContracts,
    isLoading: initState.isLoading,
    isCorrectNetwork: chainId === TARGET_CHAIN_ID,
    initializationError: initState.error
  };
};