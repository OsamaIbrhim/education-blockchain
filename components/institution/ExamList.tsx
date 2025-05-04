import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  HStack,
  Text,
  IconButton
} from '@chakra-ui/react';
import { UserIcon, BookIcon, CheckIcon, AwardIcon } from '../Icons';
import { Exam } from '../../types/examManagement';

interface ExamListProps {
  exams: Exam[];
  onUpdateStatus: (examId: string, status: string) => void;
  onSelectExam: (exam: Exam) => void;
  onOpenResultsModal: () => void;
}

export default function ExamList({
  exams,
  onUpdateStatus,
  onSelectExam,
  onOpenResultsModal
}: ExamListProps) {
  return (
    <Table variant="simple">
      <Thead>
        <Tr>
          <Th>العنوان - Title</Th>
          <Th>التاريخ - Date</Th>
          <Th>المدة - Duration</Th>
          <Th>الحالة - Status</Th>
          <Th>الطلاب - Students</Th>
          <Th>الإجراءات - Actions</Th>
        </Tr>
      </Thead>
      <Tbody>
        {exams.map((exam) => (
          <Tr key={exam.address}>
            <Td>{exam.title}</Td>
            <Td>{new Date(exam.date).toLocaleDateString()}</Td>
            <Td>{exam.duration} دقيقة</Td>
            <Td>
              <Badge
                colorScheme={
                  exam.status === 'COMPLETED' ? 'green' :
                  exam.status === 'IN_PROGRESS' ? 'yellow' :
                  'blue'
                }
              >
                {exam.status}
              </Badge>
            </Td>
            <Td>
              <HStack>
                <Text>{exam.students.length} طالب</Text>
                <IconButton
                  aria-label="Add student"
                  icon={<UserIcon />}
                  size="sm"
                  colorScheme="teal"
                  onClick={() => onSelectExam(exam)}
                />
              </HStack>
            </Td>
            <Td>
              <HStack spacing={2}>
                <IconButton
                  aria-label="Enter Results"
                  icon={<AwardIcon />}
                  size="sm"
                  colorScheme="purple"
                  onClick={() => {
                    onSelectExam(exam);
                    onOpenResultsModal();
                  }}
                />
                <IconButton
                  aria-label="Start exam"
                  icon={<BookIcon />}
                  size="sm"
                  colorScheme="blue"
                  onClick={() => onUpdateStatus(exam.address, 'IN_PROGRESS')}
                  isDisabled={exam.status !== 'PENDING'}
                />
                <IconButton
                  aria-label="Complete exam"
                  icon={<CheckIcon />}
                  size="sm"
                  colorScheme="green"
                  onClick={() => onUpdateStatus(exam.address, 'COMPLETED')}
                  isDisabled={exam.status !== 'IN_PROGRESS'}
                />
              </HStack>
            </Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  );
} 