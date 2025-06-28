import React from 'react';
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  Badge,
  Box,
  useColorModeValue,
  Tooltip,
  Text,
  useToast,
  HStack,
  Icon,
  useDisclosure,
  createIcon,
  Center,
  VStack,
  Heading,
  Spinner
} from '@chakra-ui/react';
import { useState } from 'react';
import { Institution } from 'types/institution';
import InstitutionDetailsModal from './InstitutionDetailsModal';
import { useLanguage } from 'context/LanguageContext';

interface InstitutionsTableProps {
  institutions: Institution[];
  onVerify?: (address: string) => Promise<void>;
  isLoading?: boolean;
}

const CheckIcon = createIcon({
  displayName: 'CheckIcon',
  viewBox: '0 0 24 24',
  path: (
    <path
      fill="currentColor"
      d="M20 6L9 17l-5-5"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
});

const InfoIcon = createIcon({
  displayName: 'InfoIcon',
  viewBox: '0 0 24 24',
  path: (
    <path
      fill="currentColor"
      d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zm0-14v4m0 4h.01"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
});

type InstitutionRowProps = {
  inst: Institution;
  onClick: (inst: Institution) => void;
  onVerify?: (address: string) => Promise<void>;
};

const InstitutionRow = React.memo(({ inst, onClick, onVerify, t }: InstitutionRowProps & { t: (key: string) => string }) => {
  const toast = useToast();

  const handleCopyAddress = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(inst.address);
    toast({
      title: t('copiedTitle'),
      description: t('copiedDescription'),
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
  };

  return (
    <Tr
      _hover={{
        bg: useColorModeValue('gray.50', 'gray.700'),
        transition: 'all 0.2s',
      }}
    >
      <Td fontSize="sm">
        <Tooltip label={inst.address} hasArrow>
          <span style={{ cursor: 'pointer' }} onClick={handleCopyAddress}>
            {inst.address.slice(0, 6)}...{inst.address.slice(-4)}
          </span>
        </Tooltip>
      </Td>
      <Td fontSize="sm">
        <Tooltip label={t('showInstitution')} hasArrow>
          <span style={{ cursor: 'pointer' }} onClick={() => onClick(inst)}>
            {inst.name}
          </span>
        </Tooltip>
      </Td>
      <Td fontSize="sm">
        {(() => {
          if (inst.verificationDate) {
            const date = new Date(inst.verificationDate);
            if (date instanceof Date && !isNaN(date.getTime())) {
              return date.toLocaleDateString('EG', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              });
            }
          }
          return '-';
        })()}
      </Td>
      <Td>
        <Badge
          colorScheme={inst.isVerified ? 'green' : 'orange'}
          variant="subtle"
          px={3}
          py={1}
          borderRadius="full"
          mr={2}
        >
          <HStack spacing={2}>
            <Icon
              as={inst.isVerified ? CheckIcon : InfoIcon}
              w={4}
              h={4}
              color={inst.isVerified ? 'green.500' : 'orange.500'}
            />
            <Text>
              {inst.isVerified ? t('verified') : t('pending')}
            </Text>
          </HStack>
        </Badge>
      </Td>
      <Td>
        {!inst.isVerified && onVerify && (
          <Button
            size="xs"
            colorScheme="green"
            onClick={e => {
              e.stopPropagation();
              onVerify(inst.address);
            }}
          >
            {t('verify')}
          </Button>
        )}
      </Td>
    </Tr>
  );
});

export default function InstitutionsTable({ institutions, onVerify, isLoading }: InstitutionsTableProps) {
  const mutedTextColor = useColorModeValue('gray.600', 'gray.400');
  const textColor = useColorModeValue('gray.800', 'white');
  const toast = useToast();

  const { t, translations } = useLanguage();

  if (Object.keys(translations).length === 0) {
    return <Spinner size="lg" />; // أو أي لودينج بسيط
  }

  // State for selected institution and modal
  const [selectedInstitutionAddress, setSelectedInstitutionAddress] = useState<string | null>(null);
  const { isOpen: isInstitutionModalOpen, onOpen: openInstitutionModal, onClose: closeInstitutionModal } = useDisclosure();

  // Function to handle row click
  const handleInstitutionClick = (inst: Institution) => {
    setSelectedInstitutionAddress(inst.address);
    openInstitutionModal();
  };

  const handleVerify = async (address: string) => {
    if (onVerify) {
      try {
        await onVerify(address);
      } catch (error) {
        toast({
          title: t('verifyFailed'),
          description: t('verifyError'),
          status: 'error',
          duration: 2000,
          isClosable: true,
        });
      }
    }
    closeInstitutionModal();
  };

  return (
    <>
      {/* Institutions Table */}
      <VStack spacing={4} align="stretch">
        <Box overflowX="auto">
          {isLoading ? (
            <Center p={8}>
              <Spinner size="xl" color="red.500" />
              <Text mt={4}>{t('loadingInstitutions')}</Text>
            </Center>
          ) : institutions.length === 0 ? (
            <Center p={8}>
              <VStack spacing={3}>
                <Text fontSize="lg">{t('noInstitutions')}</Text>
              </VStack>
            </Center>
          ) : (
            <Table variant="simple">
              <Thead bg={useColorModeValue('gray.50', 'gray.700')}>
                <Tr>
                  <Th>{t('institutionAddress')}</Th>
                  <Th>{t('institutionName')}</Th>
                  <Th>{t('verificationDate')}</Th>
                  <Th>{t('status')}</Th>
                  <Th>{t('action')}</Th>
                </Tr>
              </Thead>
              <Tbody>
                {institutions.map((inst) => (
                  <InstitutionRow key={inst.address} inst={inst} onClick={handleInstitutionClick} onVerify={onVerify} t={t} />
                ))}
              </Tbody>
            </Table>
          )}
        </Box>
      </VStack>

      {/* Institution Details Modal */}
      <InstitutionDetailsModal
        isOpen={isInstitutionModalOpen}
        onClose={closeInstitutionModal}
        address={selectedInstitutionAddress}
        onVerify={() => handleVerify(selectedInstitutionAddress || '')}
      />
    </>
  );
}