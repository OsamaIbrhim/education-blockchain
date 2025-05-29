import { getCertificatesContract } from '../certificate';

/**
 * Verify a certificate by its ID (employer)
 */
export const verifyCertificate = async (certificateId: string) => {
  try {
    const contract = await getCertificatesContract();
    return await contract.verifyCertificate(certificateId);
  } catch (error: any) {
    console.error('Error verifying certificate:', error);
    throw new Error(error.message || 'Failed to verify certificate');
  }
};

export * from './employer';