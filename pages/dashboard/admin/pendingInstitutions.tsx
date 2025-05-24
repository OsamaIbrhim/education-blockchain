import { Box, Container, Heading, VStack, Text, Divider } from '@chakra-ui/react';
import { useAppData } from 'hooks/useAppData';
import InstitutionsTable from '../../../components/dashboard/InstitutionsTable';
import Layout from 'components/layout/Layout';

export default function PendingInstitutionsPage() {
    const { allInstitutions, account, isLoading } = useAppData();
    const pendingInstitutions = allInstitutions.filter(inst => !inst.isVerified);
    const allowedRole = "admin";

    return (
        <Layout pageName="لوحة تحكم المسؤول | Admin Dashboard" address={account} allowedValue={allowedRole}>
            <Box minH="100vh" bg="gray.50" py={10}>
                <Container maxW="container.lg">
                    <VStack spacing={6} align="stretch">
                        <Heading size="lg" color="orange.500">
                            المؤسسات قيد التحقق - Pending Institutions
                        </Heading>
                        <Text color="gray.600" mb={4}>
                            قائمة بجميع المؤسسات التي لم يتم اعتمادها بعد.
                        </Text>
                        <Divider mb={4} />
                        <InstitutionsTable
                            institutions={pendingInstitutions}
                            isLoading={isLoading}
                        />
                    </VStack>
                </Container>
            </Box>
        </Layout>
    );
}