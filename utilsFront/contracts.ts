import { 
  Contract,
  formatUnits,
  getAddress
} from 'ethers';
import { ExamManagementABI } from '../constants/abis';
import { 
  getProvider, 
  getSigner, 
  EXPECTED_NETWORK, 
  validateNetwork,
  formatEther,
  handleContractError
} from './ethersConfig';
import type { EthereumProvider } from './ethersConfig';
import { getConfig, validateConfig } from '../utils/config';

// Contract ABIs
const IdentityABI = [
  "function registerUser(uint8 _role, string memory _ipfsHash) external",
  "function verifyUser(address _userAddress) external",
  "function getUserRole(address _userAddress) external view returns (uint8)",
  "function isVerifiedUser(address _userAddress) external view returns (bool)",
  "function updateUserIPFS(string memory _newIpfsHash) external",
  "function owner() external view returns (address)",
  "function isAdmin(address _address) external view returns (bool)",
  "function addAdmin(address _newAdmin) external",
  "function removeAdmin(address _admin) external"
];

const CertificatesABI = [
  "function issueCertificate(address _studentAddress, string memory _ipfsHash) external returns (bytes32)",
  "function getStudentCertificates(address _student) external view returns (bytes32[])",
  "function verifyCertificate(bytes32 _certificateId) external view returns (address student, address institution, string ipfsHash, uint256 issuedAt, bool isValid)"
];

// Contract addresses from config
const IDENTITY_CONTRACT_ADDRESS = getConfig('IDENTITY_CONTRACT_ADDRESS');
const CERTIFICATES_CONTRACT_ADDRESS = getConfig('CERTIFICATES_CONTRACT_ADDRESS');
const ADMIN_ADDRESS = getConfig('ADMIN_ADDRESS');
const EXAM_MANAGEMENT_ADDRESS = getConfig('EXAM_MANAGEMENT_CONTRACT_ADDRESS');

// Validate environment variables
export const validateEnv = () => {
  try {
    // التحقق من صحة التكوين
    validateConfig();

    // التحقق من صحة العناوين
    if (!getAddress(IDENTITY_CONTRACT_ADDRESS)) {
      throw new Error(`Invalid Identity contract address: ${IDENTITY_CONTRACT_ADDRESS}`);
    }

    if (!getAddress(CERTIFICATES_CONTRACT_ADDRESS)) {
      throw new Error(`Invalid Certificates contract address: ${CERTIFICATES_CONTRACT_ADDRESS}`);
    }

    if (!getAddress(ADMIN_ADDRESS)) {
      throw new Error(`Invalid Admin address: ${ADMIN_ADDRESS}`);
    }

    if (!getAddress(EXAM_MANAGEMENT_ADDRESS)) {
      throw new Error(`Invalid Exam Management contract address: ${EXAM_MANAGEMENT_ADDRESS}`);
    }

    console.log('Configuration validated successfully:', {
      IDENTITY_CONTRACT_ADDRESS,
      CERTIFICATES_CONTRACT_ADDRESS,
      ADMIN_ADDRESS,
      EXAM_MANAGEMENT_ADDRESS,
      CHAIN_ID: getConfig('CHAIN_ID'),
      NETWORK_URL: getConfig('NETWORK_URL')
    });

    return true;
  } catch (error) {
    console.error('Configuration validation failed:', error);
    throw error;
  }
};

// Debug environment variables
console.log('Environment variables check:', {
  IDENTITY_CONTRACT_ADDRESS,
  CERTIFICATES_CONTRACT_ADDRESS,
  ADMIN_ADDRESS,
  EXAM_MANAGEMENT_ADDRESS,
  CHAIN_ID: EXPECTED_NETWORK.chainId,
  NETWORK_URL: EXPECTED_NETWORK.rpcUrl
});

// Role mapping with proper types
const USER_ROLES = {
  NONE: 0,
  STUDENT: 1,
  INSTITUTION: 2,
  EMPLOYER: 3,
  ADMIN: 4
} as const;

type RoleValue = typeof USER_ROLES[keyof typeof USER_ROLES];
type RoleString = 'none' | 'student' | 'institution' | 'employer' | 'admin';

const roleMap: Record<RoleValue, RoleString> = {
  [USER_ROLES.NONE]: 'none',
  [USER_ROLES.STUDENT]: 'student',
  [USER_ROLES.INSTITUTION]: 'institution',
  [USER_ROLES.EMPLOYER]: 'employer',
  [USER_ROLES.ADMIN]: 'admin'
};

export const getContracts = async () => {
  try {
    console.log('Contract Addresses:', {
      Identity: IDENTITY_CONTRACT_ADDRESS,
      Certificates: CERTIFICATES_CONTRACT_ADDRESS,
      Admin: ADMIN_ADDRESS
    });

    const provider = await getProvider();
    await validateNetwork(provider);
    console.log('Network validation passed');
    
    const signer = await getSigner();
    const userAddress = await signer.getAddress();
    
    console.log('Connected with address:', userAddress);
    
    const userBalance = await provider.getBalance(userAddress);
    console.log('User balance:', formatUnits(userBalance, 'ether'), 'ETH');
    
    const identityContract = new Contract(
      IDENTITY_CONTRACT_ADDRESS!,
      IdentityABI,
      signer
    );

    console.log('Verifying contract exists at address:', IDENTITY_CONTRACT_ADDRESS);
    const code = await provider.getCode(IDENTITY_CONTRACT_ADDRESS!);
    console.log('Contract code length:', code.length);
    console.log('Contract exists:', code !== '0x');
    
    if (code === '0x') {
      throw new Error(`Identity contract not found at address: ${IDENTITY_CONTRACT_ADDRESS}`);
    }

    const certificatesContract = new Contract(
      CERTIFICATES_CONTRACT_ADDRESS!,
      CertificatesABI,
      signer
    );

    const examManagementContract = new Contract(
      EXAM_MANAGEMENT_ADDRESS!,
      ExamManagementABI,
      signer
    );

    return { identityContract, certificatesContract, examManagementContract, provider, signer };
  } catch (error: any) {
    console.error('Error initializing contracts:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      reason: error.reason
    });
    throw new Error(`Failed to initialize contracts: ${error.message}`);
  }
};

export const registerUser = async (role: string) => {
  if (!role) {
    throw new Error('Role is required');
  }

  try {
    const { identityContract, signer } = await getContracts();
    
    // Get network details and user address
    const userAddress = await signer.getAddress();
    console.log('Registering address:', userAddress);
    console.log('With role:', role);
    
    // Special handling for admin address
    if (ADMIN_ADDRESS && userAddress.toLowerCase() === ADMIN_ADDRESS.toLowerCase()) {
      console.log('This is the admin address, setting admin role...');
      return await setAdminRole();
    }
    
    // Convert role string to enum value
    const roleMap: { [key: string]: number } = {
      'student': USER_ROLES.STUDENT,
      'institution': USER_ROLES.INSTITUTION,
      'employer': USER_ROLES.EMPLOYER,
      'admin': USER_ROLES.ADMIN
    };
    
    const roleValue = roleMap[role.toLowerCase()];
    if (roleValue === undefined) {
      throw new Error(`Invalid role: ${role}. Must be one of: student, institution, employer, admin`);
    }

    console.log('Role value from mapping:', roleValue);
    
    // Check if user is already registered
    try {
      console.log('Checking if user already exists...');
      const existingRole = await identityContract.getUserRole(userAddress);
      console.log('Existing role:', existingRole);
      
      if (existingRole > 0) {
        console.log('User already registered with role:', existingRole);
        
        // If user exists but needs verification
        const isVerified = await identityContract.isVerified(userAddress);
        if (!isVerified) {
          console.log('User exists but not verified, attempting verification...');
          const verifyTx = await identityContract.verifyUser(userAddress);
          await verifyTx.wait();
          console.log('User verified successfully');
        }
        
        return { status: 'existing', role: existingRole };
      }
    } catch (error: any) {
      if (!error.message.includes('User does not exist')) {
        throw error;
      }
      console.log('User does not exist, proceeding with registration');
    }
    
    // Register user
    console.log('Registering new user with role:', roleValue);
    const tx = await identityContract.registerUser(roleValue, "");
    console.log('Registration transaction sent:', tx.hash);
    
    const receipt = await tx.wait();
    console.log('Registration successful:', receipt.hash);
    
    // Verify the user automatically
    try {
      console.log('Attempting automatic verification...');
      const verifyTx = await identityContract.verifyUser(userAddress);
      await verifyTx.wait();
      console.log('User verified successfully');
    } catch (verifyError) {
      console.warn('Automatic verification failed:', verifyError);
      // Continue even if verification fails
    }
    
    // If registering as admin, set admin role
    if (role.toLowerCase() === 'admin') {
      console.log('Setting admin privileges...');
      await setAdminRole();
    }
    
    return { status: 'success', role: roleValue, transaction: tx };
  } catch (error: any) {
    return handleContractError(error);
  }
};

export const verifyUser = async (address: string) => {
  try {
    getAddress(address); // Using getAddress instead of isAddress
  } catch (error) {
    throw new Error('Invalid address');
  }

  try {
    console.log('Verifying user:', address);
    const { identityContract } = await getContracts();
    const isVerified = await identityContract.isVerified(address);
    console.log('User verification status:', isVerified);
    return isVerified;
  } catch (error: any) {
    console.error('Error in verifyUser:', error);
    return handleContractError(error);
  }
};

export const getUserRole = async (address: string): Promise<RoleString> => {
  try {
    getAddress(address);
  } catch (error) {
    throw new Error('Invalid address');
  }

  try {
    console.log('Getting user role for:', address);
    const { identityContract } = await getContracts();
    const role = await identityContract.getUserRole(address);
    console.log('User role:', role);
    return role;
  } catch (error: any) {
    console.error('Error in getUserRole:', error);
    return handleContractError(error);
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
    return handleContractError(error);
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
    return handleContractError(error);
  }
};

export const getCertificates = async (address: string) => {
  try {
    getAddress(address);
  } catch (error) {
    throw new Error('Invalid address');
  }

  try {
    console.log('Getting certificates for:', address);
    const { certificatesContract } = await getContracts();
    const certificates = await certificatesContract.getCertificates(address);
    console.log('Certificates:', certificates);
    return certificates;
  } catch (error: any) {
    console.error('Error in getCertificates:', error);
    return handleContractError(error);
  }
};

export const isVerifiedUser = async (address: string) => {
  try {
    getAddress(address);
  } catch (error) {
    throw new Error('Invalid address');
  }

  try {
    console.log('Checking if user is verified:', address);
    const { identityContract } = await getContracts();
    const isVerified = await identityContract.isVerified(address);
    console.log('User verification status:', isVerified);
    return isVerified;
  } catch (error: any) {
    console.error('Error in isVerifiedUser:', error);
    return handleContractError(error);
  }
};

export const isOwner = async (address: string) => {
  try {
    getAddress(address);
  } catch (error) {
    throw new Error('Invalid address');
  }

  try {
    console.log('Checking if user is owner:', address);
    const { identityContract } = await getContracts();
    const ownerAddress = await identityContract.owner();
    const isOwnerRole = address.toLowerCase() === ownerAddress.toLowerCase();
    console.log('User owner status:', isOwnerRole);
    return isOwnerRole;
  } catch (error: any) {
    console.error('Error in isOwner:', error);
    return handleContractError(error);
  }
};

export const verifyInstitution = async (institutionAddress: string) => {
  try {
    getAddress(institutionAddress);
  } catch (error) {
    throw new Error('Invalid institution address');
  }

  try {
    console.log('Verifying institution:', institutionAddress);
    const { identityContract } = await getContracts();
    const tx = await identityContract.verifyUser(institutionAddress);
    await tx.wait();
    console.log('Institution verified successfully');
    return true;
  } catch (error: any) {
    console.error('Error in verifyInstitution:', error);
    return handleContractError(error);
  }
};

export const getOwnerAddress = async () => {
  try {
    const { identityContract } = await getContracts();
    const owner = await identityContract.owner();
    return owner;
  } catch (error: any) {
    console.error('Error getting owner address:', error);
    return handleContractError(error);
  }
};

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
    const { examManagementContract } = await getContracts();
    const tx = await examManagementContract.createExam(id, title, description, date, duration, ipfsHash);
    await tx.wait();
    return true;
  } catch (error: any) {
    console.error('Error creating exam:', error);
    return handleContractError(error);
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
    const { examManagementContract } = await getContracts();
    const tx = await examManagementContract.submitExamResult(examId, student, score, grade, ipfsHash);
    await tx.wait();
    return true;
  } catch (error: any) {
    console.error('Error submitting exam result:', error);
    return handleContractError(error);
  }
};

export const updateExamStatus = async (examId: string, status: string) => {
  try {
    const { examManagementContract } = await getContracts();
    const tx = await examManagementContract.updateExamStatus(examId, status);
    await tx.wait();
    return true;
  } catch (error: any) {
    console.error('Error updating exam status:', error);
    return handleContractError(error);
  }
};

export const getExam = async (examId: string) => {
  try {
    const { examManagementContract } = await getContracts();
    const exam = await examManagementContract.getExam(examId);
    return exam;
  } catch (error: any) {
    console.error('Error getting exam:', error);
    return handleContractError(error);
  }
};

export const getExamResult = async (examId: string, student: string) => {
  try {
    const { examManagementContract } = await getContracts();
    const result = await examManagementContract.getExamResult(examId, student);
    return result;
  } catch (error: any) {
    console.error('Error getting exam result:', error);
    return handleContractError(error);
  }
};

export const getInstitutionExams = async (institution: string) => {
  try {
    const { examManagementContract } = await getContracts();
    const exams = await examManagementContract.getInstitutionExams(institution);
    return exams;
  } catch (error: any) {
    console.error('Error getting institution exams:', error);
    return handleContractError(error);
  }
};

export const getStudentExams = async (student: string) => {
  try {
    const { examManagementContract } = await getContracts();
    const exams = await examManagementContract.getStudentExams(student);
    return exams;
  } catch (error: any) {
    console.error('Error getting student exams:', error);
    return handleContractError(error);
  }
};

export const enrollStudent = async (examId: string, studentAddress: string) => {
  try {
    const { examManagementContract } = await getContracts();
    const tx = await examManagementContract.enrollStudent(examId, studentAddress);
    await tx.wait();
    return true;
  } catch (error: any) {
    console.error('Error enrolling student:', error);
    return handleContractError(error);
  }
};

export const getContract = async () => {
  const { examManagementContract } = await getContracts();
  return examManagementContract;
};

export const setAdminRole = async () => {
  try {
    const { identityContract, signer } = await getContracts();
    const userAddress = await signer.getAddress();
    
    console.log('Setting admin role for address:', userAddress);
    console.log('Expected admin address:', ADMIN_ADDRESS);
    
    // First check if the address is already an admin
    const isAdmin = await identityContract.isAdmin(userAddress);
    console.log('Is already admin?', isAdmin);
    
    if (isAdmin) {
      console.log('User is already an admin');
      return { status: 'existing', isAdmin: true };
    }
    
    // Check if this is the configured admin address
    if (ADMIN_ADDRESS && userAddress.toLowerCase() === ADMIN_ADDRESS.toLowerCase()) {
      console.log('Address matches configured admin, adding as admin...');
      
      // First try to register as admin if not already registered
      try {
        const role = await identityContract.getUserRole(userAddress);
        if (role === 0) {
          console.log('Registering admin user first...');
          const regTx = await identityContract.registerUser(USER_ROLES.ADMIN, "");
          await regTx.wait();
        }
      } catch (error: any) {
        if (!error.message.includes('User does not exist')) {
          throw error;
        }
        // If user doesn't exist, register them as admin
        console.log('Registering new admin user...');
        const regTx = await identityContract.registerUser(USER_ROLES.ADMIN, "");
        await regTx.wait();
      }
      
      // Verify the user
      console.log('Verifying admin user...');
      const verifyTx = await identityContract.verifyUser(userAddress);
      await verifyTx.wait();
      
      // Add admin role
      console.log('Adding admin role...');
      const tx = await identityContract.addAdmin(userAddress);
      await tx.wait();
      console.log('Successfully added as admin');
      
      return { status: 'success', isAdmin: true };
    }
    
    throw new Error('Only configured admin addresses can be set as admin');
  } catch (error: any) {
    console.error('Error setting admin role:', error);
    return handleContractError(error);
  }
}; 