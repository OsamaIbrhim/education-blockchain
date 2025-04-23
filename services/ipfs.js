import axios from 'axios';
import { IdentityABI } from '../constants/abi.js';
const PINATA_API_KEY = "8f624b421db6e7033530";
const PINATA_SECRET_KEY = "b3e32ce1950961a4656712e1409df05df4e9eb98f768fb0dba564304c7f9527c";
const PINATA_BASE_URL = "https://api.pinata.cloud";
const NEXT_PUBLIC_PINATA_GATEWAY = process.env.NEXT_PUBLIC_PINATA_GATEWAY;

export const uploadToIPFS = async (file) => {
    try {
        const formData = new FormData();
        formData.append('file', file);

        const response = await axios.post(`${PINATA_BASE_URL}/pinning/pinFileToIPFS`, formData, {
            headers: {
                'Content-Type': `multipart/form-data;`,
                pinata_api_key: PINATA_API_KEY,
                pinata_secret_api_key: PINATA_SECRET_KEY
            }
        });

        const ipfsHash = response.data.IpfsHash;
        const url = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;
        
        return { hash: ipfsHash, url };
    } catch (error) {
        console.error('Error uploading to Pinata:', error);
        throw new Error('Failed to upload to IPFS via Pinata');
    }
};

export const uploadJSONToIPFS = async (jsonData) => {
    try {
        const response = await axios.post(`${PINATA_BASE_URL}/pinning/pinJSONToIPFS`, jsonData, {
            headers: {
                'Content-Type': 'application/json',
                pinata_api_key: PINATA_API_KEY,
                pinata_secret_api_key: PINATA_SECRET_KEY
            }
        });

        const ipfsHash = response.data.IpfsHash;
        const url = `https://${NEXT_PUBLIC_PINATA_GATEWAY}/ipfs/${ipfsHash}`;
        
        return { hash: ipfsHash, url };
    } catch (error) {
        console.error('Error uploading JSON to Pinata:', error);
        throw new Error('Failed to upload JSON to IPFS via Pinata');
    }
};

export const getFromIPFS = async (hash) => {
    try {
        const response = await axios.get(`https://${NEXT_PUBLIC_PINATA_GATEWAY}/ipfs/${hash}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching from IPFS:', error);
        throw new Error('Failed to fetch from IPFS');
    }
};

// Utility function to check if a file exists on IPFS
export const checkIPFSFile = async (hash) => {
    try {
        const response = await axios.get(`${PINATA_BASE_URL}/pinning/pinJobs`, {
            headers: {
                pinata_api_key: PINATA_API_KEY,
                pinata_secret_api_key: PINATA_SECRET_KEY
            },
            params: {
                ipfs_pin_hash: hash
            }
        });
        return response.data.rows.length > 0;
    } catch (error) {
        console.error('Error checking IPFS file:', error);
        return false;
    }
};

// Function to unpin a file from Pinata
export const unpinFromIPFS = async (hash) => {
    try {
        await axios.delete(`${PINATA_BASE_URL}/pinning/unpin/${hash}`, {
            headers: {
                pinata_api_key: PINATA_API_KEY,
                pinata_secret_api_key: PINATA_SECRET_KEY
            }
        });
        return true;
    } catch (error) {
        console.error('Error unpinning from IPFS:', error);
        return false;
    }
};

// export const updateUserIPFS = async (ipfsHash) => {
//     if (!ipfsHash) {
//         throw new Error('IPFS hash is required');
//     }

//     try {
//         const { identityContract } = await getContracts();
//         console.log('Identity Contract:', identityContract);

//         // Listen for the IPFSHashUpdated event
//         identityContract.on('IPFSHashUpdated', (user, updatedIpfsHash) => {
//             console.log(`IPFS hash updated for user ${user}: ${updatedIpfsHash}`);
//         });

//         const tx = await identityContract.updateUserIPFS(ipfsHash, { gasLimit: 500000 });
//         console.log('Transaction Response:', tx);
//         await tx.wait();
//         console.log('IPFS hash updated successfully:', ipfsHash);

//         // Remove the event listener after the transaction is complete
//         identityContract.removeAllListeners('IPFSHashUpdated');

//         return true;
//     } catch (error) {
//         console.error('Error updating IPFS hash:', error);
//         throw new Error('Failed to update IPFS hash in the contract');
//     }
// };

// const handleSaveToIPFSAndContract = async (file) => {
//   try {
//     // Upload file to Pinata
//     const { hash: ipfsHash } = await uploadToIPFS(file);
//     console.log('File uploaded to IPFS with hash:', ipfsHash);

//     // Save CID to the Identity contract
//     await updateUserIPFS(ipfsHash);
//     toast({
//       title: 'Success',
//       description: 'IPFS hash saved to the contract successfully',
//       status: 'success',
//       duration: 3000,
//       isClosable: true,
//     });
//   } catch (error) {
//     console.error('Error saving to IPFS and contract:', error);
//     toast({
//       title: 'Error',
//       description: error.message || 'Failed to save IPFS hash to the contract',
//       status: 'error',
//       duration: 3000,
//       isClosable: true,
//     });
//   }
// };