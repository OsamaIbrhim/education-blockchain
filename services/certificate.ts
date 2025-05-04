import { ethers, getAddress } from 'ethers';
import { CertificatesABI } from '../constants/abis';
import { getConfig } from '../utils/config';
import { getSigner } from 'utils/ethersConfig';
import { CertificateContractType, CertificateResult } from '../types/certificate';

/**
 * @param signer
 * @returns
 */
export const getCertificatesContract = async (signer: ethers.Signer) => {
  const contractSigner = signer || await getSigner();
  const contractAddress = process.env.NEXT_PUBLIC_CERTIFICATES_CONTRACT_ADDRESS || getConfig('CERTIFICATES_CONTRACT_ADDRESS');
  if (!contractAddress) {
    throw new Error('Contract address not found');
}
const contract = new ethers.Contract(contractAddress, CertificatesABI, contractSigner);
return contract as CertificateContractType;
};

/**
 * @param studentAddress
 * @param ipfsHash
 * @returns
 */
export const issueCertificate = async (
  studentAddress: string,
  ipfsHash: string
): Promise<CertificateResult> => {
  try {
    if (!studentAddress || !ethers.isAddress(studentAddress)) {
      throw new Error('Invalid student address');
    }

    if (!ipfsHash || ipfsHash.trim() === '') {
      throw new Error('Invalid IPFS hash');
    }

    if (!window.ethereum) {
      throw new Error('Ethereum provider not found. Please make sure you have MetaMask or another Web3 provider installed.');
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    
    const certificatesContract = await getCertificatesContract(signer);
    
    const tx = await certificatesContract.issueCertificate(studentAddress, ipfsHash);
    const receipt = await tx.wait();
    
    if (!receipt) {
      throw new Error('Transaction receipt is null');
    }

    const certificateIssuedEvent = receipt.logs
      .filter((log: any) => log.topics[0] === ethers.id("CertificateIssued(bytes32,address,address)"))
      .map((log: any) => {
        const certificateId = log.topics[1];
        return certificateId;
      })[0];
    
    return {
      certificateId: certificateIssuedEvent,
      txHash: receipt.hash
    };
  } catch (error: any) {
    console.error('Error issuing certificate:', error);
    throw new Error(`Failed to issue certificate: ${error.message || error}`);
  }
};

/**
 * @param studentAddress
 * @returns
 */
export const getStudentCertificates = async (studentAddress: string): Promise<string[]> => {
  try {
    if (!studentAddress || !ethers.isAddress(studentAddress)) {
      throw new Error('Invalid student address');
    }

    if (!window.ethereum) {
      throw new Error('Ethereum provider not found');
    }

    const signer = await getSigner();
    const certificatesContract = await getCertificatesContract(signer);
    
    const certificates = await certificatesContract.getStudentCertificates(studentAddress);
    return certificates;
  } catch (error: any) {
    console.error('Error getting student certificates:', error);
    throw new Error(`Failed to get student certificates: ${error.message || error}`);
  }
};

/**
 * @param certificateId 
 * @returns Certificate details
 */
// export const getStudentCertificates = async (address: string) => {
//   if (!address || !getAddress(address)) {
//     throw new Error('Invalid address');
//   }

//   try {
//     const signer = await getSigner();
//     const certificatesContract = await getCertificatesContract(signer);

//     const certificateIds = await certificatesContract.getStudentCertificates(address);

//     if (!certificateIds || certificateIds.length === 0) {
//       console.log('No certificates found');
//       return [];
//     }

//     const certificates = await Promise.all(
//       certificateIds.map(async (id: string) => {
//         const cert = await certificatesContract.verifyCertificate(id);
//         return {
//           id,
//           ipfsHash: cert.ipfsHash,
//           issuer: cert.institution,
//           timestamp: cert.issuedAt.toString(),
//           isValid: cert.isValid
//         };
//       })
//     );

//     return certificates;
//   } catch (error: any) {
//     console.error('Error in getCertificates:', error);
//     if (error.reason) {
//       throw new Error(`Contract error: ${error.reason}`);
//     }
//     throw error;
//   }
// };

/**
 * @param certificateId
 * @returns
 */
export const verifyCertificate = async (certificateId: string) => {
  try {
    if (!certificateId || certificateId.trim() === '') {
      throw new Error('Invalid certificate ID');
    }

    if (!window.ethereum) {
      throw new Error('Ethereum provider not found');
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const certificatesContract = await getCertificatesContract(signer);
    
    const [student, institution, ipfsHash, issuedAt, isValid] = await certificatesContract.verifyCertificate(certificateId);
    
    return {
      student,
      institution,
      ipfsHash,
      issuedAt: new Date(Number(issuedAt) * 1000),
      isValid
    };
  } catch (error: any) {
    console.error('Error verifying certificate:', error);
    throw new Error(`Failed to verify certificate: ${error.message || error}`);
  }
};
