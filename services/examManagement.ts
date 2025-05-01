import { ethers } from 'ethers';
import { getConfig } from '../utils/config';
import { ExamManagementABI } from '../constants/abis';
import { getProvider, getSigner } from 'utils/ethersConfig';
import { Exam } from 'types/institution';
import { getUserData } from './identity';
import { getFromIPFS } from 'utils/ipfsUtils';
import { useAccount } from 'wagmi';

type ExamManagementContractType = ethers.Contract & {
    getInstitutionExams(address: string): Promise<string[]>;
    getStudentExams(address: string): Promise<string[]>;
    enrollStudent(examId: string, studentAddress: string): Promise<boolean>;
    getExamStatistics(examId: string): Promise<[number, number, number]>;
    getExamResults(examId: string): Promise<[string[], number[], string[]]>;
    institutions(address: string): Promise<[string, string, string, string, string, string, string, string, string, string, boolean, boolean]>;
    createExam(title: string, description: string, date: bigint, duration: bigint, ipfsHash: string): Promise<any>;
    registerInstitution(
        name: string,
        description: string,
        physicalAddress: string,
        email: string,
        phone: string,
        website: string,
        logo: string,
        ministry: string,
        university: string,
        college: string,
        options?: { gasLimit?: number }
    ): Promise<ethers.ContractTransaction>;
    verifyInstitution(institutionAddress: string): Promise<any>;
    updateInstitutionProfile(
        name: string,
        ministry: string,
        university: string,
        college: string,
        description: string,
        logo: string,
        website: string,
        email: string,
        phone: string
    ): Promise<ethers.ContractTransaction>;
};

/**
 * @param signer 
 * @returns 
*/
export const getExamManagementContract = async (runner?: ethers.Signer | ethers.Provider) => {
    const contractAddress = process.env.NEXT_PUBLIC_EXAM_MANAGEMENT_CONTRACT_ADDRESS?.toString() || getConfig('EXAM_MANAGEMENT_CONTRACT_ADDRESS');
    if (!contractAddress) {
        throw new Error('Contract address not found');
    }
    const runnerInstance = runner || await getProvider();
    const contract = new ethers.Contract(contractAddress, ExamManagementABI, runnerInstance);
    return contract as ExamManagementContractType;
};

// Check if institution exists and is verified
export const checkInstitutionStatus = async () => {
    try {
        const provider = await getProvider();
        const signer = await getSigner();
        const address = await signer.getAddress();
        if (!address) {
            return { exists: false, isVerified: false };
        }
        
        const institution = await getUserData(address);
        
        if (!institution) {
            return { exists: false, isVerified: false };
        }
        
        const isVerified = institution.isVerified;
        
        const institutionData = await getFromIPFS(institution.ipfsHash);
        
        return { exists: true, isVerified: isVerified, institution: institutionData };
    } catch (error) {
        console.error('Error checking institution status:', error);
        return { exists: false, isVerified: false };
    }
};

// create exam
export const createExam = async (exam: Exam) => {
    try {
        const signer = await getSigner();
        const contract = await getExamManagementContract(signer);
        const address = await signer.getAddress();

        let institution = await getInstitution(address);

        const { exists, isVerified, institution: identityInstitution } = await checkInstitutionStatus();
        // if (!institution) {
        //     if (!exists || !isVerified) {
        //         throw new Error("You must be a verified institution to create exams.");
        //     } else{
                await registerInstitution({
                    name: identityInstitution.name,
                    description: identityInstitution.description,
                    physicalAddress: identityInstitution.physicalAddress,
                    email: identityInstitution.email,
                    phone: identityInstitution.phone,
                    website: identityInstitution.website,
                    logo: identityInstitution.logo,
                    ministry: identityInstitution.ministry,
                    university: identityInstitution.university,
                    college: identityInstitution.college,
                });
                institution = await getInstitution(address);

        //         if (!isVerified){
        //             await verifyInstitution(address);
        //         }
        //     }
        // }
        if(isVerified && !institution?.isVerified){
            await verifyInstitution(address);
            institution = await getInstitution(address);
        }

        const dateInSeconds = Math.floor(Number(exam.date) / 1000);
        const duration = Number(exam.duration);
        
        const tx = await contract.createExam(
            exam.title,
            exam.description,
            BigInt(dateInSeconds),
            BigInt(duration),
            ""
        );

        return tx.hash;
    } catch (error: any) {
        console.error('Error creating exam:', error);

        if (error.data) {
            console.error('Error data:', error.data);
        }
        
        // More detailed error handling
        if (error.reason) {
            throw new Error(`Contract error: ${error.reason}`);
        } else if (error.message) {
            throw new Error(`Transaction error: ${error.message}`);
        } else {
            throw error;
        }
    }
};

// get institution
export const getInstitution = async (address: string) => {
    try {
        const provider = await getProvider();
        const contract = await getExamManagementContract(provider) as unknown as ExamManagementContractType;
        const data = await contract.getInstitution(address);
        return {
            name: data[0],
            description: data[1],
            physicalAddress: data[2],
            email: data[3],
            phone: data[4],
            website: data[5],
            logo: data[6],
            ministry: data[7],
            university: data[8],
            college: data[9],
            isVerified: data[10]
        };
    } catch (error: any) {
        console.error('Error getting institution:', error);
        return null;
    }
};

// register institution
export const registerInstitution = async (institutionData: {
    name: string;
    description: string;
    physicalAddress: string;
    email: string;
    phone: string;
    website: string;
    logo: string;
    ministry: string;
    university: string;
    college: string;
}) => {
    try {
        const signer = await getSigner();
        const contract = await getExamManagementContract(signer) as unknown as ExamManagementContractType;

        const tx = await contract.registerInstitution(
            institutionData.name,
            institutionData.description,
            institutionData.physicalAddress,
            institutionData.email,
            institutionData.phone,
            institutionData.website,
            institutionData.logo,
            institutionData.ministry,
            institutionData.university,
            institutionData.college,
        );

        return { success: true, tx };
    } catch (error: any) {
        console.error('Error registering institution:', error);
        return { success: false, error: error.message || error };
    }
};

// Verify institution (must be called by contract owner)
export const verifyInstitution = async (institutionAddress: string) => {
    try {
        const signer = await getSigner();
        const contract = await getExamManagementContract(signer);
        
        console.log('Verifying institution:', institutionAddress);
        
        // Encode function data
        const data = contract.interface.encodeFunctionData("verifyInstitution", [institutionAddress]);
        
        // Create transaction with explicit gas limit
        const tx = await signer.sendTransaction({
            to: await contract.getAddress(),
            data: data,
            gasLimit: 1000000
        });
        
        const receipt = await tx.wait();
        console.log('Institution verified, transaction confirmed:', receipt);
        
        return { 
            success: true, 
            message: 'Institution verified successfully',
            hash: tx.hash
        };
    } catch (error: any) {
        console.error('Error verifying institution:', error);
        
        if (error.data?.reason) {
            return { 
                success: false, 
                message: `Verification failed: ${error.data.reason}` 
            };
        }
        
        return { 
            success: false, 
            message: `Verification failed: ${error.message || 'Unknown error'}` 
        };
    }
};

// update institution profile
export const updateInstitutionProfile = async (profile: {
    name: string;
    ministry: string;
    university: string;
    college: string;
    description: string;
    logo: string;
    website: string;
    email: string;
    phone: string;
}) => {
    try {
        const signer = await getSigner();
        const contract = await getExamManagementContract(signer) as unknown as ExamManagementContractType;
        const tx = await contract.updateInstitutionProfile(
            profile.name,
            profile.ministry,
            profile.university,
            profile.college,
            profile.description,
            profile.logo,
            profile.website,
            profile.email,
            profile.phone
        );
        return { success: true, tx };
    } catch (error: any) {
        console.error('Error updating institution profile:', error);
        return { success: false, error: error.message || error };
    }
};

// get institution exams
export const getInstitutionExams = async (institutionAddress: string) => {
    try {
        const provider = await getProvider();
        const contract = await getExamManagementContract(provider) as unknown as ExamManagementContractType;

        const institution = await getInstitution(institutionAddress);

        if(!institution){
            throw new Error("Institution not found");
        }
        
        const examIds = await contract.getInstitutionExamList(institutionAddress);
        return examIds;
    } catch (error: any) {
        console.error('Error getting institution exams:', error);
        return [];
    }
};
