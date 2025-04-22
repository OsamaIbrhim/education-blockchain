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
export const IdentityABI = [
  "function registerUser(uint8 _role, string memory _ipfsHash) external",
  "function verifyUser(address _userAddress) external",
  "function updateUserIPFS(string memory _newIpfsHash) external",
  "function getUserRole(address _userAddress) external view returns (uint8)",
  "function isVerifiedUser(address _userAddress) external view returns (bool)",
  "function updateUserRole(address _userAddress, uint8 _newRole) external",
  "function isInstitution(address _address) public view returns (bool)",
  "function owner() external view returns (address)",
  "function isAdmin(address _address) external view returns (bool)",
  "function addAdmin(address _newAdmin) external",
  "function removeAdmin(address _admin) external"
];


export const CertificatesABI = [
  "function issueCertificate(address _studentAddress, string memory _ipfsHash) external returns (bytes32)",
  "function getStudentCertificates(address _student) external view returns (bytes32[])",
  "function verifyCertificate(bytes32 _certificateId) external view returns (address student, address institution, string ipfsHash, uint256 issuedAt, bool isValid)"
];