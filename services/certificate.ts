import { ethers } from 'ethers';
import { CertificatesABI } from '../constants/abis';
import { getConfig } from '../utils/config';

// Types
interface CertificateResult {
  certificateId: string;
  txHash: string;
}

/**
 * Get the Certificates contract instance
 * @param signer - The signer to use
 * @returns The Certificates contract instance
 */
export const getCertificatesContract = async (signer: ethers.Signer) => {
  const contractAddress = process.env.NEXT_PUBLIC_CERTIFICATES_CONTRACT_ADDRESS || getConfig('CERTIFICATES_CONTRACT_ADDRESS');
  return new ethers.Contract(contractAddress, CertificatesABI, signer);
};

/**
 * Issue a certificate for a student
 * @param studentAddress - The Ethereum address of the student
 * @param ipfsHash - The IPFS hash of the certificate data
 * @returns The certificateId and transaction hash
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

    // Get provider and signer
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    
    // Get contract instance
    const certificatesContract = await getCertificatesContract(signer);
    
    // Issue certificate
    const tx = await certificatesContract.issueCertificate(studentAddress, ipfsHash);
    const receipt = await tx.wait();
    
    // Find the CertificateIssued event to get the certificateId
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
 * Get certificates for a student
 * @param studentAddress - The Ethereum address of the student
 * @returns Array of certificate IDs
 */
export const getStudentCertificates = async (studentAddress: string): Promise<string[]> => {
  try {
    if (!studentAddress || !ethers.isAddress(studentAddress)) {
      throw new Error('Invalid student address');
    }

    if (!window.ethereum) {
      throw new Error('Ethereum provider not found');
    }

    // Get provider
    const provider = new ethers.BrowserProvider(window.ethereum);
    
    // Get contract instance (read-only operations don't need signer)
    const contractAddress = process.env.NEXT_PUBLIC_CERTIFICATES_CONTRACT_ADDRESS || getConfig('CERTIFICATES_CONTRACT_ADDRESS');
    const certificatesContract = new ethers.Contract(contractAddress, CertificatesABI, provider);
    
    // Get certificates
    const certificates = await certificatesContract.getStudentCertificates(studentAddress);
    return certificates;
  } catch (error: any) {
    console.error('Error getting student certificates:', error);
    throw new Error(`Failed to get student certificates: ${error.message || error}`);
  }
};

/**
 * Verify a certificate
 * @param certificateId - The ID of the certificate to verify
 * @returns Certificate details
 */
export const verifyCertificate = async (certificateId: string) => {
  try {
    if (!certificateId || certificateId.trim() === '') {
      throw new Error('Invalid certificate ID');
    }

    if (!window.ethereum) {
      throw new Error('Ethereum provider not found');
    }

    // Get provider
    const provider = new ethers.BrowserProvider(window.ethereum);
    
    // Get contract instance
    const contractAddress = process.env.NEXT_PUBLIC_CERTIFICATES_CONTRACT_ADDRESS || getConfig('CERTIFICATES_CONTRACT_ADDRESS');
    const certificatesContract = new ethers.Contract(contractAddress, CertificatesABI, provider);
    
    // Verify certificate
    const [student, institution, ipfsHash, issuedAt, isValid] = await certificatesContract.verifyCertificate(certificateId);
    
    return {
      student,
      institution,
      ipfsHash,
      issuedAt: new Date(Number(issuedAt) * 1000), // Convert timestamp to Date
      isValid
    };
  } catch (error: any) {
    console.error('Error verifying certificate:', error);
    throw new Error(`Failed to verify certificate: ${error.message || error}`);
  }
};
