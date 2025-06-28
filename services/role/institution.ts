import { getIdentityContract } from '../identity';
import { getCertificatesContract } from '../certificate';
import { getExamManagementContract } from '../examManagement';

/**
 * Add students to the institution (only for verified institutions)
 */
export const addStudents = async (studentAddresses: string[]) => {
  try {
    const contract = await getIdentityContract();
    const tx = await contract.addStudents(studentAddresses);
    await tx.wait();
    return {
      success: true,
      message: 'Students added successfully',
      hash: tx.hash
    };
  } catch (error: any) {
    console.error('Error adding students:', error);
    return {
      success: false,
      message: error.message || 'Failed to add students'
    };
  }
};

/**
 * Issue a certificate to a student (only for institutions)
 */
export const issueCertificate = async (studentAddress: string, ipfsHash: string) => {
  try {
    const contract = await getCertificatesContract();
    const tx = await contract.issueCertificate(studentAddress, ipfsHash);
    await tx.wait();
    return {
      success: true,
      message: 'Certificate issued successfully',
      hash: tx.hash
    };
  } catch (error: any) {
    console.error('Error issuing certificate:', error);
    return {
      success: false,
      message: error.message || 'Failed to issue certificate'
    };
  }
};

/**
 * Create a new exam (only for institutions)
 */
export const createExam = async (ipfsHash: string) => {
  try {
    const contract = await getExamManagementContract();
    const tx = await contract.createExam(ipfsHash);
    const receipt = await tx.wait();
    // You may want to parse the event to get the examId
    return {
      success: true,
      message: 'Exam created successfully',
      hash: tx.hash
    };
  } catch (error: any) {
    console.error('Error creating exam:', error);
    return {
      success: false,
      message: error.message || 'Failed to create exam'
    };
  }
};

/**
 * Register students for an exam (only for institutions)
 */
export const registerStudentsForExam = async (examId: string, studentAddresses: string[]) => {
  try {
    const contract = await getExamManagementContract();
    const tx = await contract.registerStudentsForExam(examId, studentAddresses);
    await tx.wait();
    return {
      success: true,
      message: 'Students registered for exam successfully',
      hash: tx.hash
    };
  } catch (error: any) {
    console.error('Error registering students for exam:', error);
    return {
      success: false,
      message: error.message || 'Failed to register students for exam'
    };
  }
};

/**
 * Submit exam result for a student (only for institutions)
 */
export const submitExamResult = async (
  examId: string,
  student: string,
  score: number,
  grade: string,
  notes: string
) => {
  try {
    const contract = await getExamManagementContract();
    const tx = await contract.submitResult(examId, student, score, grade, notes);
    await tx.wait();
    return {
      success: true,
      message: 'Exam result submitted successfully',
      hash: tx.hash
    };
  } catch (error: any) {
    console.error('Error submitting exam result:', error);
    return {
      success: false,
      message: error.message || 'Failed to submit exam result'
    };
  }
};

export * from './institution';