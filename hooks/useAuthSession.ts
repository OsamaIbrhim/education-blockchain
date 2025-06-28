import { getUserRole } from 'services/identity';
import { connectWallet } from 'utils/web3Provider';

type RoleType = 'admin' | 'institution' | 'student' | 'employer' | 'unknown' | 'none';

export const connectAndFetchUserRole = async (): Promise<{
  address: string | null;
  role: RoleType | null;
}> => {
  try {
    const accounts = await connectWallet();
    if (accounts.length === 0) {
      throw new Error('No wallet address found.');
    }

    const address = accounts[0];
    const role = await getUserRole(address);

    return { address, role };
  } catch (error) {
    console.error('Wallet connection or role fetch failed:', error);
    return { address: null, role: null };
  }
};
