import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton,
  ModalBody, VStack, Text, Spinner, useToast, Box, SimpleGrid, Divider
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { getUserData } from 'services/identity';
import { Institution } from 'types/institution';
import { getFromIPFS } from 'utils/ipfsUtils';

interface InstitutionDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  address: string | null;
}

const InstitutionDetailsModal = ({ isOpen, onClose, address }: InstitutionDetailsModalProps) => {
  const [institution, setInstitution] = useState<Institution | null>(null);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  useEffect(() => {
    const fetchInstitution = async () => {
      if (!address) return;
      setLoading(true);
      try {
        const { ipfsHash, isVerified } = await getUserData(address);
        if (!ipfsHash) throw new Error('No IPFS hash found');
        const data = await getFromIPFS(ipfsHash);
        setInstitution({ address, isVerified, ...data });
      } catch (error: any) {
        toast({
          title: 'خطأ في جلب بيانات المؤسسة',
          description: error.message || error,
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        setInstitution(null);
      } finally {
        setLoading(false);
      }
    };
    if (isOpen && address) fetchInstitution();
  }, [isOpen, address, toast]);

  const renderField = (label: string, value?: string | null) => (
    <Box>
      <Text fontWeight="bold" color="gray.700">{label}</Text>
      <Text>{value || 'N/A'}</Text>
    </Box>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>📄 بيانات المؤسسة - Institution Details</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          {loading ? (
            <Box textAlign="center" py={10}>
              <Spinner size="xl" />
            </Box>
          ) : institution ? (
            <Box border="1px solid" borderColor="gray.100" borderRadius="md" p={4} bg="gray.50">
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                {renderField('العنوان - Address', institution.address || address)}
                {renderField('الاسم - Name', institution.name)}
                {renderField('البريد الإلكتروني - Email', institution.email)}
                {renderField('الهاتف - Phone', institution.phone)}
                {renderField('الجامعة - University', institution.university)}
                {renderField('الكلية - College', institution.college)}
                {renderField('الوزارة - Ministry', institution.ministry)}
                {renderField('الوصف - Description', institution.description)}
                {renderField('الموقع الإلكتروني - Website', institution.website)}
                {renderField(
                  'تاريخ التحقق - Verification Date',
                  institution.verificationDate ? new Date(institution.verificationDate).toLocaleString() : 'N/A'
                )}
                {renderField('الحالة - Status', institution.isVerified ? 'معتمدة - Verified' : 'قيد التحقق - Pending')}
              </SimpleGrid>

              {institution.logo && (
                <>
                  <Divider my={4} />
                  <Box textAlign="center">
                    <img
                      src={institution.logo}
                      alt="Institution Logo"
                      style={{ maxWidth: 120, borderRadius: 8 }}
                    />
                  </Box>
                </>
              )}
            </Box>
          ) : (
            <Text color="red.500" fontWeight="bold">⚠️ لم يتم العثور على بيانات المؤسسة</Text>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default InstitutionDetailsModal;