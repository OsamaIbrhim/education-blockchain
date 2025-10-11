import { useState } from 'react';
import { VStack, Input, Button, Select } from '@chakra-ui/react';
import { RegistrationData } from 'types/registration';

type Props = {
  onSuccess: (data: RegistrationData) => void;
  isLoading: boolean;
};

export default function RegistrationForm({ onSuccess, isLoading }: Props) {
  const [role, setRole] = useState<'student' | 'institution' | 'employer'>('student');
  const [formData, setFormData] = useState<any>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    onSuccess({ ...formData, role });
  };

  return (
    <VStack spacing={4}>
      {/* اختيار الدور */}
      <Select name="role" value={role} onChange={(e) => setRole(e.target.value as any)}>
        <option value="student">Student</option>
        <option value="institution">Institution</option>
        <option value="employer">Employer</option>
      </Select>

      {/* الحقول الديناميكية حسب الدور */}
      {role === 'student' && (
        <>
          <Input placeholder="National ID" name="nationalId" onChange={handleChange}/>
          <Input placeholder="First Name" name="firstName" onChange={handleChange}/>
          <Input placeholder="Last Name" name="lastName" onChange={handleChange}/>
          <Input placeholder="Phone Number" name="phoneNumber" onChange={handleChange}/>
          <Input placeholder="Email" name="email" onChange={handleChange}/>
          <Input placeholder="Institution Address" name="institutionAddress" onChange={handleChange}/>
        </>
      )}

      {role === 'institution' && (
        <>
          <Input placeholder="Institution Name" name="name" onChange={handleChange}/>
          <Input placeholder="Location" name="location" onChange={handleChange}/>
          <Input placeholder="Phone Number" name="phoneNumber" onChange={handleChange}/>
          <Input placeholder="Email" name="email" onChange={handleChange}/>
          <Input placeholder="Website" name="website" onChange={handleChange}/>
        </>
      )}

      {role === 'employer' && (
        <>
          <Input placeholder="Company Name" name="companyName" onChange={handleChange}/>
          <Input placeholder="Location" name="location" onChange={handleChange}/>
          <Input placeholder="Phone Number" name="phoneNumber" onChange={handleChange}/>
          <Input placeholder="Email" name="email" onChange={handleChange}/>
          <Input placeholder="Website" name="website" onChange={handleChange}/>
        </>
      )}

      <Button colorScheme="blue" onClick={handleSubmit} isLoading={isLoading} width="full">
        Register
      </Button>
    </VStack>
  );
}