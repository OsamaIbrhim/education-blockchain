import { ethers } from 'ethers';
import { getConfig } from '../utils/config';
import { ExamManagementABI } from '../constants/abis';
import { getSigner } from 'utils/ethersConfig';
import { addStudents, getUserData, getUserRole, isStudentEnrolled } from './identity';
import { getFromIPFS, uploadToIPFS } from 'utils/ipfsUtils';
import { Exam, ExamManagementContractType, ExamStructOutput, NewExam } from 'types/examManagement';
import { Toast } from '@chakra-ui/react';

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
        Toast({
            title: 'Error creating exam:',
            description: error.message || error,
            status: 'error',
            duration: 3000,
            isClosable: true,
        });
        throw error;
    }
};

/**
 * @param exam
 * @param studentAddresses
 * @param institutionAddress
 * @returns
 */
export const registerStudentsForExam = async (exam: string, studentAddresses: string[], institutionAddress: string | null) => {
    if (!ethers.isBytesLike(exam) || ethers.getBytes(exam).length !== 32) {
        throw new Error(`Invalid exam ID format: ${exam}. Expected bytes32.`);
    }

    if (!Array.isArray(studentAddresses) || studentAddresses.length === 0) {
        throw new Error(`Invalid student addresses format: Expected non-empty array of addresses.`);
    }

    for (const studentAddress of studentAddresses) {
        if (!ethers.isAddress(studentAddress)) {
            throw new Error(`Invalid student address format: ${studentAddress}.`);
        }
    }

    try {
        if (!window.ethereum) {
            throw new Error('No ethereum provider found');
        }
        const signer = await getSigner();
        const address = await signer.getAddress();
        const emContract = await getExamManagementContract(signer);

        // check if the institution address is valid
        if (!institutionAddress) {
            institutionAddress = address;
        }
        if (!ethers.isAddress(institutionAddress)) {
            throw new Error(`Invalid institution address format: ${institutionAddress}.`);
        }

        // Validate each student address
        for (const studentAddress of studentAddresses) {
            // check if the user is student
            const role = await getUserRole(studentAddress);
            if (role !== 'student') {
                throw new Error(`User ${studentAddress} is not a student.`);
            }

            // check if the student is already added in the institution
            const isStudentInInstitution = await isStudentEnrolled(institutionAddress, studentAddress);
            if (!isStudentInInstitution) {
                // add the student to the institution if not already added
                const  { status } = await addStudents([studentAddress]);
                if (status !== 'success') {
                    throw new Error(`Failed to add student ${studentAddress} to institution ${institutionAddress}.`);
                }
                continue;
            }

            // check if the student is already registered for the exam
            const examData = await emContract.getExam(exam);
            if (examData.students.includes(studentAddress)) {
                throw new Error(`Student ${studentAddress} is already registered for this exam.`);
            }
        }

        const tx = await emContract.registerStudentsForExam(exam, studentAddresses);
        await tx.wait();
        return true;
    } catch (error: any) {
        Toast({
            title: 'Error enrolling students:',
            description: error.message || error,
            status: 'error',
            duration: 3000,
            isClosable: true,
        });
        throw error;
    }
};

/**
 * @param address 
 * @returns 
 */
export const getUserExams = async (address: string) => {
    try {
        const signer = await getSigner();
        const emContract = await getExamManagementContract(signer) as unknown as ExamManagementContractType;

        const examAddresses = await emContract.getUserExams(address);
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