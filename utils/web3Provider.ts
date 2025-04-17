import { BrowserProvider, JsonRpcSigner } from 'ethers';

interface RequestArguments {
  method: string;
  params?: unknown[] | object;
}

export interface EthereumProvider {
  isMetaMask?: boolean;
  request: (args: RequestArguments) => Promise<unknown>;
  on: (eventName: string, callback: (...args: any[]) => void) => void;
  removeListener: (eventName: string, callback: (...args: any[]) => void) => void;
  selectedAddress?: string;
}

export const EXPECTED_NETWORK = {
  chainId: process.env.NEXT_PUBLIC_CHAIN_ID || '1337',
  rpcUrl: process.env.NEXT_PUBLIC_NETWORK_URL || 'http://localhost:7545'
};

export async function connectWallet(): Promise<string[]> {
  if (typeof window === 'undefined' || !window.ethereum) {
    throw new Error('MetaMask is not installed');
  }

  try {
    const response = await window.ethereum.request({ 
      method: 'eth_requestAccounts' 
    });

    // التأكد من أن الاستجابة هي مصفوفة من العناوين
    if (!Array.isArray(response)) {
      throw new Error('Invalid response from MetaMask');
    }

    const accounts = response.map(account => {
      if (typeof account !== 'string') {
        throw new Error('Invalid account address');
      }
      return account;
    });
    
    if (accounts.length === 0) {
      throw new Error('No accounts found');
    }
    
    return accounts;
  } catch (error) {
    console.error('Error connecting to wallet:', error);
    throw error;
  }
}

export async function requestAccounts(): Promise<string[]> {
  if (typeof window === 'undefined' || !window.ethereum) {
    throw new Error('MetaMask is not installed');
  }

  try {
    const response = await window.ethereum.request({ 
      method: 'eth_requestAccounts' 
    });

    if (!Array.isArray(response)) {
      throw new Error('Invalid response from MetaMask');
    }

    const accounts = response.map(String);
    return accounts;
  } catch (error) {
    console.error('Error requesting accounts:', error);
    throw error;
  }
}

export async function getAccounts(): Promise<string[]> {
  if (typeof window === 'undefined' || !window.ethereum) {
    throw new Error('MetaMask is not installed');
  }

  try {
    const response = await window.ethereum.request({ 
      method: 'eth_accounts' 
    });

    if (!Array.isArray(response)) {
      throw new Error('Invalid response from MetaMask');
    }

    const accounts = response.map(String);
    return accounts;
  } catch (error) {
    console.error('Error getting accounts:', error);
    throw error;
  }
}

export async function getProvider(): Promise<BrowserProvider> {
  if (typeof window === 'undefined' || !window.ethereum) {
    throw new Error('MetaMask is not installed');
  }
  
  try {
    await validateNetwork();
    return new BrowserProvider(window.ethereum);
  } catch (error) {
    console.error('Error getting provider:', error);
    throw error;
  }
}

export async function getSigner(): Promise<JsonRpcSigner> {
  try {
    const provider = await getProvider();
    const signer = await provider.getSigner();
    return signer;
  } catch (error) {
    console.error('Error getting signer:', error);
    throw error;
  }
}

async function validateNetwork(): Promise<void> {
  if (!window.ethereum) throw new Error('MetaMask is not available');

  try {
    const chainId = await window.ethereum.request({ method: 'eth_chainId' });
    if (chainId !== EXPECTED_NETWORK.chainId) {
      throw new Error(`Please switch to the correct network (chainId: ${EXPECTED_NETWORK.chainId})`);
    }
  } catch (error) {
    console.error('Error validating network:', error);
    throw error;
  }
} 