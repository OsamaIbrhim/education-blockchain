import { useState, useEffect } from 'react';
import {
    Container,
    VStack,
    Heading,
    Text,
    Box,
    SimpleGrid,
    Badge,
    Button,
    useToast,
    Link
} from '@chakra-ui/react';
import { useAccount } from 'wagmi';
import { ethers } from 'ethers';
import { getFromIPFS } from '../../../services/ipfs';

export default function StudentCertificates() {
    const { address, isConnected } = useAccount();
    const toast = useToast();
    const [certificates, setCertificates] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (isConnected) {
            fetchCertificates();
        }
    }, [isConnected, address]);

    const fetchCertificates = async () => {
        try {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const certificatesContract = new ethers.Contract(
                process.env.NEXT_PUBLIC_CERTIFICATES_CONTRACT_ADDRESS,
                CertificatesABI,
                provider
            );

            // Get all certificate IDs for the student
            const certificateIds = await certificatesContract.getStudentCertificates(address);

            // Fetch details for each certificate
            const certificateDetails = await Promise.all(
                certificateIds.map(async (id) => {
                    const cert = await certificatesContract.verifyCertificate(id);
                    const metadata = await getFromIPFS(cert.ipfsHash);
                    return {
                        id,
                        ...cert,
                        metadata
                    };
                })
            );

            setCertificates(certificateDetails);
        } catch (error) {
            console.error('Error fetching certificates:', error);
            toast({
                title: "خطأ",
                description: "حدث خطأ أثناء جلب الشهادات",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        } finally {
            setIsLoading(false);
        }
    };

    const generateQRCode = (certificateId) => {
        const verificationUrl = `${window.location.origin}/verify/${certificateId}`;
        // You can use any QR code library here
        return verificationUrl;
    };

    if (!isConnected) {
        return (
            <Container maxW="container.xl" py={10}>
                <Text>الرجاء الاتصال بالمحفظة أولاً</Text>
            </Container>
        );
    }

    return (
        <Container maxW="container.xl" py={10}>
            <VStack spacing={8} align="stretch">
                <Heading>شهاداتي</Heading>

                {isLoading ? (
                    <Text>جاري تحميل الشهادات...</Text>
                ) : certificates.length === 0 ? (
                    <Text>لا توجد شهادات حتى الآن</Text>
                ) : (
                    <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                        {certificates.map((cert) => (
                            <Box
                                key={cert.id}
                                p={6}
                                borderWidth={1}
                                borderRadius="lg"
                                boxShadow="sm"
                            >
                                <VStack align="stretch" spacing={4}>
                                    <Heading size="md">{cert.metadata.title}</Heading>
                                    <Text>{cert.metadata.description}</Text>
                                    <Badge colorScheme="green">
                                        الدرجة: {cert.metadata.grade}
                                    </Badge>
                                    <Text fontSize="sm">
                                        تاريخ الإصدار: {new Date(cert.metadata.issuedAt).toLocaleDateString('ar-EG')}
                                    </Text>
                                    
                                    <Link href={cert.metadata.certificateFileUrl} isExternal>
                                        <Button size="sm" width="full">
                                            عرض الشهادة
                                        </Button>
                                    </Link>
                                    
                                    <Link href={generateQRCode(cert.id)} isExternal>
                                        <Button size="sm" width="full" variant="outline">
                                            رابط التحقق
                                        </Button>
                                    </Link>
                                </VStack>
                            </Box>
                        ))}
                    </SimpleGrid>
                )}
            </VStack>
        </Container>
    );
} 