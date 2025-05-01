export const ExamManagementABI = [
  "function createExam(string memory _title, string memory _description, uint256 _date, uint256 _duration, string memory _ipfsHash) external",
  "function submitExamResult(string memory _examId, address _student, uint256 _score, string memory _grade, string memory _ipfsHash) external",
  "function updateExamStatus(string memory _examId, string memory _status) external",
  "function getExam(string memory _examId) external view returns (string memory id, string memory title, string memory description, uint256 date, uint256 duration, string memory ipfsHash, string memory status)",
  "function getExamResult(string memory _examId, address _student) external view returns (uint256 score, string memory grade, string memory ipfsHash)",
  "function getInstitutionExams(address _institution) external view returns (string[] memory)",
  "function getStudentExams(address _student) external view returns (string[] memory)",
  "function enrollStudent(string memory _examId, address _studentAddress) external",
  "function getExamStatistics(string memory _examId) external view returns (uint256 totalStudents, uint256 averageScore, uint256 passRate)",
  "function registerInstitution(string memory name, string memory description, string memory physicalAddress, string memory email, string memory phone, string memory website, string memory logo, string memory ministry, string memory university, string memory college) external",
  "function verifyInstitution(address _institution) external",
  "function institutions(address _institution) external view returns (string memory name, string memory description, string memory physicalAddress, string memory email, string memory phone, string memory website, string memory logo, string memory ministry, string memory university, string memory college, bool isVerified)",
  "function getExamResults(string memory _examId) external view returns (address[] memory students, uint256[] memory scores, string[] memory grades)",
  "function getInstitution(address _institution) external view returns (string memory name, string memory description, string memory physicalAddress, string memory email, string memory phone, string memory website, string memory logo, string memory ministry, string memory university, string memory college, bool isVerified)",
  "function updateInstitutionProfile(string memory name, string memory ministry, string memory university, string memory college, string memory description, string memory logo, string memory website, string memory email, string memory phone) external",
  "function getInstitutionProfile(address _institution) external view returns (string memory name, string memory ministry, string memory university, string memory college, string memory description, string memory logo, string memory website, string memory email, string memory phone)",
  "function getInstitutionStudents(address _institution) external view returns (address[] memory students)",
  "function getInstitutionResults(address _institution) external view returns (address[] memory students, uint256[] memory scores, string[] memory grades)",
  "function getInstitutionExamList(address _institution) external view returns (bytes32[] memory)"
];

export const IdentityABI = [
  "function registerUser(uint8 _role, string memory _ipfsHash) external",
  "function verifyUser(address _userAddress) external returns (bool)",
  "function getUserRole(address _userAddress) external view returns (uint8)",
  "function isVerifiedUser(address _userAddress) external view returns (bool)",
  "function updateUserIPFS(string memory _newIpfsHash) external",
  "function owner() view returns (address)",
  "function users(address) view returns (address userAddress, string ipfsHash, uint8 role, bool isVerified, uint256 createdAt)",
  "function getUserData(address _userAddress) external view returns (address userAddress, string memory ipfsHash, uint8 role, bool isVerified, uint256 createdAt)",
  "function getUsersByRole(uint8 _role) external view returns (address[] memory)",
  "event IPFSHashUpdated(address indexed user, string ipfsHash)"
];

export const CertificatesABI = [
  "function issueCertificate(address _studentAddress, string memory _ipfsHash) external returns (bytes32)",
  "function getStudentCertificates(address _student) external view returns (bytes32[])",
  "function verifyCertificate(bytes32 _certificateId) external view returns (address student, address institution, string ipfsHash, uint256 issuedAt, bool isValid)"
];