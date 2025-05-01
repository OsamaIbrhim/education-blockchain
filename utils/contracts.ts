import { ethers } from 'ethers';
import { ExamManagementABI, IdentityABI, CertificatesABI } from '../constants/abis';
import {
  getProvider,
  getSigner,
  EXPECTED_NETWORK,
  validateNetwork,
  formatEther,
  handleContractError,
  getAddress,
  type EthereumProvider
} from './ethersConfig';
import { getConfig } from './config';
import { getIdentityContract } from 'services/admin';
import { getExamManagementContract } from 'services/examManagement';

// Contract addresses from .env
const IDENTITY_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_IDENTITY_CONTRACT_ADDRESS;
const CERTIFICATES_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CERTIFICATES_CONTRACT_ADDRESS;
const EXAM_MANAGEMENT_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_EXAM_MANAGEMENT_CONTRACT_ADDRESS;

// Role mapping with proper types
const USER_ROLES = {
  NONE: 0,
  STUDENT: 1,
  INSTITUTION: 2,
  EMPLOYER: 3
} as const;

type RoleValue = typeof USER_ROLES[keyof typeof USER_ROLES];
type RoleString = 'none' | 'student' | 'institution' | 'employer';

const roleMap: Record<RoleValue, RoleString> = {
  [USER_ROLES.NONE]: 'none',
  [USER_ROLES.STUDENT]: 'student',
  [USER_ROLES.INSTITUTION]: 'institution',
  [USER_ROLES.EMPLOYER]: 'employer'
};

// Validate environment variables
if (!IDENTITY_CONTRACT_ADDRESS) {
  console.error('NEXT_PUBLIC_IDENTITY_CONTRACT_ADDRESS is not set in .env');
}
if (!CERTIFICATES_CONTRACT_ADDRESS) {
  console.error('NEXT_PUBLIC_CERTIFICATES_CONTRACT_ADDRESS is not set in .env');
}

export const getContracts = async () => {
  try {
    const provider = await getProvider();
    const signer = await getSigner();

    const identityContract = new ethers.Contract(
      IDENTITY_CONTRACT_ADDRESS!,
      IdentityABI,
      signer
    );

    const certificatesContract = new ethers.Contract(
      CERTIFICATES_CONTRACT_ADDRESS!,
      CertificatesABI,
      signer
    );

    const examManagementContract = new ethers.Contract(
      EXAM_MANAGEMENT_CONTRACT_ADDRESS!,
      ExamManagementABI,
      signer
    );

    return { identityContract, certificatesContract, examManagementContract, provider, signer };
  } catch (error: any) {
    console.error('Error initializing contracts:', error);
    throw new Error(`Failed to initialize contracts: ${error.message}`);
  }
};

export const registerUser = async (role: string) => {
  if (!role) {
    throw new Error('Role is required');
  }

  try {
    // Error.1 missing revert data  
    // const provider = await getProvider();

    // solve error.1
    if (!window.ethereum) {
      throw new Error('No ethereum provider found');
    }
    const provider = new ethers.BrowserProvider(window.ethereum);

    const signer = await provider.getSigner();
    const identityAddress = getConfig('IDENTITY_CONTRACT_ADDRESS');

    if (!identityAddress) {
      throw new Error('Contract address is not configured');
    }

    const identityContract = new ethers.Contract(identityAddress, IdentityABI, signer);

    // Convert role string to enum value
    const roleMap: { [key: string]: number } = {
      'student': 1,
      'institution': 2,
      'employer': 3
    };

    const roleValue = roleMap[role.toLowerCase()];
    if (roleValue === undefined) {
      throw new Error(`Invalid role: ${role}. Must be one of: student, institution, employer`);
    }

    const tx = await identityContract.registerUser(roleValue, ""/*, overrides*/);
    await tx.wait();

    return { status: 'success' };
  } catch (error: any) {
    console.error('Registration error:', error);
    throw error;
  }
};

export const verifyUser = async (address: string) => {
  if (!address || !getAddress(address)) {
    throw new Error('Invalid address');
  }

  try {
    const { identityContract } = await getContracts();
    return await identityContract.verifyUser(address);
  } catch (error: any) {
    console.error('Error verifying user:', error);
    throw new Error(error.message || 'Failed to verify user');
  }
};

export const getUserRole = async (address: string): Promise<RoleString> => {
  if (!address || !getAddress(address)) {
    throw new Error('Invalid address');
  }

  try {
    const { identityContract } = await getContracts();
    const roleValue = await identityContract.getUserRole(address);
    return roleMap[roleValue as RoleValue] || 'none';
  } catch (error: any) {
    console.error('Error getting user role:', error);
    return 'none';
  }
};

export const issueCertificate = async (studentAddress: string, ipfsHash: string) => {
  if (!studentAddress || !ipfsHash) {
    throw new Error('Student address and IPFS hash are required');
  }

  try {
    const { certificatesContract } = await getContracts();
    const tx = await certificatesContract.issueCertificate(studentAddress, ipfsHash);
    await tx.wait();
    return tx;
  } catch (error: any) {
    console.error('Error issuing certificate:', error);
    throw error;
  }
};

export const verifyCertificate = async (certificateId: string) => {
  if (!certificateId) {
    throw new Error('Certificate ID is required');
  }

  try {
    const { certificatesContract } = await getContracts();
    const isValid = await certificatesContract.verifyCertificate(certificateId);
    return isValid;
  } catch (error: any) {
    console.error('Error verifying certificate:', error);
    throw error;
  }
};

export const getCertificates = async (address: string) => {
  if (!address || !getAddress(address)) {
    throw new Error('Invalid address');
  }

  try {
    console.log('Getting certificates for address:', address);
    const { certificatesContract } = await getContracts();

    // Get certificate IDs first
    console.log('Getting certificate IDs...');
    const certificateIds = await certificatesContract.getStudentCertificates(address);
    console.log('Certificate IDs:', certificateIds);

    if (!certificateIds || certificateIds.length === 0) {
      console.log('No certificates found');
      return [];
    }

    // Get details for each certificate
    console.log('Getting certificate details...');
    const certificates = await Promise.all(
      certificateIds.map(async (id: string) => {
        const cert = await certificatesContract.verifyCertificate(id);
        return {
          id,
          ipfsHash: cert.ipfsHash,
          issuer: cert.institution,
          timestamp: cert.issuedAt.toString(),
          isValid: cert.isValid
        };
      })
    );

    console.log('Certificate details:', certificates);
    return certificates;
  } catch (error: any) {
    console.error('Error in getCertificates:', error);
    if (error.reason) {
      throw new Error(`Contract error: ${error.reason}`);
    }
    throw error;
  }
};

export const isVerifiedUser = async (address: string) => {
  if (!address || !getAddress(address)) {
    throw new Error('Invalid address');
  }

  try {
    const { identityContract } = await getContracts();
    return await identityContract.isVerifiedUser(address);
  } catch (error: any) {
    console.error('Error checking verification status:', error);
    throw error;
  }
};

// Admin functions
export const isOwner = async (address: string) => {
  if (!address || !getAddress(address)) {
    throw new Error('Invalid address');
  }

  try {
    const { identityContract } = await getContracts();
    const owner = await identityContract.owner();

    // Add additional checks
    if (!owner) {
      console.warn('Owner address is null or undefined');
      return false;
    }

    return owner.toLowerCase() === address.toLowerCase();
  } catch (error: any) {
    console.error('Error checking owner status:', error);
    throw error;
  }
};

export const verifyInstitution = async (institutionAddress: string) => {
  if (!institutionAddress || !getAddress(institutionAddress)) {
    throw new Error('Invalid institution address');
  }

  try {
    const identityContract = await getIdentityContract();
    const examManagementContract = await getExamManagementContract();
    // const identityTx = await identityContract.verifyUser(institutionAddress);
    // await identityTx.wait();
    const examManagementTx = await examManagementContract.verifyInstitution(institutionAddress);
    await examManagementTx.wait();
    return {
      // identityHash: identityTx.hash,
      examManagementHash: examManagementTx.hash
    };
  } catch (error: any) {
    console.error('Error verifying institution:', error);
    throw error;
  }
};

export const getOwnerAddress = async () => {
  try {
    const { identityContract } = await getContracts();
    const owner = await identityContract.owner();
    return owner;
  } catch (error: any) {
    console.error('Error getting owner address:', error);
    throw error;
  }
};

// Add exam management contract address and ABI
const EXAM_MANAGEMENT_ADDRESS = process.env.NEXT_PUBLIC_EXAM_MANAGEMENT_ADDRESS || "";
const EXAM_MANAGEMENT_ABI = ExamManagementABI;

// Add exam management functions
export const createExam = async (
  id: string,
  title: string,
  description: string,
  date: number,
  duration: number,
  ipfsHash: string
) => {
  try {
    if (!window.ethereum) {
      throw new Error('No ethereum provider found');
    }
    const provider = new ethers.JsonRpcProvider(EXPECTED_NETWORK.rpcUrl);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(EXAM_MANAGEMENT_ADDRESS, EXAM_MANAGEMENT_ABI, signer);

    const tx = await contract.createExam(id, title, description, date, duration, ipfsHash);
    await tx.wait();
    return true;
  } catch (error) {
    console.error('Error creating exam:', error);
    throw error;
  }
};

export const submitExamResult = async (
  examId: string,
  student: string,
  score: number,
  grade: string,
  ipfsHash: string
) => {
  try {
    if (!window.ethereum) {
      throw new Error('No ethereum provider found');
    }
    const provider = new ethers.JsonRpcProvider(EXPECTED_NETWORK.rpcUrl);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(EXAM_MANAGEMENT_ADDRESS, EXAM_MANAGEMENT_ABI, signer);

    const tx = await contract.submitExamResult(examId, student, score, grade, ipfsHash);
    await tx.wait();
    return true;
  } catch (error) {
    console.error('Error submitting exam result:', error);
    throw error;
  }
};

export const updateExamStatus = async (examId: string, status: string) => {
  try {
    if (!window.ethereum) {
      throw new Error('No ethereum provider found');
    }
    const provider = new ethers.JsonRpcProvider(EXPECTED_NETWORK.rpcUrl);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(EXAM_MANAGEMENT_ADDRESS, EXAM_MANAGEMENT_ABI, signer);

    const tx = await contract.updateExamStatus(examId, status);
    await tx.wait();
    return true;
  } catch (error) {
    console.error('Error updating exam status:', error);
    throw error;
  }
};

export const getExam = async (examId: string) => {
  try {
    if (!window.ethereum) {
      throw new Error('No ethereum provider found');
    }
    const provider = new ethers.JsonRpcProvider(EXPECTED_NETWORK.rpcUrl);
    const contract = new ethers.Contract(EXAM_MANAGEMENT_ADDRESS, EXAM_MANAGEMENT_ABI, provider);

    const exam = await contract.getExam(examId);
    return exam;
  } catch (error) {
    console.error('Error getting exam:', error);
    throw error;
  }
};

export const getExamResult = async (examId: string, student: string) => {
  try {
    if (!window.ethereum) {
      throw new Error('No ethereum provider found');
    }
    const provider = new ethers.JsonRpcProvider(EXPECTED_NETWORK.rpcUrl);
    const contract = new ethers.Contract(EXAM_MANAGEMENT_ADDRESS, EXAM_MANAGEMENT_ABI, provider);

    const result = await contract.getExamResult(examId, student);
    return result;
  } catch (error) {
    console.error('Error getting exam result:', error);
    throw error;
  }
};

export const getInstitutionExams = async (institution: string) => {
  try {
    if (!window.ethereum) {
      throw new Error('No ethereum provider found');
    }
    const provider = new ethers.JsonRpcProvider(EXPECTED_NETWORK.rpcUrl);
    const contract = new ethers.Contract(EXAM_MANAGEMENT_ADDRESS, EXAM_MANAGEMENT_ABI, provider);

    const exams = await contract.getInstitutionExams(institution);
    return exams;
  } catch (error) {
    console.error('Error getting institution exams:', error);
    throw error;
  }
};

export const getStudentExams = async (student: string) => {
  try {
    if (!window.ethereum) {
      throw new Error('No ethereum provider found');
    }
    const provider = new ethers.JsonRpcProvider(EXPECTED_NETWORK.rpcUrl);
    const contract = new ethers.Contract(EXAM_MANAGEMENT_ADDRESS, EXAM_MANAGEMENT_ABI, provider);

    const exams = await contract.getStudentExams(student);
    return exams;
  } catch (error) {
    console.error('Error getting student exams:', error);
    throw error;
  }
};

export const enrollStudent = async (examId: string, studentAddress: string) => {
  try {
    if (!window.ethereum) {
      throw new Error('No ethereum provider found');
    }
    const provider = new ethers.JsonRpcProvider(EXPECTED_NETWORK.rpcUrl);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(EXAM_MANAGEMENT_ADDRESS, EXAM_MANAGEMENT_ABI, signer);

    const tx = await contract.enrollStudent(examId, studentAddress);
    await tx.wait();
    return true;
  } catch (error) {
    console.error('Error enrolling student:', error);
    throw error;
  }
};