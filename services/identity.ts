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

type RoleString = 'none' | 'student' | 'institution' | 'employer' | 'admin' | 'unknown';

type IdentityContractType = ethers.Contract & {
  users(address: string): Promise<[string, string, number, boolean, any]>;
  getUserRole(address: string): Promise<number>;
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
export const registerUser = async (role: string) => {
  if (!role) {
    throw new Error('Role is required');
  }

  try {
    if (!window.ethereum) {
      throw new Error('No ethereum provider found');
    }
    const provider = new ethers.BrowserProvider(window.ethereum);

    const signer = await provider.getSigner();

    const identityContract = await getIdentityContract(signer);

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

      const { ipfsHash } = institution;
      if (!ipfsHash) {
        throw new Error('No IPFS hash found for institution');
      }

      const institutionData = await getFromIPFS(ipfsHash);
      if (!institutionData) {
        throw new Error('No data found for institution');
      }

      institutionData.verificationDate = new Date().toISOString();
      institutionData.address = useraddress;

      const newIPFS = await uploadToIPFS(institutionData, useraddress);

      await updateUserIPFS(useraddress, newIPFS);

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
export const getUserData = async (userAddress: string): Promise<Institution> => {
  try {
    const contract = await getIdentityContract();
    const signer = await getSigner();

    const identityContract = contract.connect(signer) as unknown as IdentityContractType;

    try {
      const userDataFromContract = await identityContract.users(userAddress);

      const userDateFromIPFS = await getFromIPFS(userDataFromContract[1]);
      if (!userDateFromIPFS) {
        throw new Error('No user data found on IPFS');
      }

      const result: Institution = {
        address: userAddress,
        ipfsHash: userDataFromContract[1],
        role: userDataFromContract[2],
        roleText: getUserRoleText(userDataFromContract[2]),
        isVerified: userDataFromContract[3],
        name: userDateFromIPFS?.name,
        description: userDateFromIPFS?.description,
        imageUrl: userDateFromIPFS?.imageUrl,
        imageIpfsCid: userDateFromIPFS?.imageIpfsCid,
        website: userDateFromIPFS?.website,
        email: userDateFromIPFS?.email,
        phone: userDateFromIPFS?.phone,
        lastUpdated: userDateFromIPFS?.lastUpdated,
        establishedDate: userDateFromIPFS?.establishedDate,
        accreditationNumber: userDateFromIPFS?.accreditationNumber,
        ministry: userDateFromIPFS?.ministry,
        university: userDateFromIPFS?.university,
        college: userDateFromIPFS?.college,
        verificationDate: userDateFromIPFS?.verificationDate,
        createdAt: new Date(),
      };
      return result;
    } catch (error) {
      throw error;
    }
  } catch (error) {
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


export {
  adminRole,
  institutionRole,
  studentRole,
  employerRole,
};