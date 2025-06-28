import { ethers } from 'ethers';

export type ExamStructOutput = {
    ipfsHash: string;
    students: string[];
    exists: boolean;
} & ethers.Result; // Include ethers.Result for array-like access if needed

export type ExamResultStructOutput = {
    score: number;
    grade: string;
    ipfsHash: string;
    exists: boolean;
} & ethers.Result;

export type ExamStatisticsStructOutput = {
    totalStudents: number;
    passRate: number;
    averageScore: number;
} & ethers.Result;

export type InstitutionStructOutput = {
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
    isVerified: boolean;
    exists: boolean;
} & ethers.Result;

export type StudentStructOutput = {
    userAddress: string;
    ipfsHash: string;
    role: number;
    isVerified: boolean;
} & ethers.Result;

export type CertificateStructOutput = {
    student: string;
    issuer: string;
    ipfsHash: string;
    issuedAt: bigint;
    isValid: boolean;
} & ethers.Result;


export type ExamManagementContractType = ethers.Contract & {
    certificates(certificateId: string): Promise<CertificateStructOutput>;
    examResults(examId: string, studentAddress: string): Promise<ExamResultStructOutput>;
    exams(examId: string): Promise<ExamStructOutput>;
    identityContract(): Promise<string>;
    institutionExams(institutionAddress: string, index: bigint | number): Promise<string>;
    owner(): Promise<string>; // From Ownable
    paused(): Promise<boolean>; // From Pausable
    studentExams(studentAddress: string, index: bigint | number): Promise<string>;
    addStudent(studentAddress: string, name: string, email: string): Promise<ethers.ContractTransactionResponse>;
    createExam(ipfsHash: string): Promise<ethers.ContractTransactionResponse>;
    getExam(examId: string): Promise<ExamStructOutput>;
    getExamResult(examId: string, student: string): Promise<ExamResultStructOutput>;
    getExamStatistics(examId: string): Promise<ExamStatisticsStructOutput>;
    getInstitutionExamList(institution: string): Promise<string[]>;
    getUserExams(user: string): Promise<string[]>;
    isStudentEnrolled(institution: string, student: string): Promise<boolean>;
    registerStudentsForExam(examId: string, studentAddresses: string[]): Promise<ethers.ContractTransactionResponse>;
    submitResult(examId: string, student: string, score: bigint | number, grade: string, notes: string): Promise<ethers.ContractTransactionResponse>;
    updateExam(examId: string, newIpfsHash: string, newExists: boolean): Promise<ethers.ContractTransactionResponse>;
    verifyInstitution(institution: string): Promise<ethers.ContractTransactionResponse>;
};

// Interface
export interface Exam {
    address: string; // Exam ID
    ipfsHash: string;
    students: string[];
    exists: boolean;
}

export interface ExamData {
    address: string;
    title: string;
    description: string;
    date: Date;
    duration: number;
    ipfsHash: string;
    students: string[];
    exists: boolean;
    status: 'COMPLETED' | 'IN_PROGRESS' | 'UPCOMING';
}

export interface ExamResult {
    studentAddress: string;
    score: number;
    grade: string;
    ipfsHash: string;
    notes: string;
    exists: boolean;
}

export interface ExamStatistics {
    totalStudents: number;
    passingCount: number;
    aCount: number;
    bCount: number;
    cCount: number;
    dCount: number;
    fCount: number;
    averageScore: number;
    passRate: number;
    mostCommonGrade: string;
}

export interface NewExam {
    address: string;
    title: string;
    description: string;
    date: number;
    duration: number;
    ipfsHash: string;
    pdfFile: any;
} 