// ResultsModal component 
import React, { useState } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  Textarea,
  VStack,
} from '@chakra-ui/react';
import { ExamResult } from '../../types/institution';

interface ResultsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (result: ExamResult) => Promise<boolean>;
  loading: boolean;
}

export default function ResultsModal({
  isOpen,
  onClose,
  onSubmit,
  loading,
}: ResultsModalProps) {
  const [result, setResult] = useState<ExamResult>({
    studentAddress: '',
    score: 0,
    grade: '',
    notes: '',
  });

  const handleSubmit = async () => {
    const success = await onSubmit(result);
    if (success) {
      setResult({
        studentAddress: '',
        score: 0,
        grade: '',
        notes: '',
      });
    }
  };

  const calculateGrade = (score: number): string => {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  };

  const handleScoreChange = (value: string) => {
    const score = Math.min(100, Math.max(0, Number(value) || 0));
    setResult({
      ...result,
      score,
      grade: calculateGrade(score),
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>إضافة نتيجة | Add Result</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4}>
            <FormControl isRequired>
              <FormLabel>عنوان الطالب | Student Address</FormLabel>
              <Input
                value={result.studentAddress}
                onChange={(e) => setResult({ ...result, studentAddress: e.target.value })}
                placeholder="0x..."
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>الدرجة | Score</FormLabel>
              <Input
                type="number"
                min={0}
                max={100}
                value={result.score}
                onChange={(e) => handleScoreChange(e.target.value)}
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>التقدير | Grade</FormLabel>
              <Select
                value={result.grade}
                onChange={(e) => setResult({ ...result, grade: e.target.value })}
              >
                <option value="">اختر التقدير | Select grade</option>
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
                <option value="D">D</option>
                <option value="F">F</option>
              </Select>
            </FormControl>

            <FormControl>
              <FormLabel>ملاحظات | Notes</FormLabel>
              <Textarea
                value={result.notes}
                onChange={(e) => setResult({ ...result, notes: e.target.value })}
                placeholder="أضف ملاحظات إضافية | Add additional notes"
              />
            </FormControl>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            إلغاء | Cancel
          </Button>
          <Button
            colorScheme="blue"
            onClick={handleSubmit}
            isLoading={loading}
            isDisabled={!result.studentAddress || !result.grade}
          >
            حفظ | Save
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
} 