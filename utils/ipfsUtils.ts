import axios from 'axios';
import { EthereumProvider } from 'utilsFront/ethersConfig';
import { IdentityABI } from '../constants/abis';
import { ethers } from 'ethers';
declare global {
  interface Window {
    ethereum?: EthereumProvider;
  }
}

const pinataConfig = {
  apiKey: process.env.NEXT_PUBLIC_PINATA_API_KEY,
  apiSecret: process.env.NEXT_PUBLIC_PINATA_SECRET_KEY,
  gateway: process.env.NEXT_PUBLIC_PINATA_GATEWAY || 'https://gateway.pinata.cloud'
};

/**
 * @param data
 * @param name - Optional
 * @returns Promise with the CID
 */
export const uploadToIPFS = async (data: any, name = 'education-data'): Promise<string> => {
  try {
    const jsonData = JSON.stringify(data);

    const blob = new Blob([jsonData], { type: 'application/json' });

    const formData = new FormData();
    formData.append('file', blob, `${name}.json`);

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
export const setCIDInContract = async (contractOrAddress: any, cid: string, options: TransactionOptions = {}, userAddress?: string): Promise<any> => {
  try {
    if (!contractOrAddress) {
      throw new Error("Contract is undefined");
    }

    if (!cid || cid.trim() === '') {
      throw new Error("Cannot save empty IPFS hash");
    }

    if (typeof cid !== 'string') {
      throw new Error("CID must be a string");
    }

    const validCidPattern = /^(Qm[1-9A-Za-z]{44}|bafy[a-zA-Z0-9]{55})$/;
    if (!validCidPattern.test(cid) && !cid.startsWith('bafk')) {
      console.warn("Warning: CID format doesn't match expected pattern for IPFS hash");
    }

    // Check if we're running on the client-side
    if (typeof window !== 'undefined' && window.ethereum) {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const signerAddress = await signer.getAddress();

      let identityContract;
      let contractAddress = "";

      if (typeof contractOrAddress === 'string') {
        contractAddress = contractOrAddress;
        identityContract = new ethers.Contract(contractAddress, IdentityABI, signer);
      } else {
        identityContract = contractOrAddress.connect(signer);
        contractAddress = identityContract.target;
      }

      if (!identityContract || !identityContract.updateUserIPFS) {
        throw new Error("Contract not initialized correctly or updateUserIPFS function not found");
      }

      try {
        const userRole = await identityContract.getUserRole(signerAddress);

        if (userRole === 0) {
          throw new Error("User is not registered in the contract. Please register first.");
        }
      } catch (roleError) {
        throw new Error("Failed to verify user registration status");
      }

      const txOptions = {
        gasLimit: options.gas || 300000,
        ...options
      };

      let receipt = null;
      let attempts = 0;
      const maxAttempts = 3;

      while (attempts < maxAttempts && !receipt) {
        try {
          attempts++;

          const tx = await identityContract.updateUserIPFS(cid, txOptions);

          receipt = await tx.wait();

          if (!receipt || !receipt.status) {
            console.warn(`Transaction failed or status unknown. Status: ${receipt?.status}`);
            receipt = null;

            if (attempts < maxAttempts) {
              await new Promise(resolve => setTimeout(resolve, 2000));
            }
          }
        } catch (txError) {
          console.error(`Transaction attempt ${attempts} failed:`, txError);

          if (attempts >= maxAttempts) {
            throw new Error(`Failed to update IPFS hash after ${maxAttempts} attempts: ${txError instanceof Error ? txError.message : String(txError)}`);
          }

          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }

      if (!receipt) {
        throw new Error(`Failed to update IPFS hash after ${maxAttempts} attempts`);
      }

      const identityABI = (await import('../constants/abis')).IdentityABI;
      const iface = new ethers.Interface(identityABI);
      let ipfsHashUpdateFound = false;

      for (let i = 0; i < receipt.logs.length; i++) {
        const log = receipt.logs[i];
        try {
          const parsed = iface.parseLog(log);
          if (parsed) {
            if (parsed.name === "IPFSHashUpdated") {
              ipfsHashUpdateFound = true;

              if (parsed.args[0].toLowerCase() === signerAddress.toLowerCase() &&
                parsed.args[1] === cid) {
              } else {
                console.warn("⚠️ Event parameters don't match what we sent!");
              }
            }
          } else {
            console.log(`Log ${i} could not be parsed as a known event`);
          }
        } catch (err) {
          console.log(`Could not parse log ${i}:`, err);
        }
      }

      if (!ipfsHashUpdateFound) {
        console.warn("⚠️ IPFSHashUpdated event not found in transaction logs!");
      }

      await new Promise(resolve => setTimeout(resolve, 5000));

      let verificationAttempts = 0;
      const maxVerificationAttempts = 3;
      let verificationSuccess = false;

      while (verificationAttempts < maxVerificationAttempts && !verificationSuccess) {
        try {
          verificationAttempts++;

          const updatedUserData = await identityContract.users(signerAddress);

          if (updatedUserData && updatedUserData[1] === cid) {
            verificationSuccess = true;
          } else {
            console.warn(`⚠️ IPFS hash in storage (${updatedUserData[1] || 'empty'}) doesn't match what we sent (${cid})!`);

            if (verificationAttempts < maxVerificationAttempts) {
              await new Promise(resolve => setTimeout(resolve, 2000));
            }
          }
        } catch (verifyError) {
          console.error(`Verification attempt ${verificationAttempts} failed:`, verifyError);

          if (verificationAttempts < maxVerificationAttempts) {
            await new Promise(resolve => setTimeout(resolve, 2000));
          }
        }
      }

      if (!verificationSuccess) {
        console.warn("⚠️ IPFS hash is still not correctly saved after multiple verification attempts!");

        if (!ipfsHashUpdateFound || !verificationSuccess) {

          try {
            const freshProvider = new ethers.BrowserProvider(window.ethereum);
            const freshSigner = await freshProvider.getSigner();
            const identityABI = (await import('../constants/abis')).IdentityABI;
            const freshContract = new ethers.Contract(contractAddress, identityABI, freshSigner);

            const finalTx = await freshContract.updateUserIPFS(cid, {
              gasLimit: 500000,
              gasPrice: await freshProvider.getFeeData().then(data => data.gasPrice)
            });

            const finalReceipt = await finalTx.wait();

            await new Promise(resolve => setTimeout(resolve, 3000));
            const finalCheck = await freshContract.users(signerAddress);

            if (finalCheck && finalCheck[1] === cid) {
              verificationSuccess = true;
              receipt = finalReceipt;
            }
          } catch (finalError) {
            console.error("Final update attempt failed:", finalError);
          }
        }
      }

      return receipt;
    } else {
      // Handle the case where window.ethereum is not available (server-side)
      throw new Error("Ethereum provider is not available on the server-side.");
    }
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

    // const gatewayUrl = `${pinataConfig.gateway}/ipfs/${cid}`;
    const gatewayUrl = `https://ipfs.io/ipfs/${cid}`;
    const response = await axios.get(gatewayUrl, { responseType: 'json' }); // add responseType based on your expectation

    if (response.status !== 200) {
      throw new Error('Failed to fetch from IPFS');
    }

    return response.data;
  } catch (error: any) {
    console.error('Error fetching from IPFS:', error);
    throw new Error(`Failed to fetch from IPFS: ${error.message}`);
  }
};

/**
 * @param cid - The IPFS CID
 * @returns The direct URL to access the file via public gateway
 */
export const getImageUrlFromIPFS = (cid: string): string => {
  if (!cid) {
    throw new Error('Invalid CID provided');
  }

  const gatewayUrl = `${pinataConfig.gateway}/ipfs/${cid}`;
  return gatewayUrl;
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