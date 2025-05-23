import { 
  Contract, 
  JsonRpcProvider, 
  BrowserProvider,
  formatUnits, 
  getAddress,
  type JsonRpcSigner,
  type Provider
} from 'ethers';

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
  chainId: '1337',
  chainIdHex: '0x539', // Hexadecimal representation of 1337
  name: 'Localhost',
  rpcUrl: 'http://127.0.0.1:7545',
  nativeCurrency: {
    name: 'ETH',
    symbol: 'ETH',
    decimals: 18
  }
};

// Function to switch to the correct network
export const switchToCorrectNetwork = async (ethereum: EthereumProvider) => {
  try {
    console.log('Attempting to switch network...');
    // First check current network
    const currentChainId = await ethereum.request({ method: 'eth_chainId' });
    console.log('Current chainId:', currentChainId);
    
    if (currentChainId === EXPECTED_NETWORK.chainIdHex) {
      console.log('Already on correct network');
      return;
    }

    console.log('Switching to network:', EXPECTED_NETWORK.chainIdHex);
    
    // Try to switch to the network
    await ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: EXPECTED_NETWORK.chainIdHex }]
    });
    
    // Wait a bit for the network switch to complete
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Verify the switch was successful
    const newChainId = await ethereum.request({ method: 'eth_chainId' });
    if (newChainId !== EXPECTED_NETWORK.chainIdHex) {
      throw new Error('Network switch failed');
    }
    
    console.log('Successfully switched to correct network');
  } catch (switchError: any) {
    console.error('Error in switchToCorrectNetwork:', switchError);
    
    // This error code indicates that the chain has not been added to MetaMask
    if (switchError.code === 4902) {
      try {
        console.log('Network not found, attempting to add...');
        await ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: EXPECTED_NETWORK.chainIdHex,
              chainName: EXPECTED_NETWORK.name,
              rpcUrls: [EXPECTED_NETWORK.rpcUrl],
              nativeCurrency: EXPECTED_NETWORK.nativeCurrency
            }
          ]
        });
        
        // Wait a bit for the network to be added
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Verify the network was added and switched to
        const finalChainId = await ethereum.request({ method: 'eth_chainId' });
        if (finalChainId !== EXPECTED_NETWORK.chainIdHex) {
          throw new Error('Network add failed');
        }
        
        console.log('Successfully added and switched to network');
      } catch (addError) {
        console.error('Error adding network:', addError);
        throw new Error('يرجى إضافة الشبكة المحلية يدوياً | Please add the local network manually');
      }
    } else {
      console.error('Error switching network:', switchError);
      throw new Error('يرجى تغيير الشبكة إلى الشبكة المحلية | Please switch to local network');
    }
  }
};

// Provider and signer functions
export const getProvider = async () => {
  if (!window.ethereum) {
    throw new Error('MetaMask غير مثبت - MetaMask is not installed');
  }

  try {
    // First check if we're on the correct network before doing anything else
    const currentChainId = await window.ethereum.request({ method: 'eth_chainId' });
    console.log('Initial chain ID check:', currentChainId);
    
    if (currentChainId !== EXPECTED_NETWORK.chainIdHex) {
      console.log('Wrong network detected, attempting to switch...');
      await switchToCorrectNetwork(window.ethereum);
      
      // Verify the switch was successful
      const newChainId = await window.ethereum.request({ method: 'eth_chainId' });
      if (newChainId !== EXPECTED_NETWORK.chainIdHex) {
        throw new Error('Failed to switch to correct network');
      }
    }

    // Only request accounts after we're on the correct network
    await window.ethereum.request({ method: "eth_requestAccounts" });
    
    // Create provider using BrowserProvider
    const provider = new BrowserProvider(window.ethereum);
    
    return provider;
  } catch (error) {
    console.error('Error getting provider:', error);
    throw error;
  }
};

export const getSigner = async (): Promise<JsonRpcSigner> => {
  const provider = await getProvider();
  return provider.getSigner();
};

export const validateNetwork = async (provider: Provider) => {
  try {
    console.log('Validating network...');
    const network = await provider.getNetwork();
    const chainId = network.chainId.toString();
    console.log('Current chainId:', chainId, 'Expected:', EXPECTED_NETWORK.chainId);
    
    if (chainId !== EXPECTED_NETWORK.chainId) {
      console.log('Wrong network detected in validateNetwork');
      if (!window.ethereum) {
        throw new Error(`يرجى الاتصال بشبكة ${EXPECTED_NETWORK.name} (Chain ID: ${EXPECTED_NETWORK.chainId}) | Please connect to ${EXPECTED_NETWORK.name} network`);
      }
      
      // Get the current chain ID directly from ethereum provider
      const currentChainId = await window.ethereum.request({ method: 'eth_chainId' });
      console.log('Current chain ID from ethereum:', currentChainId);
      
      if (currentChainId !== EXPECTED_NETWORK.chainIdHex) {
        await switchToCorrectNetwork(window.ethereum);
        
        // Wait for the network switch to complete
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Verify one final time
        const finalChainId = await window.ethereum.request({ method: 'eth_chainId' });
        if (finalChainId !== EXPECTED_NETWORK.chainIdHex) {
          throw new Error('Network switch verification failed');
        }
      }
    }
    
    console.log('Network validation passed');
  } catch (error) {
    console.error('Network validation failed:', error);
    throw error;
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

// Event listener for network changes
if (typeof window !== 'undefined' && window.ethereum?.on) {
  window.ethereum.on('chainChanged', (chainId: string) => {
    console.log('Network changed to:', chainId);
    if (chainId !== EXPECTED_NETWORK.chainIdHex) {
      console.log('Wrong network after change, reloading...');
      window.location.reload();
    }
  });
} 