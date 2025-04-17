import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
    Container,
    VStack,
    Heading,
    Text,
    Box,
    Badge,
    Button,
    useToast,
    Link,
    HStack,
    Icon
} from '@chakra-ui/react';
import { CheckCircleIcon, WarningIcon } from '@chakra-ui/icons';
import { ethers } from 'ethers';
import { getFromIPFS } from '../../services/ipfs';

export default function VerifyCertificate() {
    const router = useRouter();
    const { id } = router.query;
    const toast = useToast();
    const [certificate, setCertificate] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isValid, setIsValid] = useState(false);

    useEffect(() => {
        if (id) {
            verifyCertificate();
        }
    }, [id]);

    const verifyCertificate = async () => {
        try {
            // Connect to the network
            const provider = new ethers.providers.JsonRpcProvider(process.env.NETWORK_URL);
            const certificatesContract = new ethers.Contract(
                process.env.NEXT_PUBLIC_CERTIFICATES_CONTRACT_ADDRESS,
                CertificatesABI,
                provider
            );

            // Get certificate details from blockchain
            const cert = await certificatesContract.verifyCertificate(id);
            
            // Verify certificate is valid
            if (!cert.isValid) {
                throw new Error("هذه الشهادة غير صالحة أو تم إلغاؤها");
            }

            // Get metadata from IPFS
            const metadata = await getFromIPFS(cert.ipfsHash);

            // Get institution details
            const identityContract = new ethers.Contract(
                process.env.NEXT_PUBLIC_IDENTITY_CONTRACT_ADDRESS,
                IdentityABI,
                provider
            );
            const institutionData = await getFromIPFS((await identityContract.users(cert.institution)).ipfsHash);

            setCertificate({
                ...cert,
                metadata,
                institution: institutionData
            });
            setIsValid(true);

        } catch (error) {
            console.error('Error verifying certificate:', error);
            toast({
                title: "خطأ في التحقق",
                description: error.message || "حدث خطأ أثناء التحقق من الشهادة",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
            setIsValid(false);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <Container maxW="container.md" py={10}>
                <Text>جاري التحقق من الشهادة...</Text>
            </Container>
        );
    }

    return (
        <Container maxW="container.md" py={10}>
            <VStack spacing={8} align="stretch">
                <Box textAlign="center">
                    <Heading mb={4}>التحقق من الشهادة</Heading>
                    <HStack justify="center" spacing={2}>
                        <Icon
                            as={isValid ? CheckCircleIcon : WarningIcon}
                            w={8}
                            h={8}
                            color={isValid ? "green.500" : "red.500"}
                        />
                        <Text fontSize="xl" color={isValid ? "green.500" : "red.500"}>
                            {isValid ? "الشهادة صحيحة وموثقة" : "الشهادة غير صالحة"}
                        </Text>
                    </HStack>
                </Box>

                {isValid && certificate && (
                    <Box p={6} borderWidth={1} borderRadius="lg" boxShadow="lg">
                        <VStack align="stretch" spacing={4}>
                            <Heading size="md">{certificate.metadata.title}</Heading>
                            <Text>{certificate.metadata.description}</Text>
                            
                            <Box>
                                <Text fontWeight="bold">المؤسسة المانحة:</Text>
                                <Text>{certificate.institution.name}</Text>
                            </Box>

                            <Box>
                                <Text fontWeight="bold">الطالب:</Text>
                                <Text>{ethers.utils.getAddress(certificate.student)}</Text>
                            </Box>

                            <Badge colorScheme="green" p={2}>
                                الدرجة: {certificate.metadata.grade}
                            </Badge>

                            <Text>
                                تاريخ الإصدار: {new Date(certificate.metadata.issuedAt).toLocaleDateString('ar-EG')}
                            </Text>

                            <Link href={certificate.metadata.certificateFileUrl} isExternal>
                                <Button width="full" colorScheme="blue">
                                    عرض الشهادة الأصلية
                                </Button>
                            </Link>
                        </VStack>
                    </Box>
                )}
            </VStack>
        </Container>
    );
} 