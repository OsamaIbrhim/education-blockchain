import { ethers } from 'ethers';
import { getConfig } from '../utils/config';
import { IdentityABI } from '../constants/abis';
import { getProvider, getSigner } from 'utils/ethersConfig';

type IdentityContractType = ethers.Contract & {
  users(address: string): Promise<[string, string, number, boolean, any]>;
  getUserRole(address: string): Promise<number>;
};

/**
 * @param signer 
 * @returns 
*/
export const getIdentityContract = async (signer: ethers.Signer | ethers.Provider) => {
  const contractAddress = process.env.NEXT_PUBLIC_IDENTITY_CONTRACT_ADDRESS?.toString() || getConfig('IDENTITY_CONTRACT_ADDRESS');
  return new ethers.Contract(contractAddress, IdentityABI, signer) as unknown as IdentityContractType;
};

/**
 * @param userAddress
 * @returns User data
 */
export const getUserData = async (userAddress: string) => {
  try {
    const provider = await getProvider();
    const contract = await getIdentityContract(provider);
    const signer = await getSigner();
    
    const identityContract = contract.connect(signer) as unknown as IdentityContractType;
    
    try {
      const userData = await identityContract.users(userAddress);
      
      const result = {
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
 * @param role
 * @returns Array of user addresses
 */
export const getUsersByRole = async (role: number) => {
  try {
    const provider = await getProvider();
    const contract = await getIdentityContract(provider);

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
export const getUserRoleText = (roleId: number): string => {
  switch (roleId) {
    case 0:
      return 'nono';
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