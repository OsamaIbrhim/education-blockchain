import { ethers } from 'ethers';
import { IdentityABI } from '../constants/abis';
import { getSigner } from '../utils/web3Provider';
import { getAddress } from 'ethers';
import { getConfig } from '../utils/config';
import { Toast } from '@chakra-ui/react';

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

interface BaseUser {
  userAddress: string;
  role: number;
  isVerified: boolean;
}

interface StudentData {
  userAddress: string;
  nationalId: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  institutionAddress: string;
  enrolledCourses: string[];
  status: number;
  isVerified: boolean;
}

interface InstitutionData {
  userAddress: string;
  name: string;
  location: string;
  phoneNumber: string;
  email: string;
  website: string;
  status: number;
  isVerified: boolean;
}

interface EmployerData {
  userAddress: string;
  companyName: string;
  location: string;
  phoneNumber: string;
  email: string;
  website: string;
  isVerified: boolean;
}

interface AdminData {
  userAddress: string;
  email: string;
  isActive: boolean;
  addedAt: number;
}

interface Institution {
  address: string;
  name: string;
  phoneNumber: string;
  email: string;
  website: string;
  isVerified: boolean;
}

interface RegistrationData {
  role: string;
  name: string;
  location?: string;
  phoneNumber: string;
  email: string;
  nationalId?: string;
  website?: string;
  companyName?: string;
  institutionAddress?: string;
}

type IdentityContractType = ethers.Contract & {
  users(address: string): Promise<[string, number, boolean]>;

  getUserRole(address: string): Promise<number>;
  getStudentData(address: string): Promise<StudentData>;
  getInstitutionData(address: string): Promise<InstitutionData>;
  getEmployerData(address: string): Promise<EmployerData>;
  getAdminData(address: string): Promise<AdminData>;
  getInstitutionStudents(): Promise<StudentData[]>;
  getAllAdmins(): Promise<AdminData[]>;
  getAllInstitutions(): Promise<InstitutionData[]>;
  getAllEmployers(): Promise<EmployerData[]>;
  getInstitutionStudentsByAdmin(address: string): Promise<StudentData[]>;
};

/**
 * @param signer 
 * @returns 
*/
export const getIdentityContract = async (signer?: ethers.Signer) => {
  const contractSigner = signer || await getSigner();
  const contractAddress = process.env.NEXT_PUBLIC_IDENTITY_CONTRACT_ADDRESS?.toString() || getConfig('IDENTITY_CONTRACT_ADDRESS');
  if (!contractAddress) {
    throw new Error('Contract address not found');
  }
  return new ethers.Contract(contractAddress, IdentityABI, contractSigner) as IdentityContractType;
};

/**
 * For all roles to register a user
 * @param role
 * @returns status
 */
export const registerUser = async (data: RegistrationData) => {
  try {
    const contract = await getIdentityContract();
    let tx;

    switch (data.role) {
      case 'student': {
        const [firstName, lastName] = data.name.split(' ');
        tx = await contract.registerStudent(
          data.institutionAddress || '0x0000000000000000000000000000000000000000',
          data.nationalId || '',
          firstName || data.name,
          lastName || '',
          data.phoneNumber,
          data.email
        );
        break;
      }
      case 'institution': {
        tx = await contract.registerInstitution(
          data.name,
          data.location || '',
          data.phoneNumber,
          data.email,
          data.website || ''
        );
        break;
      }
      case 'employer': {
        tx = await contract.registerEmployer(
          data.companyName || data.name,
          data.location || '',
          data.phoneNumber,
          data.email,
          data.website || ''
        );
        break;
      }
      default:
        throw new Error('Invalid role');
    }

    await tx.wait();
    return { status: 'success' };

  } catch (error: any) {
    console.error('Registration error:', error);
    throw new Error(error.message || 'Registration failed');
  }
};

/**
 * Admin function to verify a user (institution)
 * @param userAddress
 * @returns status
 */
export const verifyUser = async (useraddress: string) => {
  if (!useraddress || !getAddress(useraddress)) {
    throw new Error('Invalid address');
  }

  try {
    const contract = await getIdentityContract();
    const tx = await contract.verifyUser(useraddress);
    await tx.wait();

    return { status: 'success' };
  } catch (error: any) {
    console.error('Error verifying user:', error);
    throw error;
  }
};

/**
 * All roles can check if a user is verified
 * @param userAddress
 * @returns Boolean
 */
export const isVerifiedUser = async (address: string) => {
  if (!address || !getAddress(address)) {
    throw new Error('Invalid address');
  }

  try {
    const contract = await getIdentityContract();
    return await contract.isVerifiedUser(address);
  } catch (error: any) {
    console.error('Error checking verification status:', error);
    throw error;
  }
};

/**
 * Check if the user is the owner of the identity contract
 * @param userAddress
 * @returns Boolean and owner address if true
 */
export const isOwner = async (address: string) => {
  if (!address || !getAddress(address)) {
    throw new Error('Invalid address');
  }

  try {
    const contract = await getIdentityContract();
    const owner = await contract.owner();
    return { 
      status: owner.toLowerCase() === address.toLowerCase(),
      owner
    };
  } catch (error: any) {
    console.error('Error checking owner status:', error);
    throw error;
  }
};

/**
 * Instiution function
 * Check if a student is enrolled in an institution
 * @param _institution
 * @param _student
 * @returns Boolean
 */
export const isStudentEnrolled = async (_institution: string, _student: string) => {
  if (!_institution || !_student) {
    throw new Error('Invalid address');
  }

  try {
    const contract = await getIdentityContract();
    return await contract.isStudentEnrolled(_institution, _student);
  } catch (error: any) {
    console.error('Error checking enrollment status:', error);
    throw error;
  }
};

/**
 * Add students to the institution (only for verified institutions)
 * @param usersAddresses
 * @returns Boolean
 */
export const addStudents = async (studentAddresses: string[]) => {
  if (!studentAddresses || studentAddresses.length === 0) {
    throw new Error('No student addresses provided');
  }
  try {
    const contract = await getIdentityContract();
    const tx = await contract.addStudents(studentAddresses);
    await tx.wait();
    return { status: 'success' };
  } catch (error: any) {
    console.error('Error adding students:', error);
    throw error;
  }
};

/**
 * Get detailed student data for a specific address
 * @param studentAddress The address of the student
 * @returns StudentData object
 */
export const getStudentData = async (studentAddress: string): Promise<StudentData> => {
  if (!studentAddress || !getAddress(studentAddress)) {
    throw new Error('Invalid address');
  }

  try {
    const contract = await getIdentityContract();
    return await contract.getStudentData(studentAddress);
  } catch (error: any) {
    console.error('Error getting student data:', error);
    throw error;
  }
};

/**
 * For institution users only: Get all students registered in the institution
 * This function retrieves all students data associated with the calling institution.
 * Must be called by a verified institution address.
 * 
 * @returns Promise<StudentData[]> Array of student data objects
 * @throws Error if caller is not a verified institution or if there's a contract error
 */
export const getInstitutionStudents = async (): Promise<StudentData[]> => {
  try {
    const contract = await getIdentityContract();
    const students = await contract.getInstitutionStudents();
    
    return students.map(student => ({
      userAddress: student.userAddress,
      nationalId: student.nationalId,
      firstName: student.firstName,
      lastName: student.lastName,
      phoneNumber: student.phoneNumber,
      email: student.email,
      institutionAddress: student.institutionAddress,
      enrolledCourses: student.enrolledCourses,
      status: student.status,
      isVerified: student.isVerified
    }));
  } catch (error: any) {
    console.error('Error getting institution students:', error);
    throw new Error(error.message || 'Failed to get institution students');
  }
};

// Export other functions
export * from './role/student';

/**
 * Get basic user data from the contract
 * @param userAddress The address of the user
 * @returns User data
 */
export interface UserData {
  userAddress: string;
  role: number;
  isVerified: boolean;
  nationalId?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  email?: string;
  enrolledCourses?: any[];
  status?: number;
  name?: string;
  location?: string;
  website?: string;
  companyName?: string;
}

// Helper function to convert role string to number
const getRoleNumber = (role: string): number => {
  switch (role.toLowerCase()) {
    case 'student':
      return 1;
    case 'institution':
      return 2;
    case 'employer':
      return 3;
    case 'admin':
      return 4;
    default:
      return 0;
  }
};

/**
 * all roles can get user role
 * This function retrieves the user role from the identity contract.
 * @param address
 * @returns User role text
 */
export const getUserRole = async (address: string): Promise<RoleString> => {
  if (!address || !getAddress(address)) {
    throw new Error('Invalid address');
  }

  try {
    const contract = await getIdentityContract();
    const roleNumber = await contract.getUserRole(address);
    return getUserRoleText(Number(roleNumber));
  } catch (error: any) {
    console.error('Error getting user role:', error);
    return 'none';
  }
};

export const getUserData = async (address: string): Promise<UserData> => {
  if (!address || !getAddress(address)) {
    throw new Error('Invalid address');
  }

  try {
    const contract = await getIdentityContract();
    const role = await getUserRole(address);
    const roleNumber = getRoleNumber(role);

    if (role === 'student') {
      const studentData = await contract.getStudentData(address);
      if (!studentData) {
        throw new Error('Student data not found');
      }
      
      return {
        userAddress: address,
        role: roleNumber,
        nationalId: studentData.nationalId,
        firstName: studentData.firstName,
        lastName: studentData.lastName,
        phoneNumber: studentData.phoneNumber,
        email: studentData.email,
        enrolledCourses: studentData.enrolledCourses,
        status: studentData.status,
        isVerified: studentData.isVerified
      };
    }
    
    if (role === 'institution') {
      const institutionData = await contract.getInstitutionData(address);
      if (!institutionData) {
        throw new Error('Institution data not found');
      }
      
      return {
        userAddress: address,
        role: roleNumber,
        name: institutionData.name,
        location: institutionData.location,
        phoneNumber: institutionData.phoneNumber,
        email: institutionData.email,
        website: institutionData.website,
        status: institutionData.status,
        isVerified: institutionData.isVerified
      };
    }

    if (role === 'employer') {
      const employerData = await contract.getEmployerData(address);
      if (!employerData) {
        throw new Error('Employer data not found');
      }
      
      return {
        userAddress: address,
        role: roleNumber,
        companyName: employerData.companyName,
        location: employerData.location,
        phoneNumber: employerData.phoneNumber,
        email: employerData.email,
        website: employerData.website,
        isVerified: employerData.isVerified
      };
    }

    if (role === 'admin') {
      const adminData = await contract.getAdminData(address);
      if (!adminData) {
        throw new Error('Admin data not found');
      }

      return {
        userAddress: address,
        role: roleNumber,
        email: adminData.email,
        isVerified: adminData.isActive
      };
    }

    return {
      userAddress: address,
      role: roleNumber,
      isVerified: false
    };
  } catch (error: any) {
    console.error('Error getting user data:', error);
    return {
      userAddress: address,
      role: 0,
      isVerified: false
    };
  }
}

export const getUsersByRole = async (roleId: number): Promise<UserData[]> => {
  try {
    const contract = await getIdentityContract();
    let users: UserData[] = [];

    switch (roleId) {
      case 1: // Student
        const students = await contract.getInstitutionStudents();
        users = students.map(student => ({
          userAddress: student.userAddress,
          role: roleId,
          nationalId: student.nationalId,
          firstName: student.firstName,
          lastName: student.lastName,
          phoneNumber: student.phoneNumber,
          email: student.email,
          enrolledCourses: student.enrolledCourses,
          status: student.status,
          isVerified: student.isVerified
        }));
        break;

      case 2: // Institution
        const institutions = await contract.getAllInstitutions();
        users = institutions.map(inst => ({
          userAddress: inst.userAddress,
          role: roleId,
          name: inst.name,
          location: inst.location,
          phoneNumber: inst.phoneNumber,
          email: inst.email,
          website: inst.website,
          status: inst.status,
          isVerified: inst.isVerified
        }));
        break;

      case 3: // Employer
        const employers = await contract.getAllEmployers();
        users = employers.map(emp => ({
          userAddress: emp.userAddress,
          role: roleId,
          companyName: emp.companyName,
          location: emp.location,
          phoneNumber: emp.phoneNumber,
          email: emp.email,
          website: emp.website,
          isVerified: emp.isVerified
        }));
        break;

      case 4: // Admin
        const admins = await contract.getAllAdmins();
        users = admins.map(admin => ({
          userAddress: admin.userAddress,
          role: roleId,
          email: admin.email,
          isVerified: admin.isActive
        }));
        break;
    }

    if (users.length === 0) {
      Toast({
        title: 'No users found',
        description: `There are no users with role ${getUserRoleText(roleId)} registered in the system.`,
        status: 'info',
        duration: 3000,
        isClosable: true,
      });
    }

    return users;
  } catch (error) {
    console.error('Error in getUsersByRole:', error);
    throw error;
  }
};

/**
 * This function updates the user IPFS data.
 * @param userAddress
 * @returns Boolean
 */
export const updateUserIPFS = async (userAddress: string, data: any = {}) => {
  if (!userAddress || !getAddress(userAddress)) {
    throw new Error('Invalid address');
  }

  try {
    const identityContract = await getIdentityContract();

    const tx = await identityContract.updateUserIPFS(userAddress, data);
    await tx.wait();

    return { status: 'success' };
  } catch (error: any) {
    console.error('Error updating user IPFS:', error);
    throw error;
  }
}

/**
 * Check if an address belongs to an institution
 * @param address The address to check
 * @returns boolean
 */
export const isInstitution = async (address: string): Promise<boolean> => {
  if (!address || !getAddress(address)) {
    throw new Error('Invalid address');
  }

  try {
    const contract = await getIdentityContract();
    return await contract.isInstitution(address);
  } catch (error: any) {
    console.error('Error checking institution status:', error);
    return false;
  }
};