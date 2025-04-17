import { useState } from 'react';
import {
    Container,
    VStack,
    Heading,
    FormControl,
    FormLabel,
    Input,
    Button,
    useToast,
    Text,
    Box
} from '@chakra-ui/react';
import { useAccount } from 'wagmi';
import { ethers } from 'ethers';
import FileUpload from '../../../components/FileUpload';
import { uploadJSONToIPFS } from '../../../services/ipfs';

export default function IssueCertificate() {
    const { address, isConnected } = useAccount();
    const toast = useToast();
    const [studentAddress, setStudentAddress] = useState('');
    const [certificateData, setCertificateData] = useState({
        title: '',
        description: '',
        grade: '',
        date: new Date().toISOString().split('T')[0]
    });
    const [isLoading, setIsLoading] = useState(false);
    const [certificateFile, setCertificateFile] = useState(null);

    const handleCertificateUpload = (result) => {
        setCertificateFile(result);
        toast({
            title: "تم رفع الشهادة",
            description: "تم رفع ملف الشهادة بنجاح إلى IPFS",
            status: "success",
            duration: 5000,
            isClosable: true,
        });
    };

    const handleIssueCertificate = async () => {
        try {
            setIsLoading(true);

            // Validate inputs
            if (!studentAddress || !ethers.utils.isAddress(studentAddress)) {
                throw new Error("عنوان الطالب غير صحيح");
            }
            if (!certificateFile) {
                throw new Error("الرجاء رفع ملف الشهادة أولاً");
            }

            // Prepare certificate metadata
            const metadata = {
                ...certificateData,
                certificateFileHash: certificateFile.hash,
                certificateFileUrl: certificateFile.url,
                issuer: address,
                issuedTo: studentAddress,
                issuedAt: new Date().toISOString()
            };

            // Upload metadata to IPFS
            const ipfsResult = await uploadJSONToIPFS(metadata);

            // Get contract instance
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            const certificatesContract = new ethers.Contract(
                process.env.NEXT_PUBLIC_CERTIFICATES_CONTRACT_ADDRESS,
                CertificatesABI,
                signer
            );

            // Issue certificate on blockchain
            const tx = await certificatesContract.issueCertificate(
                studentAddress,
                ipfsResult.hash
            );
            await tx.wait();

            toast({
                title: "تم إصدار الشهادة",
                description: "تم إصدار الشهادة بنجاح وتخزينها على البلوكتشين",
                status: "success",
                duration: 5000,
                isClosable: true,
            });

            // Reset form
            setStudentAddress('');
            setCertificateData({
                title: '',
                description: '',
                grade: '',
                date: new Date().toISOString().split('T')[0]
            });
            setCertificateFile(null);

        } catch (error) {
            console.error('Error issuing certificate:', error);
            toast({
                title: "خطأ",
                description: error.message || "حدث خطأ أثناء إصدار الشهادة",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        } finally {
            setIsLoading(false);
        }
    };

    if (!isConnected) {
        return (
            <Container maxW="container.md" py={10}>
                <Text>الرجاء الاتصال بالمحفظة أولاً</Text>
            </Container>
        );
    }

    return (
        <Container maxW="container.md" py={10}>
            <VStack spacing={8} align="stretch">
                <Heading>إصدار شهادة جديدة</Heading>

                <FormControl isRequired>
                    <FormLabel>عنوان الطالب</FormLabel>
                    <Input
                        value={studentAddress}
                        onChange={(e) => setStudentAddress(e.target.value)}
                        placeholder="0x..."
                    />
                </FormControl>

                <FormControl isRequired>
                    <FormLabel>عنوان الشهادة</FormLabel>
                    <Input
                        value={certificateData.title}
                        onChange={(e) => setCertificateData({...certificateData, title: e.target.value})}
                    />
                </FormControl>

                <FormControl isRequired>
                    <FormLabel>وصف الشهادة</FormLabel>
                    <Input
                        value={certificateData.description}
                        onChange={(e) => setCertificateData({...certificateData, description: e.target.value})}
                    />
                </FormControl>

                <FormControl isRequired>
                    <FormLabel>الدرجة</FormLabel>
                    <Input
                        type="number"
                        value={certificateData.grade}
                        onChange={(e) => setCertificateData({...certificateData, grade: e.target.value})}
                        max="100"
                        min="0"
                    />
                </FormControl>

                <Box>
                    <Text mb={4}>رفع ملف الشهادة (PDF)</Text>
                    <FileUpload
                        onUploadComplete={handleCertificateUpload}
                        acceptedTypes=".pdf"
                    />
                </Box>

                {certificateFile && (
                    <Text color="green.500">
                        تم رفع الملف: {certificateFile.url}
                    </Text>
                )}

                <Button
                    colorScheme="blue"
                    onClick={handleIssueCertificate}
                    isLoading={isLoading}
                    loadingText="جاري إصدار الشهادة..."
                >
                    إصدار الشهادة
                </Button>
            </VStack>
        </Container>
    );
} 