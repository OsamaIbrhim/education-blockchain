import { ethers } from 'ethers';

export type ExamStructOutput = {
    title: string;
    description: string;
    date: number;
    duration: number;
    status: string;
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
    averageScore: number;
    passRate: number;
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
    name: string;
    email: string;
    enrollmentDate: bigint;
    status: string;
    exists: boolean;
} & ethers.Result;

export type CertificateStructOutput = {
    student: string;
    issuer: string;
    ipfsHash: string;
    issuedAt: bigint;
    exists: boolean;
} & ethers.Result;


export type ExamManagementContractType = ethers.Contract & {
    certificates(certificateId: string): Promise<CertificateStructOutput>;
    examResults(examId: string, studentAddress: string): Promise<ExamResultStructOutput>;
    exams(examId: string): Promise<ExamStructOutput>;
    identityContract(): Promise<string>;
    institutionExams(institutionAddress: string, index: bigint | number): Promise<string>;
    institutionStudents(institutionAddress: string, studentAddress: string): Promise<boolean>;
    institutions(institutionAddress: string): Promise<InstitutionStructOutput>;
    owner(): Promise<string>; // From Ownable
    paused(): Promise<boolean>; // From Pausable
    students(studentAddress: string): Promise<StudentStructOutput>;
    addStudent(studentAddress: string, name: string, email: string): Promise<ethers.ContractTransactionResponse>;
    createExam(title: string, description: string, date: bigint | number, duration: bigint | number, ipfsHash: string): Promise<ethers.ContractTransactionResponse>;
    getExam(examId: string): Promise<ExamStructOutput>;
    getExamResult(examId: string, student: string): Promise<[bigint, string, string]>;
    getExamStatistics(examId: string): Promise<ExamStatisticsStructOutput>;
    getInstitution(institution: string): Promise<[string, string, string, string, string, string, string, string, string, string, boolean]>;
    getInstitutionExamList(institution: string): Promise<string[]>;
    getStudent(student: string): Promise<[string, string, bigint, string]>;
    issueCertificate(student: string, ipfsHash: string): Promise<ethers.ContractTransactionResponse>;
    registerInstitution(name: string, description: string, physicalAddress: string, email: string, phone: string, website: string, logo: string, ministry: string, university: string, college: string): Promise<ethers.ContractTransactionResponse>;
    registerStudentsForExam(examId: string, studentAddresses: string[]): Promise<ethers.ContractTransactionResponse>;
    submitResult(examId: string, student: string, score: bigint | number, grade: string, notes: string): Promise<ethers.ContractTransactionResponse>;
    updateExamStatus(examId: string, newStatus: string): Promise<ethers.ContractTransactionResponse>;
    updateInstitutionProfile(name: string, ministry: string, university: string, college: string, description: string, logo: string, website: string, email: string, phone: string): Promise<ethers.ContractTransactionResponse>;
    updateStudentStatus(studentAddress: string, newStatus: string): Promise<ethers.ContractTransactionResponse>;
    verifyInstitution(institution: string): Promise<ethers.ContractTransactionResponse>;
};

// Interface
export interface Exam {
    address: string; // Exam ID
    title: string;
    description: string;
    date: Date;
    duration: number;
    status: string;
    ipfsHash: string;
    students: string[];
    exists: boolean;
}

export interface ExamResult {
    studentAddress: string;
    score: number;
    grade: string;
    ipfsHash: string;
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
    title: string;
    description: string;
    date: number;
    duration: number;
    ipfsHash: string;
} 