import { ethers } from 'ethers';
import { getConfig } from '../utils/config';
import { ExamManagementABI } from '../constants/abis';
import { getSigner } from 'utils/ethersConfig';
import { getUserData } from './identity';
import { getFromIPFS, uploadToIPFS } from 'utils/ipfsUtils';
import { Exam, ExamManagementContractType, ExamStructOutput, NewExam } from 'types/examManagement';

/**
 * @param signer 
 * @returns 
*/
export const getExamManagementContract = async (signer?: ethers.Signer) => {
    const contractSigner = signer || await getSigner();
    const contractAddress = process.env.NEXT_PUBLIC_EXAM_MANAGEMENT_CONTRACT_ADDRESS?.toString() || getConfig('EXAM_MANAGEMENT_CONTRACT_ADDRESS');
    if (!contractAddress) {
        throw new Error('Contract address not found');
    }
    const contract = new ethers.Contract(contractAddress, ExamManagementABI, contractSigner);
    return contract as ExamManagementContractType;
};


export const checkInstitutionStatus = async () => {
    try {
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

/**
 * @param exam 
 * @returns 
 */
export const createExam = async (exam: NewExam) => {
    try {
        const contract = await getExamManagementContract();
        const signer = await getSigner();
        const address = await signer.getAddress();

        // Prepare exam data
        const examData = {
            title: exam.title,
            description: exam.description,
            date: exam.date,
            duration: exam.duration,
            institutionAddress: address,
        };

        // Upload exam data to IPFS and get the hash
        const examDataHash = await uploadToIPFS(examData, 'examData.json');


        exam.ipfsHash = examDataHash;
        const dateInSeconds = Math.floor(Number(exam.date) / 1000);
        const duration = Number(exam.duration);

        const tx = await contract.createExam(
            exam.title,
            exam.description,
            dateInSeconds,
            duration,
            exam.ipfsHash
        );
        await tx.wait();

        if (!tx) {
            throw new Error('Transaction failed');
        }

        return exam;
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

/**
 * @param exam 
 * @param student 
 * @returns 
 */
export const registerStudentForExam = async (exam: string, student: string, institutionAddress: string | null) => {
    if (!ethers.isBytesLike(exam) || ethers.getBytes(exam).length !== 32) {
        throw new Error(`Invalid exam ID format: ${exam}. Expected bytes32.`);
    }
    if (!ethers.isAddress(student)) {
        throw new Error(`Invalid student address format${student}.`);
    }

    try {
        if (!window.ethereum) {
            throw new Error('No ethereum provider found');
        }
        const signer = await getSigner();
        const address = await signer.getAddress();
        const emContract = await getExamManagementContract(signer);

        // check if the student is already added in the institution
        if (!institutionAddress) {
            institutionAddress = address;
        }
        if (!ethers.isAddress(institutionAddress)) {
            throw new Error(`Invalid institution address format: ${institutionAddress}.`);
        }
        const isStudentInInstitution = await emContract.institutionStudents(institutionAddress, student);

        if (!isStudentInInstitution) {
            // add the student to the institution
            
        }

        // check if the student is already registered for the exam
        const studentExams = await emContract.getStudentExamList(student);
        if (studentExams.includes(exam)) {
            throw new Error(`Student ${student} is already registered for the exam ${exam}.`);
        }
        // check if the exam is already started --- will be add

        const tx = await emContract.registerStudentsForExam(exam, [student]);
        await tx.wait();
        return true;
    } catch (error) {
        console.error('Error enrolling student:', error);
        throw error;
    }
};

/**
 * @param institutionAddress 
 * @returns 
 */
export const getInstitutionExams = async (institutionAddress: string) => {
    try {
        const signer = await getSigner();
        const emContract = await getExamManagementContract(signer) as unknown as ExamManagementContractType;

        const examAddresses = await emContract.getInstitutionExamList(institutionAddress);
        // 0x5796d958fd1e8becef17daf225a1bfa7a312fd139f1c85cb9990c5b153eb575e
        const exams: Exam[] = [];

        for (const examAddress of examAddresses) {
            try {
                const exam = await getExam(examAddress);
                if (!exam) {
                    console.warn(`Exam data for address ${examAddress} is null.`);
                    continue;
                }
                const examData = await getFromIPFS(exam.ipfsHash);
                exams.push({
                    ...exam,
                    ...examData,
                    address: examAddress,
                });
            } catch (error) {
                console.error(`Error fetching exam with ID ${examAddress}:`, error);
            }
        }

        return exams;
    } catch (error: any) {
        console.error('Error getting institution exams:', error);
        return [];
    }
};

// getInstitutionStudents
/**
 * @param institutionAddress
 * @returns isntitution students
 */
export const getInstitutionStudents = async (institutionAddress: string | null) => {
    try {
        const signer = await getSigner();
        const address = await signer.getAddress();
        const emContract = await getExamManagementContract(signer) as unknown as ExamManagementContractType;

        if (!institutionAddress) {
            institutionAddress = address;
        }
        
        if (!ethers.isAddress(institutionAddress)) {
            throw new Error(`Invalid institution address format: ${institutionAddress}.`);
        }

        const students = await emContract.getInstitutionStudents(institutionAddress);
        return students;
    } catch (error) {
        console.error('Error getting institution students:', error);
        throw error;
    }
}

/**
 * @param examId 
 * @returns 
 */
export const getExam = async (examId: string): Promise<Exam | null> => {
    if (!ethers.isBytesLike(examId) || ethers.getBytes(examId).length !== 32) {
        console.error(`Invalid examId format passed to getExam: ${examId}. Expected bytes32.`);
        return null;
    }

    try {
        if (!window.ethereum) {
            throw new Error('No ethereum provider found');
        }
        const signer = await getSigner();
        const emContract = await getExamManagementContract(signer);

        const examResult: ExamStructOutput = await emContract.getExam(examId);

        const examData: Exam = {
            address: examId,
            title: examResult.title,
            description: examResult.description,
            date: new Date(Number(examResult.date) * 1000),
            duration: Number(examResult.duration),
            ipfsHash: examResult.ipfsHash,
            status: examResult.status,
            students: examResult.students,
            exists: examResult.exists,
        };

        if (!examResult.exists) {
            console.warn(`Exam with ID ${examId} reported as not existing by the contract.`);
            return null;
        }

        return examResult.exists ? examData : null;

    } catch (error) {
        console.error(`Error getting exam ${examId}:`, error);
        if (error instanceof Error && 'error' in error) {
            const nestedError = (error as any).error;
            if (nestedError && nestedError.message) {
                console.error("Nested error details:", nestedError.message);
            } else {
                console.error("Nested error object:", nestedError);
            }
        } else if (error instanceof Error) {
            console.error("Error message:", error.message);
        }
        return null;
    }
};

/**
 * @param examId 
 * @returns 
 */
export const getExamResults = async (examId: string, student: string) => {
    try {
        if (!window.ethereum) {
            throw new Error('No ethereum provider found');
        }
        const signer = await getSigner();
        const emContract = await getExamManagementContract(signer) as unknown as ExamManagementContractType;

        const result = await emContract.getExamResult(examId, student);
        return result;
    } catch (error) {
        console.error('Error getting exam result:', error);
        throw error;
    }
};

/**
 * @param examId 
 * @returns 
 */
export const getStudentExams = async (student: string) => {
    try {
        if (!window.ethereum) {
            throw new Error('No ethereum provider found');
        }
        const signer = await getSigner();
        const emContract = await getExamManagementContract(signer) as unknown as ExamManagementContractType;

        const exams = await emContract.getStudentExams(student);
        return exams;
    } catch (error) {
        console.error('Error getting student exams:', error);
        throw error;
    }
};

/**
 * @param examId 
 * @param student 
 * @param score 
 * @param grade 
 * @param ipfsHash 
 * @returns 
 */
export const submitExamResult = async (
    examId: string,
    student: string,
    score: number,
    grade: string,
    ipfsHash: string
) => {
    try {
        if (!window.ethereum) {
            throw new Error('No ethereum provider found');
        }
        const signer = await getSigner();
        const emContract = await getExamManagementContract(signer) as unknown as ExamManagementContractType;

        const tx = await emContract.submitExamResult(examId, student, score, grade, ipfsHash);
        await tx.wait();
        return true;
    } catch (error) {
        console.error('Error submitting exam result:', error);
        throw error;
    }
};

/**
 * @param examId 
 * @param status 
 * @returns 
 */
export const updateExamStatus = async (examId: string, status: string) => {
    try {
        if (!window.ethereum) {
            throw new Error('No ethereum provider found');
        }
        const signer = await getSigner();
        const emContract = await getExamManagementContract(signer) as unknown as ExamManagementContractType;

        const tx = await emContract.updateExamStatus(examId, status);
        await tx.wait();
        return true;
    } catch (error) {
        console.error('Error updating exam status:', error);
        throw error;
    }
};