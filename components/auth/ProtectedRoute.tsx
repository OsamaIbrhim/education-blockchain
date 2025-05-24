import { useAppData } from 'hooks/useAppData';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { Center, Spinner, Text } from '@chakra-ui/react';

interface ProtectedRouteProps {
  allowedValue: any;
  valueToCheck: any;
  redirectTo?: string;
  children: React.ReactNode;
}

const ProtectedRoute = ({
  allowedValue,
  valueToCheck,
  redirectTo = '/',
  children,
}: ProtectedRouteProps) => {
  const router = useRouter();

  useEffect(() => {
    if (valueToCheck && valueToCheck !== allowedValue) {
      router.replace(redirectTo);
    }
  }, [valueToCheck, allowedValue, redirectTo, router]);

  if (!valueToCheck) {
    return (
      <Center h="100vh">
        <Spinner size="xl" color="red.500" />
        <Text mt={4}>Loading ...</Text>
      </Center>
    );
  }

  if (valueToCheck !== allowedValue) {
    return (
      <Center h="100vh">
        <Text color="red.500" fontSize="xl">
          You are not authorized to access this page.
        </Text>
      </Center>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;