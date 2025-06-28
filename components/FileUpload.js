import { useState } from 'react';
import {
    Box,
    Button,
    Text,
    Progress,
    useToast,
    VStack,
    Input
} from '@chakra-ui/react';
import { uploadToIPFS, uploadJSONToIPFS } from '../services/ipfs';

const FileUpload = ({ onUploadComplete, acceptedTypes = "*", isJson = false }) => {
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const toast = useToast();

    const handleUpload = async (event) => {
        try {
            const file = event.target.files[0];
            if (!file) return;

            setIsUploading(true);
            setUploadProgress(25);

            let result;
            if (isJson) {
                const reader = new FileReader();
                reader.onload = async (e) => {
                    try {
                        const jsonData = JSON.parse(e.target.result);
                        setUploadProgress(50);
                        result = await uploadJSONToIPFS(jsonData);
                        setUploadProgress(100);
                        onUploadComplete(result);
                    } catch (error) {
                        handleError(error);
                    }
                };
                reader.readAsText(file);
            } else {
                setUploadProgress(50);
                result = await uploadToIPFS(file);
                setUploadProgress(100);
                onUploadComplete(result);
            }

            toast({
                title: "تم الرفع بنجاح",
                description: `تم رفع الملف إلى IPFS بنجاح`,
                status: "success",
                duration: 5000,
                isClosable: true,
            });
        } catch (error) {
            handleError(error);
        } finally {
            setIsUploading(false);
            setUploadProgress(0);
        }
    };

    const handleError = (error) => {
        console.error('Upload error:', error);
        toast({
            title: "خطأ في الرفع",
            description: error.message || "حدث خطأ أثناء رفع الملف",
            status: "error",
            duration: 5000,
            isClosable: true,
        });
        setIsUploading(false);
        setUploadProgress(0);
    };

    return (
        <VStack spacing={4} width="100%">
            <Box width="100%">
                <Input
                    type="file"
                    accept={acceptedTypes}
                    onChange={handleUpload}
                    disabled={isUploading}
                    display="none"
                    id="file-upload"
                />
                <Button
                    as="label"
                    htmlFor="file-upload"
                    width="100%"
                    isLoading={isUploading}
                    loadingText="جاري الرفع..."
                    cursor="pointer"
                >
                    اختر ملفاً للرفع
                </Button>
            </Box>
            
            {isUploading && (
                <Box width="100%">
                    <Progress value={uploadProgress} size="sm" colorScheme="blue" />
                    <Text mt={2} textAlign="center">
                        جاري الرفع... {uploadProgress}%
                    </Text>
                </Box>
            )}
        </VStack>
    );
};

export default FileUpload; 