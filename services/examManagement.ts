import { ethers } from 'ethers';
import { getConfig } from '../utils/config';
import { ExamManagementABI } from '../constants/abis';
import { getSigner } from 'utils/ethersConfig';
import { addStudents, getUserData, getUserRole, isStudentEnrolled } from './identity';
import { getFromIPFS, uploadPdfToIPFS, uploadToIPFS } from 'utils/ipfsUtils';
import { Exam, ExamData, ExamManagementContractType, ExamStructOutput, NewExam } from 'types/examManagement';
import { Toast } from '@chakra-ui/react';


export function toBytes32(value: string): string {
    if (value.startsWith("0x") && value.length === 66) {
        return value;
    }
    // Encode string to UTF-8 bytes
    const encoder = new TextEncoder();
    const bytes = encoder.encode(value);

    if (bytes.length > 32) {
        throw new Error("String is too long, must be <= 32 bytes");
    }

    // Create a 32-byte array and fill with zeros
    const padded = new Uint8Array(32);
    padded.set(bytes);

    // Convert to hex string
    let hex = "0x";
    for (let i = 0; i < padded.length; i++) {
        hex += padded[i].toString(16).padStart(2, "0");
    }
    return hex;
}

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

        const pdfFile = await uploadPdfToIPFS(exam.pdfFile, exam.title || 'exam PDF');

        // Prepare exam data
        const examData = {
            title: exam.title,
            description: exam.description,
            date: exam.date,
            duration: exam.duration,
            institutionAddress: address,
            ipfsHash: null,
            pdfFile: pdfFile,
            students: [],
            status: 'IN_PROGRESS',
            exists: true,
        };

        // Upload exam data to IPFS and get the hash
        const examDataHash = await uploadToIPFS(examData, 'examData.json');


        exam.ipfsHash = examDataHash;
        const dateInSeconds = Math.floor(Number(exam.date) / 1000);
        const duration = Number(exam.duration);

        const tx = await contract.createExam(exam.ipfsHash);
        const receipt = await tx.wait();

        const events = (receipt?.logs || [])
            .map(log => {
                try {
                    return contract.interface.parseLog(log);
                } catch {
                    return null;
                }
            })
            .filter(e => e && e.name === "ExamCreated");

        const examId = (events.length > 0 && events[0] !== null) ? events[0].args.examId : undefined;

        if (!examId) {
            throw new Error('Exam creation failed: ExamCreated event not found');
        }

        exam.address = examId;

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

        const examData = await getExam(exam);
        if (!examData) {
            throw new Error(`Exam with ID ${exam} does not exist.`);
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
                const { status } = await addStudents([studentAddress]);
                if (status !== 'success') {
                    throw new Error(`Failed to add student ${studentAddress} to institution ${institutionAddress}.`);
                }
                continue;
            }

            // check if the student is already registered for the exam
            if (examData.students.includes(studentAddress)) {
                throw new Error(`Student ${studentAddress} is already registered for this exam.`);
            }
        }

        const examIdBytes32 = toBytes32(exam);

        const tx = await emContract.registerStudentsForExam(examIdBytes32, studentAddresses);
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
        const exams: ExamData[] = [];

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
                    students: Array.from(exam.students),
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

        // get exam data from IPFS
        const examDataFromIPFS = await getFromIPFS(examResult.ipfsHash);

        if (!examDataFromIPFS) {
            console.error(`Failed to fetch exam data from IPFS for examId: ${examId}`);
            return null;
        }

        if (!examDataFromIPFS.exists) {
            console.warn(`Exam with ID ${examId} reported as not existing by the contract.`);
            return null;
        }

        const examData: ExamData = {
            address: examId,
            title: examDataFromIPFS.title,
            description: examDataFromIPFS.description,
            date: new Date(Number(examDataFromIPFS.date) * 1000),
            duration: Number(examDataFromIPFS.duration),
            ipfsHash: examResult.ipfsHash,
            status: examDataFromIPFS.status,
            students: Array.from(examResult.students),
            exists: examDataFromIPFS.exists,
        };

        return examData.exists ? examData : null;

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
        const emContract = await getExamManagementContract();

        const tx = await emContract.submitResult(examId, student, score, grade, ipfsHash);
        await tx.wait();
        return true;
    } catch (error) {
        console.error('Error submitting exam result:', error);
        throw error;
    }
};

/**
 * @param address
 * @param exam object
 * @returns 
 */
export const updateExam = async (address: string, exam: any) => {
    try {
        if (!window.ethereum) {
            throw new Error('No ethereum provider found');
        }
        const emContract = await getExamManagementContract();

        const newIPFSHash = await uploadToIPFS({ ...exam }, 'examStatus.json');
        const exist = exam.status === 'COMPLETED' ? false : true;

        const tx = await emContract.updateExam(address, newIPFSHash, exist);
        await tx.wait();
        return true;
    } catch (error) {
        console.error('Error updating exam status:', error);
        throw error;
    }
};