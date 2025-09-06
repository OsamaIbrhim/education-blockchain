import { ethers } from 'ethers';
import { getConfig } from '../utils/config';
import { IdentityABI } from '../constants/abis';
import { getAddress, getProvider, getSigner } from 'utils/ethersConfig';
import { Toast } from '@chakra-ui/react';
import { getFromIPFS, uploadToIPFS } from 'utils/ipfsUtils';
import { Institution } from 'types/institution';
import * as adminRole from './role/admin';
import * as institutionRole from './role/institution';
import * as studentRole from './role/student';
import * as employerRole from './role/employer';
import { RegistrationData } from '../types/registration';

type RoleString = 'none' | 'student' | 'institution' | 'employer' | 'admin' | 'unknown';

interface StudentData {
  userAddress: string;
  nationalId: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  enrolledCourses: string[];
  status: number;
  isVerified: boolean;
}

type IdentityContractType = ethers.Contract & {
  users(address: string): Promise<[string, number, string, string, string, string, string, string[], number, boolean]>;
  getUserRole(address: string): Promise<number>;
  getStudentData(address: string): Promise<StudentData>;
  getInstitutionStudents(): Promise<StudentData[]>;
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
  const contract = new ethers.Contract(contractAddress, IdentityABI, contractSigner) as unknown as IdentityContractType;
  return contract as IdentityContractType;
};

/**
 * For all roles to register a user
 * @param role
 * @returns status
 */
export const registerUser = async (data: RegistrationData) => {
  try {
    const contract = await getIdentityContract();
    const [firstName, lastName] = data.name.split(' ');

    // For students, verify institution address if provided
    const institutionAddress = data.role === 'student' && data.institutionAddress 
      ? data.institutionAddress 
      : '0x0000000000000000000000000000000000000000';

    // Call the userRegistration function
    const tx = await contract.userRegistration(
      getRoleNumber(data.role),
      institutionAddress,
      data.nationalId || '',
      firstName || data.name,
      lastName || '',
      data.phoneNumber,
      data.email
    );

    const receipt = await tx.wait();
    
    // Check if transaction was successful
    if (receipt.status !== 1) {
      throw new Error('Registration transaction failed');
    }

    // Check that we have logs
    if (!receipt.logs || receipt.logs.length === 0) {
      throw new Error('No events found in transaction');
    }

    // Get the interface from the contract
    const iface = contract.interface;
    
    // Try to find and decode the UserRegistered event
    for (const log of receipt.logs) {
      try {
        const parsed = iface.parseLog({
          topics: log.topics,
          data: log.data
        });
        
        if (parsed && parsed.name === 'UserRegistered') {
          console.log('User registered successfully:', {
            address: parsed.args[0],
            role: parsed.args[1]
          });
          return true;
        }
      } catch (e) {
        // Continue if this log entry isn't our event
        continue;
      }
    }

    // If we get here, we didn't find our event
    throw new Error('Registration failed: No UserRegistered event found');
  } catch (error: any) {
    console.error('Registration error:', error);
    throw new Error(error.message || 'Registration failed');
  }
};

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
 * Admin function to verify a user (institution)
 * @param userAddress
 * @returns status
 */
export const verifyUser = async (useraddress: string) => {
  if (!useraddress || !getAddress(useraddress)) {
    throw new Error('Invalid address');
  }

  try {

    // check if the user is institution
    const isInstitution = await getUserRole(useraddress);
    if (!isInstitution) {
      throw new Error('Only institution can be verified');
    }

    const tx = await adminRole.verifyUser(useraddress);

    if (tx.success) {
      const institution = await getUserData(useraddress);

      Toast({
        title: 'User verified successfully',
        description: `User ${useraddress} has been verified`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      return { status: 'success' };

    } else if (tx.success === false && tx.message === 'User is already verified') {
      Toast({
        title: 'User already verified',
        description: 'User is already verified',
        status: 'info',
        duration: 3000,
        isClosable: true,
      });
      return { status: 'already verified' };
    } else if (tx.success === false && tx.message === 'Only admins can verify users') {
      Toast({
        title: 'Only admins can verify users',
        description: 'You need to be an admin to verify users',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return { status: 'not admin' };
    }
    throw new Error(tx.message || 'Failed to verify user');
  } catch (error: any) {
    Toast({
      title: 'Error verifying user:',
      description: error.message || error,
      status: 'error',
      duration: 3000,
      isClosable: true,
    });
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
    const signer = await getSigner();
    const identityContract = await getIdentityContract(signer);
    const isVerified = await identityContract.isVerifiedUser(address);
    return isVerified;
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
    const signer = await getSigner();
    const identityContract = await getIdentityContract(signer);
    const owner = await identityContract.owner();

    // Add additional checks
    if (!owner) {
      console.warn('Owner address is null or undefined');
      return { status: false, owner: null };
    }

    const isOwner = owner.toLowerCase() === address.toLowerCase();
    return { status: isOwner, owner };
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
    const identityContract = await getIdentityContract();
    const isEnrolled = await identityContract.isStudentEnrolled(_institution, _student);
    return isEnrolled;
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
export const addStudents = async (usersAddresses: string[]) => {
  if (!usersAddresses || usersAddresses.length === 0) {
    throw new Error('No users addresses provided');
  }
  try {
    const signer = await getSigner();
    const identityContract = await getIdentityContract(signer);

    const tx = await identityContract.addStudents(usersAddresses);
    await tx.wait();

    return { status: 'success' };
  }
  catch (error: any) {
    console.error('Error adding students:', error);
    throw error;
  }
};

/**
 * All roles can get user data
 * This function retrieves user data from the identity contract and IPFS.
 * @param userAddress
 * @returns User data
 */
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
    const studentData = await contract.getStudentData(studentAddress);
    return {
      userAddress: studentData.userAddress,
      nationalId: studentData.nationalId,
      firstName: studentData.firstName,
      lastName: studentData.lastName,
      phoneNumber: studentData.phoneNumber,
      email: studentData.email,
      enrolledCourses: studentData.enrolledCourses,
      status: studentData.status,
      isVerified: studentData.isVerified
    };
  } catch (error: any) {
    console.error('Error getting student data:', error);
    throw error;
  }
};

/**
 * Get all students enrolled in the caller's institution
 * @returns Array of StudentData objects
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
      enrolledCourses: student.enrolledCourses,
      status: student.status,
      isVerified: student.isVerified
    }));
  } catch (error: any) {
    console.error('Error getting institution students:', error);
    throw error;
  }
};

/**
 * Get basic user data from the contract
 * @param userAddress The address of the user
 * @returns User data
 */
export const getUserData = async (userAddress: string): Promise<any> => {
  if (!userAddress || !getAddress(userAddress)) {
    throw new Error('Invalid address');
  }

  try {
    const contract = await getIdentityContract();
    const signer = await getSigner();
    const identityContract = contract.connect(signer) as unknown as IdentityContractType;
    
    try {
      const result = await identityContract.users(userAddress);

      return {
        userAddress: result[0],
        role: Number(result[1]),
        institutionAddress: result[2],
        nationalId: result[3],
        firstName: result[4],
        lastName: result[5],
        phoneNumber: result[6],
        email: result[7],
        enrolledCourses: Number(result[1]) === 2 ? [] : (Array.isArray(result[8]) ? result[8] : []),
        status: Number(result[9]),
        isVerified: result[10],
      };
    } catch (parseError: any) {
      console.error('Error parsing user data:', parseError);
      return {
        userAddress,
        role: 0,
        institutionAddress: '0x0000000000000000000000000000000000000000',
        nationalId: '',
        firstName: '',
        lastName: '',
        phoneNumber: '',
        email: '',
        enrolledCourses: [],
        status: 0,
        isVerified: false
      };
    }
  } catch (error) {
    console.error('Error getting user data:', error);
    throw error;
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
    const signer = await getSigner();
    const identityContract = await getIdentityContract(signer);
    const role = await identityContract.getUserRole(address);

    // convert role to number
    const roleNumber = Number(role);

    const roleValue = getUserRoleText(roleNumber);

    return roleValue;
  } catch (error: any) {
    console.error('Error getting user role:', error);
    return 'none';
  }
};

/**
 * This function retrieves all users with a specific role from the identity contract.
 * @param role
 * @returns Array of user addresses
 */
export const getUsersByRole = async (role: number) => {
  try {
    const addressesFromAdminRole = await adminRole.getUsersByRole(role);

    if (!addressesFromAdminRole || addressesFromAdminRole.length === 0) {
      Toast({
        title: 'No users found',
        description: `There are no users with role ${getUserRoleText(role)} registered in the system.`,
        status: 'info',
        duration: 3000,
        isClosable: true,
      });
      return [];
    }

    const institutions: Institution[] = [];

    for (const address of addressesFromAdminRole) {
      try {
        const userData = await getUserData(address as string);
        if (userData && Number(userData.role) === role) {
          institutions.push(userData);
        }
      } catch (error) {
        console.error(`Error checking user ${address}:`, error);
      }
    }

    return institutions;
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
 * @param roleId
 * @returns
 */
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

/**
 * Add multiple students to an institution
 * @param studentAddresses Array of student addresses to add
 * @returns status
 */
export const addStudentsToInstitution = async (studentAddresses: string[]) => {
  if (!studentAddresses || studentAddresses.length === 0) {
    throw new Error('No student addresses provided');
  }

  try {
    const contract = await getIdentityContract();
    const tx = await contract.addStudents(studentAddresses);
    await tx.wait();

    Toast({
      title: 'Students added successfully',
      description: `Added ${studentAddresses.length} students to the institution`,
      status: 'success',
      duration: 3000,
      isClosable: true,
    });

    return { status: 'success' };
  } catch (error: any) {
    console.error('Error adding students:', error);
    Toast({
      title: 'Failed to add students',
      description: error.message || 'Failed to add students to institution',
      status: 'error',
      duration: 3000,
      isClosable: true,
    });
    throw error;
  }
};

/**
 * Get all institutions registered in the system
 * @returns Array of institution addresses
 */
export const getAllInstitutions = async () => {
  try {
    const contract = await getIdentityContract();
    
    // Get all user addresses from events
    const filter = contract.filters.UserRegistered(null, 2); // 2 is the INSTITUTION role
    const events = await contract.queryFilter(filter);
    
    // Process the events to get unique institution addresses
    const institutionAddresses = await Promise.all(
      events.map(async (event: any) => {
        const address = event.args?.[0]; // First argument is userAddress
        if (address) {
          // Verify the address is still an institution (role hasn't changed)
          const isStillInstitution = await contract.isInstitution(address);
          return isStillInstitution ? address : null;
        }
        return null;
      })
    );

    // Filter out null values and duplicates
    const uniqueAddresses = Array.from(new Set(institutionAddresses.filter((addr): addr is string => addr !== null)));

    return uniqueAddresses;
  } catch (error: any) {
    console.error('Error getting institutions:', error);
    throw error;
  }
};
