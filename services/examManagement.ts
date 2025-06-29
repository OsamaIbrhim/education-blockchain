import { ethers, Log, EventLog } from 'ethers';
import { getConfig } from '../utils/config';
import { ExamManagementABI } from '../constants/abis';
import { getSigner } from 'utils/ethersConfig';
import { ExamData, ExamManagementContractType, ExamResult, NewExam } from 'types/examManagement';

export function toBytes32(value: string): string {
    if (value.startsWith("0x") && value.length === 66) {
        return value;
    }
    const padded = ethers.encodeBytes32String(value);
    return padded;
}


export const getExamManagementContract = async (signer?: ethers.Signer): Promise<ExamManagementContractType> => {
    const contractSigner = signer || await getSigner();
    const contractAddress = process.env.NEXT_PUBLIC_EXAM_MANAGEMENT_CONTRACT_ADDRESS?.toString() || getConfig('EXAM_MANAGEMENT_CONTRACT_ADDRESS');
    if (!contractAddress) {
        throw new Error('ExamManagement contract address not found');
    }
    const contract = new ethers.Contract(contractAddress, ExamManagementABI, contractSigner);
    return contract as ExamManagementContractType;
};

export const createExam = async (exam: NewExam): Promise<string> => {
    try {
        const contract = await getExamManagementContract();
        const examIdBytes32 = toBytes32(exam.examId);
        const courseIdBytes32 = toBytes32(exam.courseId);
        const examDate = BigInt(exam.date);

        const tx = await contract.createExam(examIdBytes32, courseIdBytes32, exam.title, examDate);
        const receipt = await tx.wait();

        const event = receipt?.logs?.find((log: Log | EventLog) => (log as EventLog).eventName === 'ExamCreated') as EventLog | undefined;

        if (!event || !event.args) {
            throw new Error('Exam creation failed: ExamCreated event not found.');
        }
        return ethers.decodeBytes32String(event.args.examId);
    } catch (error: any) {
        console.error('Error creating exam:', error);
        throw new Error(error.reason || error.message || "Unknown error occurred");
    }
};

export const updateExam = async (examId: string, title: string, date: number, isActive: boolean): Promise<void> => {
    try {
        const contract = await getExamManagementContract();
        const examIdBytes32 = toBytes32(examId);
        const examDate = BigInt(date);

        const tx = await contract.updateExam(examIdBytes32, title, examDate, isActive);
        await tx.wait();
    } catch (error: any) {
        console.error(`Error updating exam ${examId}:`, error);
        throw new Error(error.reason || error.message || "Unknown error occurred");
    }
};

export const registerStudentsForExam = async (examId: string, studentAddresses: string[]): Promise<boolean> => {
    try {
        const contract = await getExamManagementContract();
        const examIdBytes32 = toBytes32(examId);

        const tx = await contract.registerStudentsForExam(examIdBytes32, studentAddresses);
        await tx.wait();

        return true;
    } catch (error: any) {
        console.error(`Error registering students for exam ${examId}:`, error);
        throw new Error(error.reason || error.message || "Unknown error occurred");
    }
};

export const submitResult = async (examId: string, student: string, score: number, grade: string, notes: string): Promise<void> => {
    try {
        const contract = await getExamManagementContract();
        const examIdBytes32 = toBytes32(examId);
        const scoreBigInt = BigInt(score);

        const tx = await contract.submitResult(examIdBytes32, student, scoreBigInt, grade, notes);
        await tx.wait();
    } catch (error: any) {
        console.error(`Error submitting result for exam ${examId}:`, error);
        throw new Error(error.reason || error.message || "Unknown error occurred");
    }
};

export const getExam = async (examId: string): Promise<ExamData | null> => {
    try {
        const contract = await getExamManagementContract();
        const examIdBytes32 = toBytes32(examId);
        const exam = await contract.getExam(examIdBytes32);

        if (!exam || !exam.isActive) {
            return null;
        }

        return {
            examId: ethers.decodeBytes32String(exam.examId),
            courseId: ethers.decodeBytes32String(exam.courseId),
            title: exam.title,
            examDate: Number(exam.examDate),
            students: exam.students,
            isActive: exam.isActive,
        };
    } catch (error: any) {
        console.error(`Error fetching exam ${examId}:`, error);
        return null;
    }
};

export const getUserExams = async (userAddress: string): Promise<ExamData[]> => {
    try {
        const contract = await getExamManagementContract();
        const examIds = await contract.getUserExams(userAddress);

        const exams = await Promise.all(
            examIds.map(examId => getExam(ethers.decodeBytes32String(examId)))
        );

        return exams.filter((exam): exam is ExamData => exam !== null);
    } catch (error: any) {
        console.error(`Error fetching exams for user ${userAddress}:`, error);
        return [];
    }
};

export const getExamResult = async (examId: string, studentAddress: string): Promise<ExamResult | null> => {
    try {
        const contract = await getExamManagementContract();
        const examIdBytes32 = toBytes32(examId);
        const result = await contract.getExamResult(examIdBytes32, studentAddress);

        if (result.submissionTime === BigInt(0)) {
            return null;
        }

        return {
            studentAddress,
            examId,
            score: Number(result.score),
            grade: result.grade,
            notes: result.notes,
            submissionTime: Number(result.submissionTime),
        };
    } catch (error: any) {
        console.error(`Error fetching exam result for student ${studentAddress} in exam ${examId}:`, error);
        return null;
    }
};

export const deactivateExam = async (examId: string): Promise<void> => {
    try {
        const contract = await getExamManagementContract();
        const examIdBytes32 = toBytes32(examId);
        const tx = await contract.deactivateExam(examIdBytes32);
        await tx.wait();
    } catch (error: any) {
        console.error(`Error deactivating exam ${examId}:`, error);
        throw new Error(error.reason || error.message || "Unknown error occurred");
    }
};