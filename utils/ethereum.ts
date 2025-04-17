import type { EthereumProvider } from './ethersConfig';

declare global {
  interface Window {
    ethereum?: EthereumProvider;
  }
}

export const getEthereumAccounts = async (ethereum: EthereumProvider): Promise<string[]> => {
  const response = await ethereum.request({ method: 'eth_accounts' });
  if (!Array.isArray(response)) {
    throw new Error('Invalid response from ethereum.request');
  }
  const accounts = response.map(item => {
    if (typeof item !== 'string') {
      throw new Error('Invalid account address in response');
    }
    return item;
  });
  return accounts;
};

export const requestAccounts = async (ethereum: EthereumProvider): Promise<string[]> => {
  const response = await ethereum.request({ method: 'eth_requestAccounts' });
  if (!Array.isArray(response)) {
    throw new Error('Invalid response from ethereum.request');
  }
  const accounts = response.map(item => {
    if (typeof item !== 'string') {
      throw new Error('Invalid account address in response');
    }
    return item;
  });
  return accounts;
};

export const getFirstAccount = async (ethereum: EthereumProvider, method: 'eth_requestAccounts' | 'eth_accounts'): Promise<string | null> => {
  try {
    const accounts = method === 'eth_requestAccounts' 
      ? await requestAccounts(ethereum)
      : await getEthereumAccounts(ethereum);
    return accounts.length > 0 ? accounts[0] : null;
  } catch (error) {
    console.error('Error getting account:', error);
    return null;
  }
}; 