import { ethers } from 'ethers';
import { getConfig } from '../utils/config';
import { getSigner } from "utils/web3Provider";
import { StudentAcademicManagerABI } from 'constants/abis';

type studentAcademicManagerContractType = ethers.Contract;

/**
 * @param signer 
 * @returns 
*/
export const getStudentAcademicManagerContract = async (signer?: ethers.Signer) => {
  const contractSigner = signer || await getSigner();
  const contractAddress = process.env.NEXT_PUBLIC_IDENTITY_CONTRACT_ADDRESS?.toString() || getConfig('IDENTITY_CONTRACT_ADDRESS');
  if (!contractAddress) {
    throw new Error('Contract address not found');
  }
  const contract = new ethers.Contract(contractAddress, StudentAcademicManagerABI, contractSigner) as unknown as studentAcademicManagerContractType;
  return contract as studentAcademicManagerContractType;
};

/**
 * Initializes the academic record for a new student by starting their first semester.
 * Should be called after successful student registration.
 * @param studentAddress
 */
export const initializeStudentAcademicRecord = async (studentAddress: string) => {
  try {
    const signer = await getSigner();

    const academicManager = await getStudentAcademicManagerContract(signer);

    const startDate = Math.floor(Date.now() / 1000);
    const endDate = startDate + 120 * 24 * 60 * 60;

    const tx = await academicManager.startNewSemester(studentAddress, startDate, endDate);
    await tx.wait();
    return { status: 'success' };
  } catch (error: any) {
    console.error('Error initializing academic record:', error);
    throw error;
  }
};