import { useEffect, useState } from 'react';
import { useToast } from '@chakra-ui/react';
import { usePublicClient, useAccount } from 'wagmi';
import { getContract, type PublicClient, type GetContractReturnType } from 'viem';
import { ExamManagementABI } from '../constants/abis';
import { getContracts } from '../utils/contracts';

interface ContractAddresses {
  examManagementContract: { address: string };
  identityContract: { address: string };
  certificatesContract: { address: string };
}

type ContractType = GetContractReturnType<typeof ExamManagementABI, PublicClient>;

export function useContract() {
  const publicClient = usePublicClient();
  const { address: account } = useAccount();
  const toast = useToast();
  const [isInitialized, setIsInitialized] = useState(false);
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [examManagement, setExamManagement] = useState<ContractType | null>(null);
  const [identity, setIdentity] = useState<ContractType | null>(null);
  const [certificates, setCertificates] = useState<ContractType | null>(null);

  useEffect(() => {
    const initializeContracts = async () => {
      try {
        setIsLoading(true);

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
        
        if (chainId !== 1337) {
          console.log('Wrong network - expected Ganache (1337), got:', chainId);
          setIsCorrectNetwork(false);
          return;
        }

        setIsCorrectNetwork(true);

        const contracts = (await getContracts()) as unknown as ContractAddresses;
        
        if (!contracts.examManagementContract?.address || !contracts.identityContract?.address || !contracts.certificatesContract?.address) {
          throw new Error('Contract addresses not found');
        }

        const examManagementContract = getContract({
          address: contracts.examManagementContract.address as `0x${string}`,
          abi: ExamManagementABI,
          client: publicClient
        });

        const identityContract = getContract({
          address: contracts.identityContract.address as `0x${string}`,
          abi: ExamManagementABI, // Using same ABI temporarily
          client: publicClient
        });

        const certificatesContract = getContract({
          address: contracts.certificatesContract.address as `0x${string}`,
          abi: ExamManagementABI, // Using same ABI temporarily
          client: publicClient
        });

        setExamManagement(examManagementContract as ContractType);
        setIdentity(identityContract as ContractType);
        setCertificates(certificatesContract as ContractType);
        setIsInitialized(true);

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
        setIsLoading(false);
      }
    };

    initializeContracts();
  }, [publicClient, account, toast]);

  return {
    examManagement,
    identity,
    certificates,
    isInitialized,
    isCorrectNetwork,
    isLoading
  };
}