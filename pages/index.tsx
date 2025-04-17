import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  VStack,
  HStack,
  useToast,
  Select,
  Input,
  FormControl,
  FormLabel,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Spinner
} from '@chakra-ui/react';
import { ethers } from 'ethers';
import { registerUser, getUserRole, issueCertificate, getCertificates, verifyCertificate, isVerifiedUser, isOwner, verifyInstitution, getOwnerAddress } from '../utils/contracts';
import { uploadToIPFS, getFromIPFS } from '../utils/ipfs';
import { useRouter } from 'next/router';
import { connectWallet, getAccounts, requestAccounts } from '../utils/web3Provider';

type RoleType = 'admin' | 'institution' | 'student' | 'employer' | '';

interface Certificate {
  id: string;
  institution: string;
  student: string;
  timestamp: string;
  isValid: boolean;
  ipfsHash: string;
}

interface RegisterFormData {
  role: RoleType;
  name: string;
  email: string;
  institution?: string;
  studentId?: string;
  employerId?: string;
}

function WalletConnection() {
  const [account, setAccount] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<RoleType>('');
  const toast = useToast();
  const router = useRouter();

  const handleConnectWallet = async () => {
    if (typeof window !== 'undefined' && typeof window.ethereum !== 'undefined') {
      try {
        const accounts = await connectWallet();
        if (!accounts || accounts.length === 0) {
          throw new Error('No accounts found');
        }

        setAccount(accounts[0]);

        // Get user role after connecting
        try {
          const role = await getUserRole(accounts[0]) as RoleType;
          setUserRole(role);
          
          // Redirect based on role
          if (role === 'admin') {
            router.push('/dashboard/admin');
          } else if (role === 'institution') {
            router.push('/dashboard/institution');
          } else if (role === 'student') {
            router.push('/dashboard/student');
          } else if (role === 'employer') {
            router.push('/dashboard/employer');
          }
        } catch (error) {
          console.log('User not registered yet');
        }

        toast({
          title: 'Connected',
          description: 'Wallet connected successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } catch (error: any) {
        console.error('Error connecting to MetaMask:', error);
        toast({
          title: 'Error',
          description: 'Failed to connect wallet',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    } else {
      toast({
        title: 'MetaMask not found',
        description: 'Please install MetaMask!',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const disconnectWallet = async () => {
    try {
      // Clear local state
      setAccount(null);
      setUserRole('');
      // Clear any stored data
      localStorage.clear();
      
      toast({
        title: 'Disconnected',
        description: 'Wallet disconnected successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error: any) {
      console.error('Error disconnecting wallet:', error);
      toast({
        title: 'Error',
        description: 'Failed to disconnect wallet',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Box>
      {account ? (
        <VStack gap={4}>
          <Text>Connected to {account}</Text>
          {userRole && <Text>Role: {userRole}</Text>}
          <Button colorScheme="red" onClick={disconnectWallet}>
            تسجيل الخروج - Logout
          </Button>
        </VStack>
      ) : (
        <Button 
          colorScheme="blue" 
          onClick={handleConnectWallet}
        >
          Connect with MetaMask
        </Button>
      )}
    </Box>
  );
}

function RegisterForm({ account }: { account: string }) {
  const [role, setRole] = useState<RoleType>('');
  const toast = useToast();

  const handleRegister = async () => {
    try {
      await registerUser(role);
      toast({
        title: 'Success',
        description: 'User registered successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error registering user:', error);
      toast({
        title: 'Error',
        description: 'Failed to register user',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <VStack gap={4}>
      <FormControl>
        <FormLabel>Select Role</FormLabel>
        <Select
          placeholder="Select role"
          value={role}
          onChange={(e) => setRole(e.target.value as RoleType)}
        >
          <option value="admin">مسؤول النظام - Admin</option>
          <option value="student">طالب - Student</option>
          <option value="institution">مؤسسة تعليمية - Institution</option>
          <option value="employer">جهة توظيف - Employer</option>
        </Select>
      </FormControl>
      <Button colorScheme="green" onClick={handleRegister}>
        Register
      </Button>
    </VStack>
  );
}

function IssueCertificateModal() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [studentAddress, setStudentAddress] = useState('');
  const [certificateData, setCertificateData] = useState('');
  const [isVerified, setIsVerified] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  useEffect(() => {
    checkVerificationStatus();
  }, []);

  const checkVerificationStatus = async () => {
    try {
      const accounts = await requestAccounts();
      const verified = await isVerifiedUser(accounts[0]);
      setIsVerified(verified);
    } catch (error) {
      console.error('Error checking verification status:', error);
      toast({
        title: 'Error',
        description: 'Failed to check verification status',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleIssueCertificate = async () => {
    if (!isVerified) {
      toast({
        title: 'Error',
        description: 'Your institution must be verified before issuing certificates. Please contact the administrator.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    if (!studentAddress || !certificateData) {
      toast({
        title: 'Error',
        description: 'Please fill in all fields',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      setLoading(true);
      // Upload certificate data to IPFS
      const ipfsHash = await uploadToIPFS({
        data: certificateData,
        timestamp: new Date().toISOString()
      });

      // Issue certificate on blockchain
      await issueCertificate(studentAddress, ipfsHash);
      
      toast({
        title: 'Success',
        description: 'Certificate issued successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      onClose();
      setStudentAddress('');
      setCertificateData('');
    } catch (error) {
      console.error('Error issuing certificate:', error);
      toast({
        title: 'Error',
        description: 'Failed to issue certificate. Make sure your institution is verified.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button colorScheme="purple" onClick={onOpen}>Issue Certificate</Button>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Issue Certificate</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {isVerified === false ? (
              <VStack spacing={4}>
                <Text color="red.500">
                  Your institution is not verified. Please contact the administrator for verification.
                </Text>
                <Button colorScheme="blue" onClick={checkVerificationStatus}>
                  Check Verification Status
                </Button>
              </VStack>
            ) : (
              <VStack gap={4}>
                <FormControl>
                  <FormLabel>Student Address</FormLabel>
                  <Input
                    value={studentAddress}
                    onChange={(e) => setStudentAddress(e.target.value)}
                    placeholder="0x..."
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Certificate Data</FormLabel>
                  <Input
                    value={certificateData}
                    onChange={(e) => setCertificateData(e.target.value)}
                    placeholder="Enter certificate details"
                  />
                </FormControl>
                <Button 
                  colorScheme="blue" 
                  onClick={handleIssueCertificate}
                  isLoading={loading}
                  isDisabled={!isVerified}
                >
                  Issue
                </Button>
              </VStack>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}

function ViewCertificatesModal() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<RoleType | null>(null);
  const toast = useToast();

  const checkUserRole = async (address: string) => {
    try {
      const role = await getUserRole(address) as RoleType;
      console.log('Current user role:', role);
      setUserRole(role);
      return role;
    } catch (error) {
      console.error('Error getting user role:', error);
      return null;
    }
  };

  const loadCertificates = async () => {
    setError(null);
    try {
      setLoading(true);
      const accounts = await requestAccounts();
      const currentAddress = accounts[0];
      console.log('Loading certificates for address:', currentAddress);
      
      // Check user role first
      const role = await checkUserRole(currentAddress);
      console.log('User role for certificates:', role);
      
      if (role !== 'student') {
        throw new Error(`Only students can view certificates. Current role: ${role}`);
      }

      console.log('Fetching certificates from contract...');
      const certs = await getCertificates(currentAddress);
      console.log('Raw certificates data:', certs);
      
      if (!certs || certs.length === 0) {
        console.log('No certificates found');
        setCertificates([]);
        return;
      }

      const formattedCerts = await Promise.all(certs.map(async (cert: any) => {
        try {
          console.log('Processing certificate:', cert);
          const ipfsData = await getFromIPFS(cert.ipfsHash);
          return {
            ...cert,
            data: ipfsData,
            issuedAt: new Date(parseInt(cert.timestamp) * 1000).toLocaleString()
          };
        } catch (error) {
          console.error('Error loading IPFS data for cert:', cert.ipfsHash, error);
          return cert;
        }
      }));
      
      console.log('Formatted certificates:', formattedCerts);
      setCertificates(formattedCerts);
    } catch (error: any) {
      console.error('Error loading certificates:', error);
      setError(error.message || 'Failed to load certificates');
      toast({
        title: 'Error',
        description: error.message || 'Failed to load certificates',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadCertificates();
    }
  }, [isOpen]);

  return (
    <>
      <Button colorScheme="teal" onClick={onOpen}>View My Certificates</Button>
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>My Certificates</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={4} align="stretch">
              {userRole && (
                <Text>Current Role: {userRole}</Text>
              )}
              {error && (
                <Text color="red.500">{error}</Text>
              )}
              {loading ? (
                <Text>Loading certificates...</Text>
              ) : certificates.length === 0 ? (
                <VStack spacing={4}>
                  <Text>No certificates found</Text>
                  <Button colorScheme="blue" onClick={loadCertificates}>
                    Refresh Certificates
                  </Button>
                </VStack>
              ) : (
                <VStack spacing={4} align="stretch">
                  <Button colorScheme="blue" size="sm" onClick={loadCertificates}>
                    Refresh Certificates
                  </Button>
                  {certificates.map((cert: any, index: number) => (
                    <Box 
                      key={index}
                      p={4} 
                      border="1px" 
                      borderColor="gray.200" 
                      borderRadius="md"
                      shadow="sm"
                    >
                      <Text><strong>Certificate Hash:</strong> {cert.ipfsHash}</Text>
                      <Text><strong>Issuer:</strong> {cert.issuer}</Text>
                      <Text><strong>Issued At:</strong> {cert.issuedAt}</Text>
                      {cert.data && (
                        <Text><strong>Details:</strong> {JSON.stringify(cert.data)}</Text>
                      )}
                      <HStack mt={2} spacing={2}>
                        <Button 
                          size="sm"
                          colorScheme="blue"
                          onClick={() => window.open(`https://ipfs.io/ipfs/${cert.ipfsHash}`, '_blank')}
                        >
                          View on IPFS
                        </Button>
                      </HStack>
                    </Box>
                  ))}
                </VStack>
              )}
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}

function VerifyCertificateModal() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [certificateId, setCertificateId] = useState('');
  const [verificationResult, setVerificationResult] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleVerify = async () => {
    if (!certificateId) {
      toast({
        title: 'Error',
        description: 'Please enter a certificate ID',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      setLoading(true);
      const isValid = await verifyCertificate(certificateId);
      setVerificationResult(isValid);
    } catch (error) {
      console.error('Error verifying certificate:', error);
      toast({
        title: 'Error',
        description: 'Failed to verify certificate',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button colorScheme="orange" onClick={onOpen}>Verify Certificate</Button>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Verify Certificate</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>Certificate ID</FormLabel>
                <Input
                  value={certificateId}
                  onChange={(e) => setCertificateId(e.target.value)}
                  placeholder="Enter certificate ID"
                />
              </FormControl>
              <Button 
                colorScheme="blue" 
                onClick={handleVerify}
                isLoading={loading}
              >
                Verify
              </Button>
              {verificationResult !== null && (
                <Text
                  color={verificationResult ? 'green.500' : 'red.500'}
                  fontWeight="bold"
                >
                  Certificate is {verificationResult ? 'Valid' : 'Invalid'}
                </Text>
              )}
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}

function VerificationStatus() {
  const [isVerified, setIsVerified] = useState<boolean | null>(null);
  const toast = useToast();

  const checkVerificationStatus = async () => {
    try {
      const accounts = await requestAccounts();
      const verified = await isVerifiedUser(accounts[0]);
      setIsVerified(verified);
    } catch (error) {
      console.error('Error checking verification status:', error);
      toast({
        title: 'Error',
        description: 'Failed to check verification status',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <VStack spacing={4}>
      <Button colorScheme="blue" onClick={checkVerificationStatus}>
        Check Verification Status
      </Button>
      {isVerified !== null && (
        <Text color={isVerified ? 'green.500' : 'red.500'}>
          Your account is {isVerified ? 'verified' : 'not verified'}. 
          {!isVerified && ' Please contact the administrator for verification.'}
        </Text>
      )}
    </VStack>
  );
}

function AdminInterface() {
  const [institutionAddress, setInstitutionAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleVerifyInstitution = async () => {
    if (!institutionAddress) {
      toast({
        title: 'Error',
        description: 'Please enter an institution address',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      setLoading(true);
      await verifyInstitution(institutionAddress);
      toast({
        title: 'Success',
        description: 'Institution verified successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      setInstitutionAddress('');
    } catch (error) {
      console.error('Error verifying institution:', error);
      toast({
        title: 'Error',
        description: 'Failed to verify institution',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <VStack spacing={4} align="stretch">
      <Heading size="md">Admin Panel</Heading>
      <FormControl>
        <FormLabel>Institution Address</FormLabel>
        <Input
          value={institutionAddress}
          onChange={(e) => setInstitutionAddress(e.target.value)}
          placeholder="Enter institution address to verify"
        />
      </FormControl>
      <Button
        colorScheme="green"
        onClick={handleVerifyInstitution}
        isLoading={loading}
      >
        Verify Institution
      </Button>
    </VStack>
  );
}

export default function Home() {
  const [account, setAccount] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<RoleType>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<RoleType>('');
  const [currentRole, setCurrentRole] = useState<RoleType | null>(null);
  const [redirecting, setRedirecting] = useState(false);
  const toast = useToast();
  const router = useRouter();

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        const accounts = await getAccounts();
        if (accounts.length > 0) {
          const currentAccount = accounts[0];
          setAccount(currentAccount);
          
          // Check if user is admin first
          try {
            const isAdminUser = await isOwner(currentAccount);
            if (isAdminUser) {
              setCurrentRole('admin');
              console.log('Admin account detected');
              return;
            }
          } catch (error) {
            console.log('Error checking admin status:', error);
          }

          // If not admin, check regular role
          try {
            const role = await getUserRole(currentAccount) as RoleType;
            setCurrentRole(role);
            console.log('Current user role:', role);
          } catch (error) {
            console.log('Error checking role:', error);
          }
        }
      } catch (error) {
        console.error('Error checking connection:', error);
      }
    }
  };

  const handleConnectWallet = async () => {
    try {
      const accounts = await connectWallet();
      if (accounts.length === 0) {
        throw new Error('No accounts found');
      }

      setAccount(accounts[0]);

      // Get user role after connecting
      try {
        const role = await getUserRole(accounts[0]) as RoleType;
        setUserRole(role);
        
        // Redirect based on role
        if (role === 'admin') {
          router.push('/dashboard/admin');
        } else if (role === 'institution') {
          router.push('/dashboard/institution');
        } else if (role === 'student') {
          router.push('/dashboard/student');
        } else if (role === 'employer') {
          router.push('/dashboard/employer');
        }
      } catch (error) {
        console.log('User not registered yet');
      }

      toast({
        title: 'Connected',
        description: 'Wallet connected successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error: any) {
      console.error('Error connecting to MetaMask:', error);
      toast({
        title: 'Error',
        description: 'Failed to connect wallet',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleLogin = async () => {
    try {
      if (!account) {
        throw new Error('Please connect your wallet first');
      }

      setLoading(true);
      setError('');

      // Check if user is admin first
      const isAdminUser = await isOwner(account);
      if (isAdminUser) {
        console.log('Logging in as admin');
        setRedirecting(true);
        router.push('/dashboard/admin');
        return;
      }

      // If not admin, proceed with regular role check
      const role = await getUserRole(account) as RoleType;
      console.log('Logging in with role:', role);

      if (role === '') {
        throw new Error('This account is not registered. Please register first.');
      }

      // Redirect based on role
      const redirectMap: { [key: string]: string } = {
        'student': '/dashboard/student',
        'institution': '/dashboard/institution',
        'employer': '/dashboard/employer'
      };

      const redirectPath = redirectMap[role];
      if (redirectPath) {
        setRedirecting(true);
        router.push(redirectPath);
      } else {
        throw new Error('Invalid role or role not found');
      }
    } catch (error: any) {
      console.error('Error logging in:', error);
      setError(error.message);
      toast({
        title: 'خطأ - Error',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSwitchWallet = async () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        await window.ethereum.request({
          method: 'wallet_requestPermissions',
          params: [{ eth_accounts: {} }]
        });
        // After switching, check connection again
        await checkConnection();
      } catch (error: any) {
        console.error('Error switching wallet:', error);
        setError(error.message);
      }
    }
  };

  const handleRegister = async () => {
    try {
      setLoading(true);
      setError('');

      // Check if user is admin first
      let isAdminUser = false;
      try {
        isAdminUser = await isOwner(account!);
      } catch (error) {
        console.warn('Error checking admin status, proceeding with normal registration');
      }

      if (isAdminUser) {
        console.log('Admin account detected, redirecting to admin dashboard');
        setCurrentRole('admin');
        setRedirecting(true);
        router.push('/dashboard/admin');
        return;
      }
      
      // If not admin, proceed with regular registration
      if (!selectedRole) {
        throw new Error('Please select a role');
      }

      await registerUser(selectedRole);
      setCurrentRole(selectedRole);
      
      // After successful registration, redirect based on role
      const redirectMap: { [key: string]: string } = {
        'student': '/dashboard/student',
        'institution': '/dashboard/institution',
        'employer': '/dashboard/employer'
      };

      const redirectPath = redirectMap[selectedRole];
      if (redirectPath) {
        setRedirecting(true);
        router.push(redirectPath);
      }
    } catch (error: any) {
      console.error('Error registering:', error);
      setError(error.message);
      toast({
        title: 'Error',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxW="container.sm" py={8}>
      <VStack spacing={6} align="stretch">
        <Box textAlign="center">
          <Heading mb={2}>نظام الشهادات اللامركزي</Heading>
          <Heading size="md" mb={4}>Decentralized Certificate System</Heading>
        </Box>

        <Box>
          <Text mb={2}>المحفظة المتصلة - Connected Account:</Text>
          <Text fontSize="sm" mb={4}>{account || 'Not connected'}</Text>
          
          {!account ? (
            <Button
              colorScheme="blue"
              onClick={handleConnectWallet}
              isLoading={loading}
              width="full"
            >
              اتصال بالمحفظة - Connect Wallet
            </Button>
          ) : (
            <Button
              colorScheme="orange"
              onClick={handleSwitchWallet}
              width="full"
            >
              تبديل المحفظة - Switch Wallet
            </Button>
          )}
        </Box>

        {account && (
          <VStack spacing={4}>
            {currentRole ? (
              <Box bg="yellow.100" p={4} borderRadius="md">
                <Text>
                  أنت مسجل حالياً كـ - You are currently registered as: {currentRole}
                </Text>
                <VStack spacing={4} width="full" mt={4}>
                  <Button
                    colorScheme="green"
                    onClick={handleLogin}
                    isLoading={loading || redirecting}
                    width="full"
                  >
                    دخول للحساب - Login
                  </Button>
                  {currentRole !== 'admin' && (
                    <Button
                      colorScheme="blue"
                      onClick={() => {
                        setCurrentRole(null);
                        setSelectedRole('');
                      }}
                      width="full"
                    >
                      تسجيل حساب جديد - Register New Account
                    </Button>
                  )}
                </VStack>
              </Box>
            ) : (
              <>
                <Box bg="blue.100" p={4} borderRadius="md">
                  <Text mb={4}>
                    هذا الحساب غير مسجل. يرجى التسجيل أولاً.
                    <br />
                    This account is not registered. Please register first.
                  </Text>
                  <Select
                    placeholder="اختر دورك - Select your role"
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value as RoleType)}
                    mb={4}
                  >
                    <option value="student">طالب - Student</option>
                    <option value="institution">مؤسسة تعليمية - Institution</option>
                    <option value="employer">جهة توظيف - Employer</option>
                  </Select>
                  <Button
                    colorScheme="green"
                    onClick={handleRegister}
                    isLoading={loading || redirecting}
                    width="full"
                  >
                    تسجيل - Register
                  </Button>
                </Box>
              </>
            )}
          </VStack>
        )}

        {error && (
          <Box bg="red.100" p={4} borderRadius="md">
            <Text color="red.500">خطأ - Error: {error}</Text>
          </Box>
        )}
      </VStack>
    </Container>
  );
}