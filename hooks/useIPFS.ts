import { useState } from 'react';
import { uploadToIPFS, setCIDInContract, getFromIPFS, getCIDFromContract } from '../utils/ipfsUtils';
import { ExamManagementABI } from 'constants/abis';
import { ethers } from 'ethers';
import { getConfig } from 'utils/config';
import { getSigner } from 'utils/ethersConfig';
interface TransactionOptions {
  from?: string;
  gas?: number;
  [key: string]: any;
}

interface UploadAndSetCIDResult {
  cid: string;
  receipt: any;
}

interface GetDataFromContractResult {
  cid: string;
  data: any;
}

/**
 * Custom hook for IPFS operations
//  * @param contract - Optional contract instance
 * @returns IPFS operations and state
 */
export const useIPFS = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const contract = process.env.NEXT_PUBLIC_IDENTITY_CONTRACT_ADDRESS;

  /**
   * Upload data to IPFS
   * @param data - Data to upload
   * @param name - Optional name for the file
   * @returns Promise with IPFS CID
   */
  const upload = async (data: any, name?: string): Promise<string> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const cid = await uploadToIPFS(data, name);
      return cid;
    } catch (err: any) {
      setError(err.message || 'Failed to upload to IPFS');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Set CID in smart contract
   * @param cid - IPFS CID to store
   * @param options - Transaction options
   * @returns Promise with transaction receipt
   */
  const setCID = async (cid: string, options: TransactionOptions = {}, userAddress: string): Promise<any> => {
    if (!contract) {
      throw new Error('No contract instance provided to useIPFS hook');
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const receipt = await setCIDInContract(contract, cid, options, userAddress);
      return receipt;
    } catch (err: any) {
      setError(err.message || 'Failed to set CID in contract');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Get data from IPFS
   * @param cid - IPFS CID to retrieve
   * @returns Promise with retrieved data
   */
  const getData = async (cid: string): Promise<any> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await getFromIPFS(cid);
      return data;
    } catch (err: any) {
      setError(err.message || 'Failed to get data from IPFS');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * @param data 
   * @param name - Optional
   * @param options - Transaction options
   * @returns Promise with CID and transaction receipt
   */
  const uploadAndSetCID = async (
    data: any, 
    userAddress: string,
    options: TransactionOptions = {}
  ): Promise<UploadAndSetCIDResult> => {
    if (!contract) {
      throw new Error('No contract instance provided to useIPFS hook');
    }
    if (!userAddress || userAddress === 'unknown-user') {
      throw new Error('No user address provided to useIPFS hook');
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const examManagementAddress = getConfig('EXAM_MANAGEMENT_CONTRACT_ADDRESS');
      const signer = await getSigner();

      // string memory name,
      // string memory description,
      // string memory physicalAddress,
      // string memory email,
      // string memory phone,
      // string memory website,
      // string memory logo,
      // string memory ministry,
      // string memory university,
      // string memory college
      // here register institution in the exam management contract
      const examManagementContract = new ethers.Contract(examManagementAddress, ExamManagementABI, signer);
      await examManagementContract.registerInstitution(
        data.name || "",
        data.description || "",
        data.physicalAddress || "",
        data.email || "",
        data.phone || "",
        data.website || "",
        data.logo || "",
        data.ministry || "",
        data.university || "",
        data.college || ""
      );
      // First upload to IPFS
      const cid = await uploadToIPFS(data, userAddress);
      
      // Then set CID in the contract
      const receipt = await setCIDInContract(contract, cid, options, userAddress);
      
      return { cid, receipt };
    } catch (err: any) {
      setError(err.message || 'Failed to upload and set CID');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Get CID from contract and then fetch the data from IPFS
   * @param address - User address to get data for
   * @returns Promise with CID and data from IPFS
   */
  const getDataFromContract = async (address: string): Promise<GetDataFromContractResult> => {
    if (!contract) {
      throw new Error('No contract instance provided to useIPFS hook');
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // First get CID from contract
      const cid = await getCIDFromContract(contract, address);
      
      if (!cid) {
        throw new Error('No IPFS data found for this address');
      }
      
      // Then fetch data from IPFS
      const data = await getFromIPFS(cid);
      
      return { cid, data };
    } catch (err: any) {
      setError(err.message || 'Failed to get data from contract');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    upload,
    setCID,
    getData,
    uploadAndSetCID,
    getDataFromContract,
    isLoading,
    error
  };
}; 