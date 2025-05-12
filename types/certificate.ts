import { ethers } from 'ethers';

export type CertificateStructOutput = {
    student: string;
    institution: string;
    ipfsHash: string;
    issuedAt: bigint;
    isValid: boolean;
} & ethers.Result;

export type CertificateContractType = ethers.Contract & {
    // State Variable Getters
    certificates(certificateId: string): Promise<CertificateStructOutput>;
    identityContract(): Promise<string>;
    studentCertificates(studentAddress: string, index: bigint | number): Promise<string>;
    institutionCertificates(institutionAddress: string, index: bigint | number): Promise<string>;

    // Functions
    getStudentCertificates(student: string): Promise<string[]>;
    getInstitutionCertificates(institution: string): Promise<string[]>;
    issueCertificate(student: string, ipfsHash: string): Promise<ethers.ContractTransactionResponse>;
    revokeCertificate(certificateId: string): Promise<ethers.ContractTransactionResponse>;
    verifyCertificate(certificateId: string): Promise<[string, string, string, bigint, boolean]>;
};

export interface Certificate {
    id: string;
    title: string;
    description: string;
    studentAddress: string;
    institutionAddress: string;
    ipfsHash: string;
    issueDate: Date;
    isValid: boolean;
    status?: string;
    metadata?: { 
        studentName?: string;
        degree?: string;
        grade?: string;
    };
}

export interface CertificateResult {
  certificateId: string;
  txHash: string;
}