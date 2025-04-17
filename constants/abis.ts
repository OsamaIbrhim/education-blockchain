export const ExamManagementABI = [
  "function createExam(string memory _id, string memory _title, string memory _description, uint256 _date, uint256 _duration, string memory _ipfsHash) external",
  "function submitExamResult(string memory _examId, address _student, uint256 _score, string memory _grade, string memory _ipfsHash) external",
  "function updateExamStatus(string memory _examId, string memory _status) external",
  "function getExam(string memory _examId) external view returns (string memory id, string memory title, string memory description, uint256 date, uint256 duration, string memory ipfsHash, string memory status)",
  "function getExamResult(string memory _examId, address _student) external view returns (uint256 score, string memory grade, string memory ipfsHash)",
  "function getInstitutionExams(address _institution) external view returns (string[] memory)",
  "function getStudentExams(address _student) external view returns (string[] memory)",
  "function enrollStudent(string memory _examId, address _studentAddress) external",
  "function getExamStatistics(string memory _examId) external view returns (uint256 totalStudents, uint256 averageScore, uint256 passRate)",
  "function getExamResults(string memory _examId) external view returns (address[] memory students, uint256[] memory scores, string[] memory grades)"
]; 