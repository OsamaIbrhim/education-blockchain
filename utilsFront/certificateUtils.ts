import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { uploadToIPFS, getIPFSUrl } from './ipfsUtils';
import { Certificate } from '../types/institution';

export const generateCertificatePDF = async (certificateElement: HTMLElement): Promise<Blob> => {
  try {
    // Capture the certificate element as canvas
    const canvas = await html2canvas(certificateElement, {
      width: certificateElement.scrollWidth * 2,
      height: certificateElement.scrollHeight * 2,
      useCORS: true,
      logging: false,
      allowTaint: true,
    });

    // Create PDF
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'px',
      format: [canvas.width, canvas.height]
    });

    // Add the canvas as image to PDF
    const imgData = canvas.toDataURL('image/png');
    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);

    // Return as blob
    return pdf.output('blob');
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};

export const generateCertificateMetadata = (certificate: Certificate) => {
  return {
    name: `Certificate for ${certificate.metadata.studentName}`,
    description: certificate.description,
    image: certificate.ipfsHash ? getIPFSUrl(certificate.ipfsHash) : '',
    attributes: [
      {
        trait_type: "Degree",
        value: certificate.metadata.degree
      },
      {
        trait_type: "Grade",
        value: certificate.metadata.grade
      },
      {
        trait_type: "Percentage",
        value: certificate.metadata.percentage
      },
      {
        trait_type: "Institution",
        value: certificate.institution.name
      },
      {
        trait_type: "Issue Date",
        value: certificate.issueDate
      }
    ]
  };
}; 