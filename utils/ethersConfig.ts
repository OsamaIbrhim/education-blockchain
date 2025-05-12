import { 
  Contract, 
  JsonRpcProvider, 
  formatUnits, 
  getAddress as _getAddress,
  type JsonRpcSigner,
  BrowserProvider as Web3Provider
} from 'ethers';

// Re-export the getAddress function
export const getAddress = _getAddress;

// Types
export interface RequestArguments {
  method: string;
  params?: unknown[] | object;
}

export interface EthereumProvider {
  request(args: RequestArguments): Promise<unknown>;
  on?(eventName: string, callback: (...args: any[]) => void): void;
  removeListener?(eventName: string, callback: (...args: any[]) => void): void;
  selectedAddress?: string;
  isMetaMask?: boolean;
  chainId?: string;
  networkVersion?: string;
}

// Add type declaration for the global window object
declare global {
  interface Window {
    ethereum?: EthereumProvider;
  }
}

// Network configuration
export const EXPECTED_NETWORK = {
  chainId: process.env.NEXT_PUBLIC_CHAIN_ID || '1337',
  name: 'Localhost',
  rpcUrl: process.env.NEXT_PUBLIC_NETWORK_URL || 'http://localhost:8545'
};

// Provider and signer functions
export const getProvider = async () => {
  if (typeof window === 'undefined' || !window.ethereum) {
    throw new Error('No ethereum provider found');
  }

  const provider = new Web3Provider(window.ethereum);
  await window.ethereum.request({ method: "eth_requestAccounts" });
  return provider;
};

export const getSigner = async (): Promise<JsonRpcSigner> => {
  const provider = await getProvider();
  return provider.getSigner();
};

export const validateNetwork = async (provider: JsonRpcProvider) => {
  const network = await provider.getNetwork();
  const chainId = network.chainId.toString();
  
  if (chainId !== EXPECTED_NETWORK.chainId) {
    throw new Error(`Please connect to ${EXPECTED_NETWORK.name} network (Chain ID: ${EXPECTED_NETWORK.chainId})`);
  }
};

// Helper functions for working with contracts
export const getContract = <T extends Contract>(
  address: string,
  abi: any,
  signer: JsonRpcSigner
): T => {
  return new Contract(address, abi, signer) as T;
};

export const validateAddress = (address: string | undefined | null): string => {
  if (!address) {
    throw new Error('Address is required');
  }
  
  try {
    return getAddress(address);
  } catch (error) {
    throw new Error('Invalid Ethereum address');
  }
};

export const formatEther = (value: bigint): string => {
  return formatUnits(value, 18);
};

// Utility function to handle common contract errors
export const handleContractError = (error: any): never => {
  console.error('Contract error:', error);
  
  if (error.reason) {
    throw new Error(`Smart contract error: ${error.reason}`);
  } else if (error.message?.includes('user rejected')) {
    throw new Error('Transaction rejected by user');
  } else if (error.message?.includes('insufficient funds')) {
    throw new Error('Insufficient funds to complete the transaction');
  } else if (error.message?.includes('network')) {
    throw new Error('Please make sure you are connected to the correct network');
  } else {
    throw new Error('Transaction failed. Please check your connection and try again.');
  }
}; 