import { ethers } from 'ethers';
import { getConfig } from '../utils/config';
import { IdentityABI } from '../constants/abis';
import { getAddress, getProvider, getSigner } from 'utils/ethersConfig';
import { Toast } from '@chakra-ui/react';
import { getFromIPFS, uploadToIPFS } from 'utils/ipfsUtils';
import { Institution } from 'types/institution';

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
 * @param userAddress
 * @returns status
 */
export const verifyUser = async (useraddress: string) => {
  if (!useraddress || !getAddress(useraddress)) {
    throw new Error('Invalid address');
  }

  try {
    const signer = await getSigner();
    const address = await signer.getAddress();
    const contract = await getIdentityContract();
    // check is the user admin
    const isAdmin = await contract.isAdmin(address);
    if (!isAdmin) {
      throw new Error('Only admin can verify users');
    }

    // check if the user is institution
    const isInstitution = await getUserRole(useraddress);
    if (!isInstitution) {
      throw new Error('Only institution can be verified');
    }

    await isVerifiedUser(useraddress);
    const isVerified = await contract.isVerifiedUser(useraddress);

    if (!isVerified) {
      const tx = await contract.verifyUser(useraddress);
      await tx.wait();
      
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
      
      return { status: 'success' };
    }

    Toast({
      title: 'User already verified',
      description: 'User is already verified',
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
    return { status: 'already verified' };

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
 * @param 
 * @returns Array of user addresses
 */
export const getAllInstitutions = async () => {
  try {
    const contract = await getIdentityContract();
    const filter = contract.filters.UserRegistered(null, 2);
    const events = await contract.queryFilter(filter);

    const addresses = events.map(event => {
      const eventData = event as ethers.EventLog;
      if (eventData && eventData.args && eventData.args.length > 0) {
        return eventData.args[0];
      }
      return null;
    }).filter(address => address !== null);

    // get institution data
    const confirmedAddresses: Institution[] = [];
    for (const address of addresses) {
      try {
        const { ipfsHash, isVerified } = await getUserData(address);
        if (!ipfsHash) {
          console.warn(`No IPFS hash found for address: ${address}`);
          continue;
        }
        const institutionData = await getFromIPFS(ipfsHash);
        if (institutionData) {
          const institution = {
            ...institutionData,
          };
          institution.address = address;
          institution.isVerified = isVerified;
          confirmedAddresses.push(institution);
        } else {
          console.warn(`No data found for address: ${address}`);
        }

      } catch (error) {
        console.error(`Error checking user ${address}:`, error);
      }
    }

    return confirmedAddresses;
  }
  catch (error) {
    console.error('Error in getAllInstitutions:', error);
    throw error;
  }
};

/**
 * @param userAddress
 * @returns User data
 */
export const getUserData = async (userAddress: string): Promise<Institution> => {
  try {
    const contract = await getIdentityContract();
    const signer = await getSigner();

    const identityContract = contract.connect(signer) as unknown as IdentityContractType;

    try {
      const userData = await identityContract.users(userAddress);

      const result: Institution = {
        address: userAddress,
        ipfsHash: userData[1],
        role: userData[2],
        roleText: getUserRoleText(userData[2]),
        isVerified: userData[3],
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
 * @param role
 * @returns Array of user addresses
 */
export const getUsersByRole = async (role: number) => {
  try {
    const contract = await getIdentityContract();

    const filter = contract.filters.UserRegistered(null, role);
    const events = await contract.queryFilter(filter);

    const addresses = events.map(event => {
      const eventData = event as ethers.EventLog;
      if (eventData && eventData.args && eventData.args.length > 0) {
        return eventData.args[0];
      }
      return null;
    }).filter(address => address !== null);

    const confirmedAddresses = [];

    for (const address of addresses) {
      try {
        const userData = await getUserData(address as string);
        if (userData && userData.role === role) {
          confirmedAddresses.push(address);
        }
      } catch (error) {
        console.error(`Error checking user ${address}:`, error);
      }
    }

    return confirmedAddresses;
  } catch (error) {
    console.error('Error in getUsersByRole:', error);
    throw error;
  }
};

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
 * @param userAddress
 * @returns Boolean
 */
export const updateUserIPFS = async (userAddress: string, data: any = {}) => {
  if (!userAddress || !getAddress(userAddress)) {
    throw new Error('Invalid address');
  }

  try {
    const identityContract = await getIdentityContract();

    const tx = await identityContract.updateUserIPFS(data);
    await tx.wait();

    return { status: 'success' };
  } catch (error: any) {
    console.error('Error updating user IPFS:', error);
    throw error;
  }
}