import { getSigner } from 'utils/ethersConfig';
import { getExamManagementContract } from '../examManagement';
import { getIdentityContract } from '../identity';
import { ethers, getAddress } from 'ethers';

/**
 * Verify a user (admin only)
 */
export const verifyUser = async (userAddress: string) => {
  try {
    const signer = await getSigner();
    const identityContract = await getIdentityContract();

    // Ensure caller is admin
    const signerAddress = await signer.getAddress();
    const isAdmin = await identityContract.isAdmin(signerAddress);
    const isVerified = await isVerifiedUser(userAddress);

    if (!isAdmin) {
      return { success: false, message: 'Only admins can verify users' };
    }

    if (isVerified) {
      return { success: false, message: 'User is already verified' };
    }

    const identityTx = await identityContract.verifyUser(userAddress);
    await identityTx.wait();

    return {
      success: true,
      message: 'User verified successfully',
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
 * @param userAddress
 * @returns Boolean
 */
export const isVerifiedUser = async (address: string) => {
  if (!address) {
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
 * Add a new admin (owner only)
 */
export const addAdmin = async (adminAddress: string) => {
  try {
    const contract = await getIdentityContract();
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
    const contract = await getIdentityContract();
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
 * Update a user's role (admin only)
 * @param userAddress - Address of the user
 * @param newRole - New role to assign (1: Student, 2: Institution, 3: Employer)
 * @returns Result object with success status and transaction details
 */
export const updateUserRole = async (userAddress: string, newRole: number) => {
  try {
    const signer = await getSigner();
    const contract = await getIdentityContract();

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
    const contract = await getIdentityContract();

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
    const contract = await getIdentityContract();

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
 * Check if an address is an admin
 */
export const checkIsAdmin = async (address: string) => {
  try {
    const contract = await getIdentityContract();
    return await contract.isAdmin(address);
  } catch (error: any) {
    console.error('Error checking admin status:', error);
    return false;
  }
};

/**
 * Batch verify all pending institutions (admin only)
 */
export const verifyAllPendingInstitutions = async (getAllUsersByRole: (role: number) => Promise<string[]>, getDetailedUserData: (address: string) => Promise<any>) => {
  try {
    const institutionAddresses = await getAllUsersByRole(2); // Role 2 is Institution
    const signer = await getSigner();
    const contract = await getIdentityContract();

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
export const getAdminStats = async (getAllUsersByRole: (role: number) => Promise<string[]>) => {
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

    return addresses;
  } catch (error) {
    console.error('Error in getUsersByRole:', error);
    throw error;
  }
};

/**
 * @param userAddress
 * @returns Boolean
 */
export const removeUser = async (userAddress: string) => {
  if (!userAddress || !ethers.isAddress(userAddress)) {
    throw new Error('Invalid address');
  }

  try {
    const contract = await getIdentityContract();

    const tx = await contract.removeUser(userAddress);
    await tx.wait();

    return { status: 'success' };
  } catch (error: any) {
    console.error('Error removing user:', error);
    throw error;
  }
}

/**
 * @param userAddress
 * @returns Boolean
 */
export const revokeUser = async (userAddress: string) => {
  if (!userAddress || !getAddress(userAddress)) {
    throw new Error('Invalid address');
  }

  try {
    const identityContract = await getIdentityContract();

    const tx = await identityContract.revokeUser(userAddress);
    await tx.wait();

    return { status: 'success' };
  } catch (error: any) {
    console.error('Error revoking user:', error);
    throw error;
  }
}

/**
 * @param userAddress
 * @returns Boolean
 */
export const revokeInstitutionRole = async (userAddress: string) => {
  if (!userAddress || !getAddress(userAddress)) {
    throw new Error('Invalid address');
  }

  try {
    const identityContract = await getIdentityContract();

    const tx = await identityContract.revokeInstitutionRole(userAddress);
    await tx.wait();

    return { status: 'success' };
  } catch (error: any) {
    console.error('Error revoking institution role:', error);
    throw error;
  }
}

/**
 * @param userAddress
 * @returns Boolean
 */
export const grantInstitutionRole = async (userAddress: string) => {
  if (!userAddress || !getAddress(userAddress)) {
    throw new Error('Invalid address');
  }

  try {
    const identityContract = await getIdentityContract();

    const tx = await identityContract.grantInstitutionRole(userAddress);
    await tx.wait();

    return { status: 'success' };
  } catch (error: any) {
    console.error('Error granting institution role:', error);
    throw error;
  }
}

/**
 * @param userAddress
 * @returns Boolean
 */
export const grantEmployerRole = async (userAddress: string) => {
  if (!userAddress || !getAddress(userAddress)) {
    throw new Error('Invalid address');
  }

  try {
    const identityContract = await getIdentityContract();

    const tx = await identityContract.grantEmployerRole(userAddress);
    await tx.wait();

    return { status: 'success' };
  } catch (error: any) {
    console.error('Error granting employer role:', error);
    throw error;
  }
}

/**
 * @param userAddress
 * @returns Boolean
 */
export const revokeEmployerRole = async (userAddress: string) => {
  if (!userAddress || !getAddress(userAddress)) {
    throw new Error('Invalid address');
  }

  try {
    const identityContract = await getIdentityContract();

    const tx = await identityContract.revokeEmployerRole(userAddress);
    await tx.wait();

    return { status: 'success' };
  } catch (error: any) {
    console.error('Error revoking employer role:', error);
    throw error;
  }
}


/**
 * @param userAddress
 * @returns Boolean
 */
export const revokeAdminRole = async (userAddress: string) => {
  if (!userAddress || !getAddress(userAddress)) {
    throw new Error('Invalid address');
  }

  try {
    const identityContract = await getIdentityContract();

    const tx = await identityContract.revokeAdminRole(userAddress);
    await tx.wait();

    return { status: 'success' };
  } catch (error: any) {
    console.error('Error revoking admin role:', error);
    throw error;
  }
}

/**
 * @param userAddress
 * @returns Boolean
 */
export const grantAdminRole = async (userAddress: string) => {
  if (!userAddress || !getAddress(userAddress)) {
    throw new Error('Invalid address');
  }

  try {
    const identityContract = await getIdentityContract();

    const tx = await identityContract.grantAdminRole(userAddress);
    await tx.wait();

    return { status: 'success' };
  } catch (error: any) {
    console.error('Error granting admin role:', error);
    throw error;
  }
}

export * from './admin';