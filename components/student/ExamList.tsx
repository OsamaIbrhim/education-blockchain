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
    onSelectExam: (exam: ExamData) => void;
    onOpenResultsModal: () => void;
}

export default function ExamList({
    exams,
    onSelectExam,
    onOpenResultsModal
}: ExamListProps) {
    const { t } = useLanguage();

    return (
        <Table variant="simple">
            <Thead>
                <Tr>
                    <Th>{t('examTitle')}</Th>
                    <Th>{t('examDate')}</Th>
                    <Th>{t('examDuration')}</Th>
                    <Th>{t('status')}</Th>
                    <Th>{t('results')}</Th>
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
                                {t(
                                    exam.status === 'COMPLETED'
                                        ? 'completed'
                                        : exam.status === 'IN_PROGRESS'
                                            ? 'inProgress'
                                            : 'upcoming'
                                )}
                            </Badge>
                        </Td>
                        <Td>
                            {/* يمكنك إضافة زر أو أيقونة لعرض النتائج أو التفاصيل هنا إذا أردت */}
                        </Td>
                    </Tr>
                ))}
            </Tbody>
        </Table>
    );
}