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
    return (
        <Table variant="simple">
            <Thead>
                <Tr>
                    <Th>العنوان - Title</Th>
                    <Th>التاريخ - Date</Th>
                    <Th>المدة - Duration</Th>
                    <Th>الحالة - Status</Th>
                    <Th>النتيجة - Result</Th>
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
                    </Tr>
                ))}
            </Tbody>
        </Table>
    );
} 