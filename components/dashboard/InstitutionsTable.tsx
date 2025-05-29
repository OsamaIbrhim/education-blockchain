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

const InstitutionRow = React.memo(({ inst, onClick, onVerify }: InstitutionRowProps) => {
  const toast = useToast();

  const handleCopyAddress = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(inst.address);
    toast({
      title: 'تم نسخ العنوان',
      description: 'تم نسخ عنوان المؤسسة إلى الحافظة',
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
        <Tooltip label="اضغط للنسخ" hasArrow>
          <span style={{ cursor: 'pointer' }} onClick={handleCopyAddress}>
            {inst.address}
          </span>
        </Tooltip>
      </Td>
      <Td fontSize="sm">
        <Tooltip label="اضغط لعرض المؤسسة" hasArrow>
          <span style={{ cursor: 'pointer' }} onClick={() => onClick(inst)}>
            {inst.name}
          </span>
        </Tooltip>
      </Td>
      <Td fontSize="sm">
        {(() => {
          if (inst.verificationDate) {
            const date = new Date(inst.verificationDate);
            // Check if the date is valid after conversion
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
              {inst.isVerified ? 'معتمدة - Verified' : 'قيد التحقق - Pending'}
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
            تحقق - Verify
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
          title: 'فشل التحقق',
          description: 'حدث خطأ أثناء محاولة التحقق من المؤسسة',
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
              <Text mt={4}>جاري تحميل المؤسسات...</Text>
            </Center>
          ) : institutions.length === 0 ? (
            <Center p={8}>
              <VStack spacing={3}>
                {/* <Icon as={InfoIcon} w={40} h={40} color="red.500" /> */}
                <Text fontSize="lg">لا توجد مؤسسات مسجلة</Text>
                <Text color={mutedTextColor}>
                  No registered institutions
                </Text>
              </VStack>
            </Center>
          ) : (
            <Table variant="simple">
              <Thead bg={useColorModeValue('gray.50', 'gray.700')}>
                <Tr>
                  <Th>عنوان المؤسسة - Institution Address</Th>
                  <Th>اسم المؤسسة - Institution Name</Th>
                  <Th>تاريخ التحقق - Verification Date</Th>
                  <Th>الحالة - Status</Th>
                  <Th>إجراء - Action</Th>
                </Tr>
              </Thead>
              <Tbody>
                {institutions.map((inst) => (
                  <InstitutionRow key={inst.address} inst={inst} onClick={handleInstitutionClick} onVerify={onVerify} />
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