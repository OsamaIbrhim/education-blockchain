import { ethers } from 'ethers';

export type ExamStructOutput = {
    examId: string; // bytes32
    courseId: string; // bytes32
    title: string;
    examDate: bigint; // uint256
    students: string[]; // address[]
    isActive: boolean;
} & ethers.Result;

export type ExamResultStructOutput = {
    score: bigint;
    grade: string;
    notes: string;
    submissionTime: bigint;
} & ethers.Result;

export type ExamStatisticsStructOutput = {
    totalStudents: bigint;
    passRate: bigint;
    averageScore: bigint;
    passingCount: number;
    aCount: number;
    bCount: number;
    cCount: number;
    dCount: number;
    fCount: number;
    mostCommonGrade: string;
} & ethers.Result;

export type ExamStatistics = ExamStatisticsStructOutput;

export type ExamManagementContractType = ethers.Contract & {
    exams(examId: string): Promise<ExamStructOutput>;
    examResults(examId: string, studentAddress: string): Promise<ExamResultStructOutput>;
    identityContract(): Promise<string>;
    academicManagerContract(): Promise<string>;
    institutionExams(institutionAddress: string, index: bigint | number): Promise<string>;
    studentExams(studentAddress: string, index: bigint | number): Promise<string>;
    owner(): Promise<string>;
    paused(): Promise<boolean>;

    createExam(examId: string, courseId: string, title: string, examDate: bigint): Promise<ethers.ContractTransactionResponse>;
    updateExam(examId: string, newTitle: string, newExamDate: bigint, newIsActive: boolean): Promise<ethers.ContractTransactionResponse>;
    deactivateExam(examId: string): Promise<ethers.ContractTransactionResponse>;
    registerStudentsForExam(examId: string, studentAddresses: string[]): Promise<ethers.ContractTransactionResponse>;
    submitResult(examId: string, student: string, score: bigint | number, grade: string, notes: string): Promise<ethers.ContractTransactionResponse>;
    getExamResult(examId: string, student: string): Promise<ExamResultStructOutput>;
    getExamStatistics(examId: string): Promise<ExamStatisticsStructOutput>;
    getUserExams(user: string): Promise<string[]>;
    getExam(examId: string): Promise<ExamStructOutput>;
    pause(): Promise<ethers.ContractTransactionResponse>;
    unpause(): Promise<ethers.ContractTransactionResponse>;
};

// Interface for frontend
export interface NewExam {
    examId: string;
    courseId: string;
    title: string;
    date: number; // timestamp
}

export interface ExamData {
    examId: string;
    courseId: string;
    title: string;
    examDate: number; // timestamp
    students: string[];
    isActive: boolean;
}

export interface ExamResult {
    studentAddress: string;
    examId: string;
    score: number;
    grade: string;
    notes: string;
    submissionTime: number;
}