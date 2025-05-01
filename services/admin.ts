import { ethers } from 'ethers';
import { IdentityABI } from '../constants/abis';
import { getProvider, getSigner } from 'utils/ethersConfig';
import { getConfig } from '../utils/config';
import { getExamManagementContract } from './examManagement';
type IdentityContractType = ethers.Contract & {
  getUsersByRole(role: number): Promise<string[]>;
  getUserData(address: string): Promise<[string, string, number, boolean, number]>;
  verifyUser(address: string): Promise<any>;
  addAdmin(address: string): Promise<any>;
  removeAdmin(address: string): Promise<any>;
  isAdmin(address: string): Promise<boolean>;
  isInstitution(address: string): Promise<boolean>;
  updateUserRole(address: string, role: number): Promise<any>;
  pause(): Promise<any>;
  unpause(): Promise<any>;
};

/**
 * Get the Identity contract instance
 * @param runner - Optional signer or provider
 * @returns The Identity contract instance
 */
export const getIdentityContract = async (runner?: ethers.Signer | ethers.Provider) => {
  const contractAddress = process.env.NEXT_PUBLIC_IDENTITY_CONTRACT_ADDRESS?.toString() || getConfig('IDENTITY_CONTRACT_ADDRESS');
  const runnerInstance = runner || await getProvider();
  return new ethers.Contract(contractAddress, IdentityABI, runnerInstance) as unknown as IdentityContractType;
};

/**
 * Get all users by role
 * @param role - User role (1: Student, 2: Institution, 3: Employer, 4: Admin)
 * @returns Array of addresses with the specified role
 */
export const getAllUsersByRole = async (role: number) => {
  try {
    const provider = await getProvider();
    const contract = await getIdentityContract(provider);
    const addresses = await contract.getUsersByRole(role);
    return addresses;
  } catch (error: any) {
    console.error('Error getting users by role:', error);
    return [];
  }
};

/**
 * Get detailed user data
 * @param address - User address
 * @returns User data object or null if error occurs
 */
export const getDetailedUserData = async (address: string) => {
  try {
    const provider = await getProvider();
    const contract = await getIdentityContract(provider);
    const data = await contract.getUserData(address);
    
    return {
      userAddress: data[0],
      ipfsHash: data[1],
      role: data[2],
      isVerified: data[3],
      createdAt: new Date(Number(data[4]) * 1000)
    };
  } catch (error: any) {
    console.error('Error getting user data:', error);
    return null;
  }
};

/**
 * Verify a user (admin only)
 * @param userAddress - Address of the user to verify
 * @returns Result object with success status and transaction details
 */
export const verifyUser = async (userAddress: string) => {
  try {
    const signer = await getSigner();
    const identityContract = await getIdentityContract(signer);
    const examManagementContract = await getExamManagementContract(signer);
    
    // Ensure caller is admin
    const signerAddress = await signer.getAddress();
    const isAdmin = await identityContract.isAdmin(signerAddress);
    
    if (!isAdmin) {
      return { success: false, message: 'Only admins can verify users' };
    }

    const examManagementTx = await examManagementContract.verifyInstitution(userAddress);
    await examManagementTx.wait();
    
    const identityTx = await identityContract.verifyUser(userAddress);
    await identityTx.wait();
    
    return {
      success: true,
      message: 'User verified successfully',
      examManagementHash: examManagementTx.hash,
      identityHash: identityTx.hash
    };
  } catch (error: any) {
    console.error('Error verifying user:', error);
    return {
      success: false,
      message: error.message || 'Failed to verify user'
    };
  }
};

/**
 * Add a new admin (owner only)
 * @param adminAddress - Address to add as admin
 * @returns Result object with success status and transaction details
 */
export const addAdmin = async (adminAddress: string) => {
  try {
    const signer = await getSigner();
    const contract = await getIdentityContract(signer);
    
    const tx = await contract.addAdmin(adminAddress);
    await tx.wait();
    
    return {
      success: true,
      message: 'Admin added successfully',
      hash: tx.hash
    };
  } catch (error: any) {
    console.error('Error adding admin:', error);
    return {
      success: false,
      message: error.message || 'Failed to add admin'
    };
  }
};

/**
 * Remove an admin (owner only)
 * @param adminAddress - Address to remove from admin role
 * @returns Result object with success status and transaction details
 */
export const removeAdmin = async (adminAddress: string) => {
  try {
    const signer = await getSigner();
    const contract = await getIdentityContract(signer);
    
    const tx = await contract.removeAdmin(adminAddress);
    await tx.wait();
    
    return {
      success: true,
      message: 'Admin removed successfully',
      hash: tx.hash
    };
  } catch (error: any) {
    console.error('Error removing admin:', error);
    return {
      success: false,
      message: error.message || 'Failed to remove admin'
    };
  }
};

/**
 * Check if an address is an admin
 * @param address - Address to check
 * @returns Boolean indicating if the address is an admin
 */
export const checkIsAdmin = async (address: string) => {
  try {
    const provider = await getProvider();
    const contract = await getIdentityContract(provider);
    return await contract.isAdmin(address);
  } catch (error: any) {
    console.error('Error checking admin status:', error);
    return false;
  }
};

/**
 * Check if an address is an institution
 * @param address - Address to check
 * @returns Boolean indicating if the address is an institution
 */
export const checkIsInstitution = async (address: string) => {
  try {
    const provider = await getProvider();
    const contract = await getIdentityContract(provider);
    return await contract.isInstitution(address);
  } catch (error: any) {
    console.error('Error checking institution status:', error);
    return false;
  }
};

/**
 * Update a user's role (admin only)
 * @param userAddress - Address of the user
 * @param newRole - New role to assign (1: Student, 2: Institution, 3: Employer)
 * @returns Result object with success status and transaction details
 */
export const updateUserRole = async (userAddress: string, newRole: number) => {
  try {
    const signer = await getSigner();
    const contract = await getIdentityContract(signer);
    
    // Ensure caller is admin
    const signerAddress = await signer.getAddress();
    const isAdmin = await contract.isAdmin(signerAddress);
    
    if (!isAdmin) {
      return { success: false, message: 'Only admins can update user roles' };
    }
    
    const tx = await contract.updateUserRole(userAddress, newRole);
    await tx.wait();
    
    return {
      success: true,
      message: 'User role updated successfully',
      hash: tx.hash
    };
  } catch (error: any) {
    console.error('Error updating user role:', error);
    return {
      success: false,
      message: error.message || 'Failed to update user role'
    };
  }
};

/**
 * Pause the Identity contract (admin only)
 * @returns Result object with success status and transaction details
 */
export const pauseContract = async () => {
  try {
    const signer = await getSigner();
    const contract = await getIdentityContract(signer);
    
    // Ensure caller is admin
    const signerAddress = await signer.getAddress();
    const isAdmin = await contract.isAdmin(signerAddress);
    
    if (!isAdmin) {
      return { success: false, message: 'Only admins can pause the contract' };
    }
    
    const tx = await contract.pause();
    await tx.wait();
    
    return {
      success: true,
      message: 'Contract paused successfully',
      hash: tx.hash
    };
  } catch (error: any) {
    console.error('Error pausing contract:', error);
    return {
      success: false,
      message: error.message || 'Failed to pause contract'
    };
  }
};

/**
 * Unpause the Identity contract (admin only)
 * @returns Result object with success status and transaction details
 */
export const unpauseContract = async () => {
  try {
    const signer = await getSigner();
    const contract = await getIdentityContract(signer);
    
    // Ensure caller is admin
    const signerAddress = await signer.getAddress();
    const isAdmin = await contract.isAdmin(signerAddress);
    
    if (!isAdmin) {
      return { success: false, message: 'Only admins can unpause the contract' };
    }
    
    const tx = await contract.unpause();
    await tx.wait();
    
    return {
      success: true,
      message: 'Contract unpaused successfully',
      hash: tx.hash
    };
  } catch (error: any) {
    console.error('Error unpausing contract:', error);
    return {
      success: false,
      message: error.message || 'Failed to unpause contract'
    };
  }
};

/**
 * Verify all institutions that aren't verified yet
 * @returns Result object with success status and counts
 */
export const verifyAllPendingInstitutions = async () => {
  try {
    const institutionAddresses = await getAllUsersByRole(2); // Role 2 is Institution
    const signer = await getSigner();
    const contract = await getIdentityContract(signer);
    
    // Ensure caller is admin
    const signerAddress = await signer.getAddress();
    const isAdmin = await contract.isAdmin(signerAddress);
    
    if (!isAdmin) {
      return { success: false, message: 'Only admins can perform batch verification' };
    }
    
    let verifiedCount = 0;
    let failedCount = 0;
    
    for (const address of institutionAddresses) {
      try {
        const userData = await getDetailedUserData(address);
        
        if (userData && !userData.isVerified) {
          const tx = await contract.verifyUser(address);
          await tx.wait();
          verifiedCount++;
        }
      } catch (error) {
        console.error(`Failed to verify institution ${address}:`, error);
        failedCount++;
      }
    }
    
    return {
      success: true,
      message: `Verified ${verifiedCount} institutions. Failed: ${failedCount}`,
      verifiedCount,
      failedCount
    };
  } catch (error: any) {
    console.error('Error in batch verification:', error);
    return {
      success: false,
      message: error.message || 'Failed to perform batch verification'
    };
  }
};

/**
 * Get admin dashboard statistics
 * @returns Statistics for the admin dashboard
 */
export const getAdminStats = async () => {
  try {
    const students = await getAllUsersByRole(1); // Role 1 is Student
    const institutions = await getAllUsersByRole(2); // Role 2 is Institution
    const employers = await getAllUsersByRole(3); // Role 3 is Employer
    const admins = await getAllUsersByRole(4); // Role 4 is Admin
    
    return {
      studentCount: students.length,
      institutionCount: institutions.length,
      employerCount: employers.length,
      adminCount: admins.length,
      totalUserCount: students.length + institutions.length + employers.length + admins.length
    };
  } catch (error: any) {
    console.error('Error getting admin stats:', error);
    return {
      studentCount: 0,
      institutionCount: 0,
      employerCount: 0,
      adminCount: 0,
      totalUserCount: 0
    };
  }
};