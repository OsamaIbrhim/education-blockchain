// IPFS utility functions for Pinata integration

import axios from 'axios';
import { EthereumProvider } from 'utilsFront/ethersConfig';

// Add Ethereum window type
declare global {
  interface Window {
    ethereum?: EthereumProvider;
  }
}

// Configuration for Pinata API
const pinataConfig = {
  apiKey: process.env.NEXT_PUBLIC_PINATA_API_KEY,
  apiSecret: process.env.NEXT_PUBLIC_PINATA_SECRET_KEY,
  gateway: process.env.NEXT_PUBLIC_PINATA_GATEWAY || 'https://gateway.pinata.cloud'
};

/**
 * Uploads data to IPFS via Pinata
 * @param data - The data object to be uploaded to IPFS
 * @param name - Optional name for the file
 * @returns Promise with the CID of the uploaded content
 */
export const uploadToIPFS = async (data: any, name = 'education-data'): Promise<string> => {
  try {
    // Convert data to JSON string
    const jsonData = JSON.stringify(data);

    // Create a Blob from the JSON string
    const blob = new Blob([jsonData], { type: 'application/json' });

    // Create FormData and append the file
    const formData = new FormData();
    formData.append('file', blob, `${name}.json`);

    // Add metadata
    const metadata = JSON.stringify({
      name: `${name}`,
      keyvalues: {
        timestamp: Date.now(),
        application: 'education-blockchain'
      }
    });
    formData.append('pinataMetadata', metadata);

    // Set pinning options
    const pinataOptions = JSON.stringify({
      cidVersion: 1,
    });
    formData.append('pinataOptions', pinataOptions);

    // Make request to Pinata API
    const response = await axios.post(
      'https://api.pinata.cloud/pinning/pinFileToIPFS',
      formData,
      {
        headers: {
          'Content-Type': `multipart/form-data;`,
          'pinata_api_key': pinataConfig.apiKey,
          'pinata_secret_api_key': pinataConfig.apiSecret
        }
      }
    );

    // Return the IPFS CID
    return response.data.IpfsHash;
  } catch (error: any) {
    console.error('Error uploading to IPFS:', error);
    throw new Error(`Failed to upload to IPFS: ${error.message}`);
  }
};

interface TransactionOptions {
  from?: string;
  gas?: number;
  [key: string]: any;
}

/**
 * Sets the CID in a smart contract by calling appropriate function
 * @param contractOrAddress - The web3 contract instance or address
 * @param cid - The IPFS CID to store
 * @param options - Transaction options (from, gas, etc.)
 * @returns Promise with transaction receipt
 */
export const setCIDInContract = async (contractOrAddress: any, cid: string, options: TransactionOptions = {}): Promise<any> => {
  try {
    if (!contractOrAddress) {
      throw new Error("Contract is undefined");
    }

    // Get the sender address if not provided
    let fromAddress = options.from;
    if (!fromAddress && window.ethereum) {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      fromAddress = Array.isArray(accounts) ? accounts[0] : '';
    }

    // If contractOrAddress is a string (address), create a contract instance
    let contract = contractOrAddress;
    if (typeof contractOrAddress === 'string') {
      // Import necessary functions
      const { getContracts } = await import('../utils/contracts');
      const { identityContract } = await getContracts();
      contract = identityContract;
    }
    
      // ethers.js format
      const tx = await contract.updateUserIPFS(cid, {
        gasLimit: options.gas || 200000,
        ...options
      });
      await tx.wait();
      return tx;
  } catch (error: any) {
    console.error('Error setting CID in contract:', error);
    throw new Error(`Failed to set CID in contract: ${error.message}`);
  }
};

/**
 * Retrieves data from IPFS using the CID
 * @param cid - The IPFS CID to retrieve
 * @returns Promise with the data retrieved from IPFS
 */
export const getFromIPFS = async (cid: string): Promise<any> => {
  try {
    if (!cid) {
      throw new Error('Invalid CID provided');
    }

    const gatewayUrl = `${pinataConfig.gateway}/ipfs/${cid}`;

    const response = await axios.get(gatewayUrl);

    return response.data;
  } catch (error: any) {
    console.error('Error fetching from IPFS:', error);
    throw new Error(`Failed to fetch from IPFS: ${error.message}`);
  }
};

/**
 * Retrieves CID directly from contract
 * @param contract - The web3 contract instance
 * @param address - User address
 * @returns Promise with the IPFS hash
 */
export const getCIDFromContract = async (contract: any, address: string): Promise<string> => {
  try {
    if (!contract) {
      throw new Error("Contract is undefined");
    }
    
    // Get the user data from the contract - access mapping as a function
    const userData = await contract.getUsers(address);
    
    // Return the IPFS hash from the struct
    return userData.ipfsHash;
  } catch (error: any) {
    console.error('Error getting CID from contract:', error);
    throw new Error(`Failed to get CID from contract: ${error.message}`);
  }
};