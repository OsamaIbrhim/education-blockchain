import { ethers, getAddress } from 'ethers';
import { CertificatesABI } from '../constants/abis';
import { getConfig } from '../utils/config';
import { getSigner } from 'utils/ethersConfig';
import { Certificate, CertificateContractType, CertificateResult } from '../types/certificate';
import { getFromIPFS } from 'utils/ipfsUtils';

/**
 * @param signer
 * @returns
 */
export const getCertificatesContract = async (signer?: ethers.Signer) => {
  const contractSigner = signer || await getSigner();
  const contractAddress = process.env.NEXT_PUBLIC_CERTIFICATES_CONTRACT_ADDRESS || getConfig('CERTIFICATES_CONTRACT_ADDRESS');
  if (!contractAddress) {
    throw new Error('Contract address not found');
  }
  const contract = new ethers.Contract(contractAddress, CertificatesABI, contractSigner);
  return contract as CertificateContractType;
};

/**
 * @param address
 * @param ipfsHash
 * @returns
 */
export const issueCertificate = async (
  address: string,
  ipfsHash: string
): Promise<boolean> => {
  try {
    if (!address || !ethers.isAddress(address)) {
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

    const tx = await certificatesContract.issueCertificate(address, ipfsHash);
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

    return true;
  } catch (error: any) {
    console.error('Error issuing certificate:', error);
    throw new Error(`Failed to issue certificate: ${error.message || error}`);
  }
};

/**
 * @param address
 * @returns certificateIds
 */
export const getUserCertificates = async (address: string): Promise<any[]> => {
  try {
    if (!address || !ethers.isAddress(address)) {
      throw new Error('Invalid student address');
    }

    if (!window.ethereum) {
      throw new Error('Ethereum provider not found');
    }

    const cContract = await getCertificatesContract();
    const certificatesData: Certificate[] = [];

    const certificates: CertificateResult[] = await cContract.getUserCertificates(address);

    if (!certificates || certificates.length === 0) {
      console.log('No certificates found');
      return [];
    }

    for (const certificate of certificates) {
      const certificateAddress = certificate.certificate;
      const ipfsHash = certificate.ipfsHash;
      const exists = certificate.exist;

      if (!exists) {
        console.log(`Certificate ${certificateAddress} does not exist`);
        continue;
      }

      if (!ipfsHash || ipfsHash.trim() === '') {
        console.log(`Certificate ${certificateAddress} has no IPFS hash`);
        continue;
      }

      const certificateDataFromIPFS = await getCertificateData(ipfsHash);
      if (!certificateDataFromIPFS) {
        console.log(`Certificate ${certificateAddress} has no data`);
        continue;
      }

      certificatesData.push({
        address: certificateAddress,
        title: certificateDataFromIPFS.data.title,
        ipfsHash: ipfsHash,
        isValid: exists,
        issueDate: new Date(certificateDataFromIPFS.timestamp),
        studentAddress: certificateDataFromIPFS.data.studentAddress,
        institutionAddress: certificateDataFromIPFS.data.institutionAddress,
        metadata: { ...certificateDataFromIPFS.data.metadata },
        status: certificateDataFromIPFS.isValid ? 'Valid' : 'Invalid'
      });
    }

    return certificatesData;
  } catch (error: any) {
    console.error('Error getting student certificates:', error);
    throw new Error(`Failed to get student certificates: ${error.message || error}`);
  }
};

/**
 * @param certificateId
 * @returns certificateData
 */
export const getCertificateData = async (certificateIPFS: string): Promise<any> => {
  try {
    if (!certificateIPFS) {
      throw new Error('No certificate IPFS hash provided');
    }

    if (!window.ethereum) {
      throw new Error('Ethereum provider not found');
    }

    const certificateData = await getFromIPFS(certificateIPFS);
    if (!certificateData) {
      throw new Error('No certificate data found');
    }

    return certificateData;
  } catch (error: any) {
    console.error('Error getting certificate data:', error);
    throw new Error(`Failed to get certificate data: ${error.message || error}`);
  }
};

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