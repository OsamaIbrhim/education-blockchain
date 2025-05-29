import { getIdentityContract } from '../identity';
import { getCertificatesContract } from '../certificate';
import { getExamManagementContract } from '../examManagement';

/**
 * Register for an exam (student)
 */
export const registerForExam = async (examId: string) => {
  try {
    const contract = await getExamManagementContract();
    const tx = await contract.registerForExam(examId);
    await tx.wait();
    return {
      success: true,
      message: 'Registered for exam successfully',
      hash: tx.hash
    };
  } catch (error: any) {
    console.error('Error registering for exam:', error);
    return {
      success: false,
      message: error.message || 'Failed to register for exam'
    };
  }
};

/**
 * Submit answers for an exam (student)
 */
export const submitExamAnswers = async (examId: string, answersIpfsHash: string) => {
  try {
    const contract = await getExamManagementContract();
    const tx = await contract.submitAnswers(examId, answersIpfsHash);
    await tx.wait();
    return {
      success: true,
      message: 'Answers submitted successfully',
      hash: tx.hash
    };
  } catch (error: any) {
    console.error('Error submitting answers:', error);
    return {
      success: false,
      message: error.message || 'Failed to submit answers'
    };
  }
};

/**
 * Get all certificates for the student
 */
export const getMyCertificates = async (studentAddress: string) => {
  try {
    const contract = await getCertificatesContract();
    return await contract.getUserCertificates(studentAddress);
  } catch (error: any) {
    console.error('Error fetching certificates:', error);
    return [];
  }
};

/**
 * Get grade for a specific exam (student)
 */
export const getExamGrade = async (examId: string, studentAddress: string) => {
  try {
    const contract = await getExamManagementContract();
    return await contract.getExamResult(examId, studentAddress);
  } catch (error: any) {
    console.error('Error fetching exam grade:', error);
    return null;
  }
};

/**
 * View a student's exam result (employer)
 */
export const getStudentExamResult = async (examId: string, studentAddress: string) => {
  try {
    const contract = await getExamManagementContract();
    return await contract.getExamResult(examId, studentAddress);
  } catch (error: any) {
    console.error('Error fetching exam result:', error);
    throw new Error(error.message || 'Failed to fetch exam result');
  }
};

export * from  './student'