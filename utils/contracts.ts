import { ethers } from 'ethers';
import { ExamManagementABI, IdentityABI, CertificatesABI } from '../constants/abis';
import {
  getProvider,
  getSigner,
  EXPECTED_NETWORK,
  validateNetwork,
  formatEther,
  getAddress,
  type EthereumProvider
} from './ethersConfig';
import { handleContractError } from '../Error/helper';

// Addresses from environment variables
const ADMIN_ADDRESS = process.env.NEXT_PUBLIC_ADMIN_ADDRESS;
const IDENTITY_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_IDENTITY_CONTRACT_ADDRESS;
const CERTIFICATES_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CERTIFICATES_CONTRACT_ADDRESS;
const EXAM_MANAGEMENT_ADDRESS = process.env.NEXT_PUBLIC_EXAM_MANAGEMENT_ADDRESS;

// Contract addresses from config
// const IDENTITY_CONTRACT_ADDRESS = getConfig('IDENTITY_CONTRACT_ADDRESS');
// const CERTIFICATES_CONTRACT_ADDRESS = getConfig('CERTIFICATES_CONTRACT_ADDRESS');
// const ADMIN_ADDRESS = getConfig('ADMIN_ADDRESS');
// const EXAM_MANAGEMENT_ADDRESS = getConfig('EXAM_MANAGEMENT_CONTRACT_ADDRESS');

// Validate environment variables
// export const validateEnv = () => {
//   try {
//     validateConfig();
//     if (!getAddress(IDENTITY_CONTRACT_ADDRESS)) {
//       throw new Error(`Invalid Identity contract address: ${IDENTITY_CONTRACT_ADDRESS}`);
//     }
//     if (!getAddress(CERTIFICATES_CONTRACT_ADDRESS)) {
//       throw new Error(`Invalid Certificates contract address: ${CERTIFICATES_CONTRACT_ADDRESS}`);
//     }
//     if (!getAddress(ADMIN_ADDRESS)) {
//       throw new Error(`Invalid Admin address: ${ADMIN_ADDRESS}`);
//     }
//     if (!getAddress(EXAM_MANAGEMENT_ADDRESS)) {
//       throw new Error(`Invalid Exam Management contract address: ${EXAM_MANAGEMENT_ADDRESS}`);
//     }
//     return true;
//   } catch (error) {
//     throw error;
//   }
// };

// Role mapping with proper types
type RoleString = 'none' | 'student' | 'institution' | 'employer' | 'admin';
const USER_ROLES = {
  NONE: 0,
  STUDENT: 1,
  INSTITUTION: 2,
  EMPLOYER: 3,
  ADMIN: 4
} as const;
const roleMap: { [key: string]: number } = {
  'student': USER_ROLES.STUDENT,
  'institution': USER_ROLES.INSTITUTION,
  'employer': USER_ROLES.EMPLOYER,
  'admin': USER_ROLES.ADMIN
};

// type RoleValue = typeof USER_ROLES[keyof typeof USER_ROLES];
// const roleMap: Record<RoleValue, RoleString> = {
//   [USER_ROLES.NONE]: 'none',
//   [USER_ROLES.STUDENT]: 'student',
//   [USER_ROLES.INSTITUTION]: 'institution',
//   [USER_ROLES.EMPLOYER]: 'employer',
//   [USER_ROLES.ADMIN]: 'admin'
// };

// check if address is valid
export const validateAddress = (address: string | undefined | null): string => {
  if (!address) {
    throw new Error('Address is required');
  }
  try {
    getAddress(address);
    return address;
  } catch (error) {
    return handleContractError('validateAddress', error);
  }
}

export const getContract = async () => {
  try {
    const provider = await getProvider();
    await validateNetwork(provider);
    const signer = await getSigner();
    const userAddress = await signer.getAddress();
    const userBalance = await provider.getBalance(userAddress);

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
      EXAM_MANAGEMENT_ADDRESS!,
      ExamManagementABI,
      signer
    );

    const code = await provider.getCode(IDENTITY_CONTRACT_ADDRESS!);
    if (code === '0x') {
      throw new Error(`Identity contract not found at address: ${IDENTITY_CONTRACT_ADDRESS}`);
    }
    return { identityContract, certificatesContract, examManagementContract, provider, signer };
  } catch (error: any) {
    // console.error('Error initializing contracts:', error);
    // console.error('Error details:', {
    //   message: error.message,
    //   code: error.code,
    //   reason: error.reason
    // });
    return handleContractError('getContract', error);
  }
};

// Register
export const registerUser = async (role: string) => {
  // Validate role
  if (!role) {
    throw new Error('Role is required');
  } else if (role.toLowerCase() === 'admin') {
    await setAdminRole();
  }

  try {
    const { identityContract, signer } = await getContract();
    const userAddress = await signer.getAddress();
    if (ADMIN_ADDRESS && userAddress.toLowerCase() === ADMIN_ADDRESS.toLowerCase()) {
      return await setAdminRole();
    }

    // Check if role is valid
    const roleValue = roleMap[role.toLowerCase()];
    if (roleValue === undefined) {
      throw new Error(`Invalid role: ${role}. Must be one of: student, institution, employer, admin`);
    }

    // Check if user already exists
    try {
      const existingRole = await identityContract.getUserRole(userAddress);
      if (existingRole > 0) {
        const isVerified = await identityContract.isVerified(userAddress);
        if (!isVerified) {
          const verifyTx = await identityContract.verifyUser(userAddress);
          await verifyTx.wait();
        }
        return { status: 'existing', role: existingRole };
      }
    } catch (error: any) {
      if (!error.message.includes('User does not exist')) {
        throw error;
      }
    }

    // Register user
    const tx = await identityContract.registerUser(roleValue, "");
    await tx.wait();

    // Verify user
    try {
      const verifyTx = await identityContract.verifyUser(userAddress);
      await verifyTx.wait();
    } catch { }

    return { status: 'success', role: roleValue, transaction: tx };
  } catch (error: any) {
    return handleContractError('registerUser', error);
  }
};

// Verify
export const verifyUser = async (address: string) => {
  // Validate address
  validateAddress(address);

  try {
    const { identityContract } = await getContract();
    const isVerified = await identityContract.isVerified(address);
    return isVerified;
  } catch (error: any) {
    return handleContractError('verifyUser', error);
  }
};

export const getUserRole = async (address: string): Promise<RoleString> => {
  // Validate address
  validateAddress(address);

  try {
    const { identityContract } = await getContract();
    const role = await identityContract.getUserRole(address);
    return role;
  } catch (error: any) {
    return handleContractError('getUserRole', error);
  }
};

export const issueCertificate = async (studentAddress: string, ipfsHash: string) => {
  if (!studentAddress || !ipfsHash) {
    throw new Error('Student address and IPFS hash are required');
  }
  try {
    const { certificatesContract } = await getContract();
    const tx = await certificatesContract.issueCertificate(studentAddress, ipfsHash);
    await tx.wait();
    return tx;
  } catch (error: any) {
    return handleContractError('issueCertificate', error);
  }
};

export const verifyCertificate = async (certificateId: string) => {
  if (!certificateId) {
    throw new Error('Certificate ID is required');
  }
  try {
    const { certificatesContract } = await getContract();
    const isValid = await certificatesContract.verifyCertificate(certificateId);
    return isValid;
  } catch (error: any) {
    return handleContractError('verifyCertificate',error);
  }
};

export const getCertificates = async (address: string) => {
  // Validate address
  validateAddress(address);

  try {
    const { certificatesContract } = await getContract();
    const certificates = await certificatesContract.getCertificates(address);
    return certificates;
  } catch (error: any) {
    return handleContractError('getCertificates', error);
  }
};

// Admin functions
export const isOwner = async (address: string) => {
  // Validate address
  validateAddress(address);

  try {
    const { identityContract } = await getContract();
    const ownerAddress = await identityContract.owner();
    return address.toLowerCase() === ownerAddress.toLowerCase();
  } catch (error: any) {
    return handleContractError('isOwner', error);
  }
};

export const verifyInstitution = async (institutionAddress: string) => {
  // Validate address
  validateAddress(institutionAddress);

  try {
    const { identityContract } = await getContract();
    const tx = await identityContract.verifyUser(institutionAddress);
    await tx.wait();
    return true;
  } catch (error: any) {
    return handleContractError('verifyInstitution', error);
  }
};

export const getOwnerAddress = async () => {
  try {
    const { identityContract } = await getContract();
    const owner = await identityContract.owner();
    return owner;
  } catch (error: any) {
    return handleContractError('getOwnerAddress', error);
  }
};

// Exam management functions
export const createExam = async (
  id: string,
  title: string,
  description: string,
  date: number,
  duration: number,
  ipfsHash: string
) => {
  try {
    const { examManagementContract } = await getContract();
    const tx = await examManagementContract.createExam(id, title, description, date, duration, ipfsHash);
    await tx.wait();
    return true;
  } catch (error: any) {
    return handleContractError('createExam', error);
  }
};

export const getExam = async (examId: string) => {
  try {
    const { examManagementContract } = await getContract();
    const exam = await examManagementContract.getExam(examId);
    return exam;
  } catch (error: any) {
    return handleContractError('getExam', error);
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
    const { examManagementContract } = await getContract();
    const tx = await examManagementContract.submitExamResult(examId, student, score, grade, ipfsHash);
    await tx.wait();
    return true;
  } catch (error: any) {
    return handleContractError('submitExamResult', error);
  }
};

export const updateExamStatus = async (examId: string, status: string) => {
  try {
    const { examManagementContract } = await getContract();
    const tx = await examManagementContract.updateExamStatus(examId, status);
    await tx.wait();
    return true;
  } catch (error: any) {
    return handleContractError('updateExamStatus', error);
  }
};

export const getExamResult = async (examId: string, student: string) => {
  try {
    const { examManagementContract } = await getContract();
    const result = await examManagementContract.getExamResult(examId, student);
    return result;
  } catch (error: any) {
    return handleContractError('getExamResult', error);
  }
};

export const getInstitutionExams = async (institution: string) => {
  try {
    const { examManagementContract } = await getContract();
    const exams = await examManagementContract.getInstitutionExams(institution);
    return exams;
  } catch (error: any) {
    return handleContractError('getInstitutionExams', error);
  }
};

export const getStudentExams = async (student: string) => {
  try {
    const { examManagementContract } = await getContract();
    const exams = await examManagementContract.getStudentExams(student);
    return exams;
  } catch (error: any) {
    return handleContractError('getStudentExams', error);
  }
};

export const enrollStudent = async (examId: string, studentAddress: string) => {
  try {
    const { examManagementContract } = await getContract();
    const tx = await examManagementContract.enrollStudent(examId, studentAddress);
    await tx.wait();
    return true;
  } catch (error: any) {
    return handleContractError('enrollStudent', error);
  }
};

export const setAdminRole = async () => {
  try {
    const { identityContract, signer } = await getContract();
    const userAddress = await signer.getAddress();

    // Check if user is already an admin
    const isAdmin = await identityContract.isAdmin(userAddress);
    if (isAdmin) {
      return { status: 'existing', isAdmin: true };
    }

    if (ADMIN_ADDRESS && userAddress.toLowerCase() === ADMIN_ADDRESS.toLowerCase()) {
      try {
        const role = await identityContract.getUserRole(userAddress);
        if (role === 0) {
          const regTx = await identityContract.registerUser(USER_ROLES.ADMIN, "");
          await regTx.wait();
        }
      } catch (error: any) {
        if (!error.message.includes('User does not exist')) {
          throw error;
        }
        const regTx = await identityContract.registerUser(USER_ROLES.ADMIN, "");
        await regTx.wait();
      }
      const verifyTx = await identityContract.verifyUser(userAddress);
      await verifyTx.wait();
      const tx = await identityContract.addAdmin(userAddress);
      await tx.wait();
      return { status: 'success', isAdmin: true };
    }
    throw new Error('Only configured admin addresses can be set as admin');
  } catch (error: any) {
    return handleContractError('setAdminRole', error);
  }
};