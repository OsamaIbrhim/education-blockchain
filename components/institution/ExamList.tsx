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
import { ExamData } from '../../types/examManagement';
import { useLanguage } from 'context/LanguageContext';

interface ExamListProps {
  exams: ExamData[];
  onUpdateStatus: (examId: string, exam: any) => void;
  onSelectExam: (exam: ExamData) => void;
  onOpenResultsModal: () => void;
}

export default function ExamList({
  exams,
  onUpdateStatus,
  onSelectExam,
  onOpenResultsModal
}: ExamListProps) {
  const { t } = useLanguage();

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return t('completed');
      case 'IN_PROGRESS':
        return t('inProgress');
      case 'UPCOMING':
        return t('upcoming');
      default:
        return status;
    }
  };

  return (
    <Table variant="simple">
      <Thead>
        <Tr>
          <Th>{t('examTitle')}</Th>
          <Th>{t('examDate')}</Th>
          <Th>{t('examDuration')}</Th>
          <Th>{t('status')}</Th>
          <Th>{t('students')}</Th>
          <Th>{t('actions')}</Th>
        </Tr>
      </Thead>
      <Tbody>
        {exams.map((exam) => (
          <Tr key={exam.address}>
            <Td>{exam.title}</Td>
            <Td>{new Date(exam.date).toLocaleDateString()}</Td>
            <Td>{exam.duration} {t('minutes')}</Td>
            <Td>
              <Badge
                colorScheme={
                  exam.status === 'COMPLETED' ? 'green' :
                    exam.status === 'IN_PROGRESS' ? 'yellow' :
                      'blue'
                }
              >
                {getStatusLabel(exam.status)}
              </Badge>
            </Td>
            <Td>
              <HStack>
                <Text>{exam.students.length} {t('students')}</Text>
                <IconButton
                  aria-label={t('addStudent')}
                  icon={<UserIcon />}
                  size="sm"
                  colorScheme="teal"
                  disabled={exam.status === 'COMPLETED'}
                  onClick={() => onSelectExam(exam)}
                />
              </HStack>
            </Td>
            <Td>
              <HStack spacing={2}>
                <IconButton
                  aria-label={t('enterResults')}
                  icon={<AwardIcon />}
                  size="sm"
                  colorScheme="purple"
                  disabled={exam.status === 'COMPLETED'}
                  onClick={() => {
                    onSelectExam(exam);
                    onOpenResultsModal();
                  }}
                />
                <IconButton
                  aria-label={t('startExam')}
                  icon={<BookIcon />}
                  size="sm"
                  colorScheme="blue"
                  onClick={() => onUpdateStatus(exam.address, { ...exam, status: 'IN_PROGRESS' })}
                  isDisabled={exam.status !== 'UPCOMING'}
                />
                <IconButton
                  aria-label={t('completeExam')}
                  icon={<CheckIcon />}
                  size="sm"
                  colorScheme="green"
                  onClick={() => onUpdateStatus(exam.address, { ...exam, status: 'COMPLETED' })}
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