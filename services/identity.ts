import { ethers, getAddress, isAddress } from 'ethers';
import { getConfig } from '../utils/config';
import { IdentityABI } from '../constants/abis';
import { getProvider, getSigner } from 'utils/ethersConfig';
import { Toast } from '@chakra-ui/react';
import { getFromIPFS, uploadToIPFS } from 'utils/ipfsUtils';
import { Institution } from 'types/institution';
import * as adminRole from './role/admin';
import * as institutionRole from './role/institution';
import * as studentRole from './role/student';
import * as employerRole from './role/employer';
import { initializeStudentAcademicRecord } from './studentAcademicManager';

type RoleString = 'none' | 'student' | 'employer' | 'admin' | 'unknown';

type IdentityContractType = ethers.Contract & {
  users(address: string): Promise<[
    string, // userAddress
    number, // role (uint8)
    string, // nationalId
    string, // firstName
    string, // lastName
    string, // phoneNumber
    string, // email
    string[], // enrolledCourses
    number, // status (uint8)
    boolean // isVerified
  ]>;
  getUserRole(address: string): Promise<number>;
  registerUser(
    userAddress: string,
    role: number,
    nationalId: string,
    firstName: string,
    lastName: string,
    phoneNumber: string,
    email: string
  ): Promise<any>;
  selfRegister(
    role: number,
    nationalId: string,
    firstName: string,
    lastName: string,
    phoneNumber: string,
    email: string
  ): Promise<any>;
  completeUserProfile(
    nationalId: string,
    firstName: string,
    lastName: string,
    phoneNumber: string,
    email: string
  ): Promise<any>;
  verifyUser(userAddress: string): Promise<any>;
  revokeVerification(userAddress: string): Promise<any>;
  getUnverifiedUsers(): Promise<string[]>;
  isVerifiedUser(address: string): Promise<boolean>;
  owner(): Promise<string>;
  isStudentEnrolled(student: string): Promise<boolean>;
  addStudents(userAddresses: string[]): Promise<any>;
  removeStudents(userAddresses: string[]): Promise<any>;
  updateUserIPFS(userAddress: string, data: any): Promise<any>;
};

interface User {
  address: string; // userAddress
  role: string; // role (uint8)
  nationalId: string; // nationalId
  firstName: string; // firstName
  lastName: string; // lastName
  phoneNumber: string; // phoneNumber
  email: string; // email
  // enrolledCourses: string[]; // enrolledCourses
  status: number; // status (uint8)
  isVerified: boolean // isVerified
}

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
 * @param userAddress
 * @param nationalId
 * @param firstName
 * @param lastName
 * @param phoneNumber
 * @param email
 * @returns status
 */
export const registerAdminUser = async (
  userAddress: string,
  nationalId: string,
  firstName: string,
  lastName: string,
  phoneNumber: string,
  email: string,
) => {
  if (!userAddress || !isAddress(userAddress)) {
    throw new Error('A valid user address is required');
  }
  if (!nationalId || !firstName || !lastName || !phoneNumber || !email) {
    throw new Error('All user details are required');
  }

  try {
    if (!window.ethereum) {
      throw new Error('No ethereum provider found');
    }
    const provider = new ethers.BrowserProvider(window.ethereum);

    const signer = await provider.getSigner();

    const identityContract = await getIdentityContract(signer);

    const tx = await identityContract.registerUser(
      userAddress,
      3,
      nationalId,
      firstName,
      lastName,
      phoneNumber,
      email
    );
    await tx.wait();

    return { status: 'success' };
  } catch (error: any) {
    console.error('Registration error:', error);
    throw error;
  }
};

export const selfRegister = async (
  role: string,
  nationalId: string,
  firstName: string,
  lastName: string,
  phoneNumber: string,
  email: string,
) => {
  if (!role) {
    throw new Error('Role is required');
  }
  if (!nationalId || !firstName || !lastName || !phoneNumber || !email) {
    throw new Error('All user details are required');
  }

  try {
    if (!window.ethereum) {
      throw new Error('No ethereum provider found');
    }
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const identityContract = await getIdentityContract(signer);

    const roleMap: { [key: string]: number } = {
      'student': 1,
      'employer': 2,
    };

    const roleValue = roleMap[role.toLowerCase()];
    if (roleValue === undefined) {
      throw new Error(`Invalid role: ${role}. Must be one of: student, employer`);
    }

    const tx = await identityContract.selfRegister(
      roleValue,
      nationalId,
      firstName,
      lastName,
      phoneNumber,
      email,
    );
    await tx.wait();

    if (roleValue === 1) {
      const address = await signer.getAddress();
      await initializeStudentAcademicRecord(address);
    }

    return { status: 'success' };
  } catch (error: any) {
    console.error('Self-registration error:', error);
    throw error;
  }
};

export const completeUserProfile = async (
  nationalId: string,
  firstName: string,
  lastName: string,
  phoneNumber: string,
  email: string
) => {
  if (!nationalId || !firstName || !lastName || !phoneNumber || !email) {
    throw new Error('All user details are required');
  }

  try {
    const signer = await getSigner();
    const identityContract = await getIdentityContract(signer);

    const tx = await identityContract.completeUserProfile(
      nationalId,
      firstName,
      lastName,
      phoneNumber,
      email
    );
    await tx.wait();

    return { status: 'success' };
  } catch (error: any) {
    console.error('Profile completion error:', error);
    throw error;
  }
};

export const loginUser = async (userAddress: string) => {
  if (!userAddress || !getAddress(userAddress)) {
    throw new Error('Invalid address');
  }
  try {
    const identityContract = await getIdentityContract();
    const userData = await identityContract.users(userAddress);
    if (!userData) {
      throw new Error('User not found');
    }

  } catch (error: any) {
    console.error('Login error:', error);
    throw new Error(`Login failed: ${error.message || error}`);
  }
  return { status: 'success', address: userAddress };
};

/**
 * Admin function to verify a user (institution)
 * @param userAddress
 * @returns status
 */
export const verifyUser = async (userAddress: string) => {
  if (!userAddress || !getAddress(userAddress)) {
    throw new Error('Invalid address');
  }

  try {
    const signer = await getSigner();
    const identityContract = await getIdentityContract(signer);
    const tx = await identityContract.verifyUser(userAddress);
    await tx.wait();

    Toast({
      title: 'User verified successfully',
      description: `User ${userAddress} has been verified`,
      status: 'success',
      duration: 3000,
      isClosable: true,
    });

    return { status: 'success' };

  } catch (error: any) {
    console.error('Error verifying user:', error);
    Toast({
      title: 'Error verifying user:',
      description: error.message || 'An unexpected error occurred.',
      status: 'error',
      duration: 3000,
      isClosable: true,
    });
    throw error;
  }
};

export const revokeVerification = async (userAddress: string) => {
  if (!userAddress || !getAddress(userAddress)) {
    throw new Error('Invalid address');
  }

  try {
    const signer = await getSigner();
    const identityContract = await getIdentityContract(signer);
    const tx = await identityContract.revokeVerification(userAddress);
    await tx.wait();

    Toast({
      title: 'User verification revoked',
      description: `Verification for ${userAddress} has been revoked.`,
      status: 'success',
      duration: 3000,
      isClosable: true,
    });

    return { status: 'success' };
  } catch (error: any) {
    console.error('Error revoking verification:', error);
    Toast({
      title: 'Error Revoking Verification',
      description: error.message || 'An unexpected error occurred.',
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
export const isOwner = async (address: string): Promise<boolean> => {
  if (!address) {
    throw new Error('Invalid address');
  }

  const checksummedAddress = getAddress(address);

  try {
    const signer = await getSigner();
    const identityContract = await getIdentityContract(signer);

    if (typeof identityContract.owner !== 'function') {
      throw new Error('The identity contract does not have an owner() function.');
    }

    const owner = await identityContract.owner();

    // Validate that the owner is a valid Ethereum address
    if (!isAddress(owner)) {
      throw new Error('The owner address returned by the contract is invalid.');
    }

    // Always compare checksummed addresses
    return owner.toLowerCase() === checksummedAddress.toLowerCase();
  } catch (error: any) {
    console.error('Error checking owner status:', error);
    throw new Error(`Error checking owner status: ${error.message || error}`);
  }
};

/**
 * Instiution function
 * Check if a student is enrolled in an institution
 * @param _student
 * @returns Boolean
 */
export const isStudentEnrolled = async (_student: string) => {
  if (!_student) {
    throw new Error('Invalid address');
  }

  try {
    const identityContract = await getIdentityContract();
    const isEnrolled = await identityContract.isStudentEnrolled(_student);
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

export const removeStudents = async (usersAddresses: string[]) => {
  if (!usersAddresses || usersAddresses.length === 0) {
    throw new Error('No users addresses provided');
  }
  try {
    const signer = await getSigner();
    const identityContract = await getIdentityContract(signer);

    const tx = await identityContract.removeStudents(usersAddresses);
    await tx.wait();

    return { status: 'success' };
  }
  catch (error: any) {
    console.error('Error removing students:', error);
    throw error;
  }
};

/**
 * All roles can get user data
 * This function retrieves user data from the identity contract and IPFS.
 * @param userAddress
 * @returns User data
 */
export const getUserData = async (userAddress: string) => {
  try {
    const contract = await getIdentityContract();
    const signer = await getSigner();

    const identityContract = contract.connect(signer) as unknown as IdentityContractType;

    try {
      const userFromContract = await identityContract.users(userAddress);

      // Validate and sanitize string fields
      const sanitizeString = (value: any): string => (typeof value === 'string' ? value.trim() : '');

      const user: User = {
        address: userFromContract[0],
        role: getUserRoleText(Number(userFromContract[1])),
        nationalId: sanitizeString(userFromContract[2]),
        firstName: sanitizeString(userFromContract[3]),
        lastName: sanitizeString(userFromContract[4]),
        phoneNumber: sanitizeString(userFromContract[5]),
        email: sanitizeString(userFromContract[6]),
        // enrolledCourses, // Use the decoded or fallback value
        status: userFromContract[8],
        isVerified: userFromContract[9],
      };

      return user;
    } catch (error) {
      console.error('Error fetching user data:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in getUserData:', error);
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
export const getUnverifiedUsers = async () => {
  try {
    const signer = await getSigner();
    const identityContract = await getIdentityContract(signer);
    const addresses = await identityContract.getUnverifiedUsers();
    return addresses;
  } catch (error) {
    console.error('Error fetching unverified users:', error);
    throw error;
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
      return 'employer';
    case 3:
      return 'admin';
    default:
      return 'unknown';
  }
};

export {
  adminRole,
  institutionRole,
  studentRole,
  employerRole,
};