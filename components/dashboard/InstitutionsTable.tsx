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
  useColorModeValue
} from '@chakra-ui/react';

interface Institution {
  address: string;
  name: string;
  isVerified: boolean;
  verificationDate?: string;
}

interface InstitutionsTableProps {
  institutions: Institution[];
  onVerify: (address: string) => Promise<void>;
}

export default function InstitutionsTable({ institutions, onVerify }: InstitutionsTableProps) {
  const bgColor = useColorModeValue('white', 'gray.800');

  return (
    <Box p={5} shadow="md" borderWidth="1px" bg={bgColor} borderRadius="lg" overflowX="auto">
      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>العنوان - Address</Th>
            <Th>الاسم - Name</Th>
            <Th>الحالة - Status</Th>
            <Th>تاريخ التحقق - Verification Date</Th>
            <Th>الإجراءات - Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {institutions.map((institution) => (
            <Tr key={institution.address}>
              <Td>{institution.address}</Td>
              <Td>{institution.name}</Td>
              <Td>
                <Badge colorScheme={institution.isVerified ? 'green' : 'red'}>
                  {institution.isVerified ? 'معتمدة - Verified' : 'غير معتمدة - Unverified'}
                </Badge>
              </Td>
              <Td>{institution.verificationDate || '-'}</Td>
              <Td>
                {!institution.isVerified && (
                  <Button
                    colorScheme="blue"
                    size="sm"
                    onClick={() => onVerify(institution.address)}
                  >
                    اعتماد - Verify
                  </Button>
                )}
              </Td>
            </Tr>
          ))}
          {institutions.length === 0 && (
            <Tr>
              <Td colSpan={5} textAlign="center">
                لا توجد مؤسسات مسجلة - No registered institutions
              </Td>
            </Tr>
          )}
        </Tbody>
      </Table>
    </Box>
  );
} 