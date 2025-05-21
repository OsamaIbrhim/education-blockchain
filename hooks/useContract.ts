import { useEffect, useState } from 'react';
import { useToast } from '@chakra-ui/react';
import { usePublicClient, useAccount, useWalletClient } from 'wagmi';
import { getContract, type PublicClient, type GetContractReturnType, type WalletClient } from 'viem';
import { ExamManagementABI, IdentityABI, CertificatesABI } from '../constants/abis';

// Get contract addresses from environment variables
const IDENTITY_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_IDENTITY_CONTRACT_ADDRESS;
const CERTIFICATES_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CERTIFICATES_CONTRACT_ADDRESS;
const EXAM_MANAGEMENT_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_EXAM_MANAGEMENT_CONTRACT_ADDRESS;

// Use a simplified type definition to avoid complex type errors
type ContractType = any;

export function useContract() {
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const { address: account } = useAccount();
  const toast = useToast();
  const [isInitialized, setIsInitialized] = useState(false);
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(false);
  const [isLoadingContract, setIsLoadingContract] = useState(true);
  const [examManagementContract, setExamManagementContract] = useState<ContractType | null>(null);
  const [identityContract, setIdentityContract] = useState<ContractType | null>(null);
  const [certificateContract, setCertificateContract] = useState<ContractType | null>(null);

  useEffect(() => {
    const initializeContracts = async () => {
      try {
        setIsLoadingContract(true);

        if (!publicClient) {
          console.log('Waiting for public client...');
          return;
        }

        if (!account) {
          console.log('Waiting for account...');
          return;
        }

        const chainId = await publicClient.getChainId();
        console.log('Current chain ID:', chainId);
        
        // Accept either Ganache (1337) or Ethereum Mainnet (1)
        if (chainId !== 1337 && chainId !== 1) {
          console.log('Wrong network - expected Ganache (1337) or Ethereum Mainnet (1), got:', chainId);
          setIsCorrectNetwork(false);
          return;
        }

        setIsCorrectNetwork(true);

        // Verify contract addresses are set
        if (!IDENTITY_CONTRACT_ADDRESS || !CERTIFICATES_CONTRACT_ADDRESS || !EXAM_MANAGEMENT_CONTRACT_ADDRESS) {
          console.error('Missing contract addresses:', {
            identity: IDENTITY_CONTRACT_ADDRESS,
            certificates: CERTIFICATES_CONTRACT_ADDRESS,
            examManagement: EXAM_MANAGEMENT_CONTRACT_ADDRESS
          });
          
          throw new Error('Contract addresses are not configured. Please check your environment variables.');
        }

        try {
          const examManagementContract = getContract({
            address: EXAM_MANAGEMENT_CONTRACT_ADDRESS as `0x${string}`,
            abi: ExamManagementABI,
            client: publicClient,
          });
          
          // Initialize state first with basic contract data
          setExamManagementContract(examManagementContract);
          
          const identityContract = getContract({
            address: IDENTITY_CONTRACT_ADDRESS as `0x${string}`,
            abi: IdentityABI,
            client: publicClient,
          });
          
          setIdentityContract(identityContract);
  
          const certificatesContract = getContract({
            address: CERTIFICATES_CONTRACT_ADDRESS as `0x${string}`,
            abi: CertificatesABI,
            client: publicClient,
          });
          
          setCertificateContract(certificatesContract);
          setIsInitialized(true);
        } catch (contractError: any) {
          console.error('Error creating contract instances:', contractError);
          throw new Error(`Failed to create contract instances: ${contractError.message}`);
        }
      } catch (error: any) {
        console.error('Contract initialization error:', error);
        toast({
          title: 'Error',
          description: `Contract initialization failed: ${error?.message || 'Unknown error'}`,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setIsLoadingContract(false);
      }
    };

    initializeContracts();
  }, [publicClient, walletClient, account, toast]);

  return {
    examManagementContract,
    identityContract,
    certificateContract,
    isInitialized,
    isCorrectNetwork,
    isLoadingContract
  };
}