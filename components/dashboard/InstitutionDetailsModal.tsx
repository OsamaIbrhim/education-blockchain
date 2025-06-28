import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton,
  ModalBody, VStack, Text, Spinner, useToast, Box, SimpleGrid, Divider, Button
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { getUserData } from 'services/identity';
import { Institution } from 'types/institution';
import { getFromIPFS } from 'utils/ipfsUtils';
import { useLanguage } from 'context/LanguageContext';

interface InstitutionDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  address: string | null;
  onVerify?: (address: string) => Promise<void>;
}

const InstitutionDetailsModal = ({ isOpen, onClose, address, onVerify }: InstitutionDetailsModalProps) => {
  const [institution, setInstitution] = useState<Institution | null>(null);
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const { t, translations } = useLanguage();

  if (Object.keys(translations).length === 0) {
    return <Spinner />;
  }

  useEffect(() => {
    const fetchInstitution = async () => {
      if (!address) return;
      setLoading(true);
      try {
        const { ipfsHash, isVerified } = await getUserData(address);
        if (!ipfsHash) throw new Error(t('noIpfsHashFound'));
        const data = await getFromIPFS(ipfsHash);
        setInstitution({ address, isVerified, ...data });
      } catch (error: any) {
        toast({
          title: t('fetchInstitutionError'),
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
  }, [isOpen, address, toast, t]);

  const renderField = (label: string, value?: string | null) => (
    <Box>
      <Text fontWeight="bold" color="gray.700">{label}</Text>
      <Text>{value || t('notAvailable')}</Text>
    </Box>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>📄 {t('institutionDetails')}</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          {loading ? (
            <Box textAlign="center" py={10}>
              <Spinner size="xl" />
            </Box>
          ) : institution ? (
            <Box border="1px solid" borderColor="gray.100" borderRadius="md" p={4} bg="gray.50">
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                {renderField(t('institutionAddress'), institution.address || address)}
                {renderField(t('institutionName'), institution.name)}
                {renderField(t('institutionEmail'), institution.email)}
                {renderField(t('institutionPhone'), institution.phone)}
                {renderField(t('institutionUniversity'), institution.university)}
                {renderField(t('institutionCollege'), institution.college)}
                {renderField(t('institutionMinistry'), institution.ministry)}
                {renderField(t('institutionDescription'), institution.description)}
                {renderField(t('institutionWebsite'), institution.website)}
                {renderField(
                  t('verificationDate'),
                  institution.verificationDate ? new Date(institution.verificationDate).toLocaleString() : t('notAvailable')
                )}
                {renderField(
                  t('status'),
                  institution.isVerified ? t('verified') : t('pending')
                )}
              </SimpleGrid>

              {institution.logo && (
                <>
                  <Divider my={4} />
                  <Box textAlign="center">
                    <img
                      src={institution.logo}
                      alt={t('institutionLogo')}
                      style={{ maxWidth: 120, borderRadius: 8 }}
                    />
                  </Box>
                </>
              )}

              {institution && !institution.isVerified && onVerify && (
                <Button
                  colorScheme="green"
                  mt={4}
                  onClick={() => onVerify(institution.address)}
                  width="100%"
                >
                  {t('verifyInstitution')}
                </Button>
              )}
            </Box>
          ) : (
            <Text color="red.500" fontWeight="bold">⚠️ {t('institutionNotFound')}</Text>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default InstitutionDetailsModal;