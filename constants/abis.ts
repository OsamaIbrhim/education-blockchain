// --- ExamManagement ABI ---
export const ExamManagementABI = [
  // Constructor
  "constructor(address _identityContractAddress)",

  // Events
  "event ExamCreated(bytes32 indexed examId, string ipfsHash)", // Updated event
  "event ExamUpdated(bytes32 indexed examId, string ipfsHash, bool exists)",
  "event StudentsRegistered(bytes32 indexed examId, address[] students)",
  "event ResultSubmitted(bytes32 indexed examId, address indexed student)",

  // State Variable Getters
  "function examResults(bytes32, address) view returns (uint256 score, string grade, string notes, bool exists)",
  "function exams(bytes32) view returns (string ipfsHash, address[] students, bool exists)", // Updated event
  "function identityContract() view returns (address)",
  "function institutionExams(address, uint256) view returns (bytes32)", // Getter for array element
  "function owner() view returns (address)", // From Ownable
  "function paused() view returns (bool)", // From Pausable
  "function studentExams(address, uint256) view returns (bytes32)", // Add studentExams

  // Functions
  "function createExam(string memory ipfsHash) external returns (bytes32)", // Updated event
  "function getExam(bytes32 examId) external view returns (tuple(string ipfsHash, address[] students, bool exists))", // Updated event
  "function getExamResult(bytes32 examId, address student) external view returns (uint256 score, string memory grade, string memory notes)",
  "function getExamStatistics(bytes32 examId) external view returns (uint256 totalStudents, uint256 passRate, uint256 averageScore)",
  "function getInstitutionExamList(address institution) external view returns (bytes32[] memory)",
  "function registerStudentsForExam(bytes32 examId, address[] memory studentAddresses) external",
  "function submitResult(bytes32 examId, address student, uint256 score, string memory grade, string memory notes) external",
  "function updateExam(bytes32 examId, string memory newIpfsHash, bool newExists) external",
  "function getUserExams(address user) external view returns (bytes32[] memory)" // Add getUserExams
];

// --- Identity ABI ---
export const IdentityABI = [
  // Constructor
  "constructor()",

  // Events
  "event AdminAdded(address indexed admin)",
  "event AdminRemoved(address indexed admin)",
  "event IPFSHashUpdated(address indexed user, string ipfsHash)",
  "event InstitutionAdded(address indexed institution)",
  "event OwnershipTransferred(address indexed previousOwner, address indexed newOwner)", // From Ownable
  "event Paused(address account)", // From Pausable
  "event StudentAdded(address indexed institution, address indexed student)", // Added institution
  "event Unpaused(address account)", // From Pausable
  "event UserRegistered(address indexed userAddress, uint8 indexed role)", // UserRole enum maps to uint8
  "event UserVerified(address indexed userAddress)",
  "event UserRoleUpdated(address indexed user, uint8 oldRole, uint8 newRole)", // Added UserRoleUpdated

  // State Variable Getters
  "function admins(address) view returns (bool)",
  "function institutions(address) view returns (bool)",
  "function owner() view returns (address)", // From Ownable
  "function paused() view returns (bool)", // From Pausable
  "function users(address) view returns (address userAddress, string ipfsHash, uint8 role, bool isVerified)", // UserRole enum maps to uint8

  // Functions
  "function addAdmin(address _newAdmin) external", // Removed onlyOwner
  "function addStudents(address[] memory studentAddresses) external", // Added addStudents
  "function getUserRole(address _userAddress) external view returns (uint8)", // UserRole enum maps to uint8
  "function isAdmin(address _address) public view returns (bool)",
  "function isInstitution(address _address) public view returns (bool)",
  "function isVerifiedUser(address _userAddress) external view returns (bool)",
  "function pause() external", 
  "function registerUser(uint8 _role, string memory _ipfsHash) external", // UserRole enum maps to uint8
  "function removeAdmin(address _admin) external", // Removed onlyOwner
  "function unpause() external", 
  "function updateUserIPFS(string memory _newIpfsHash) external",
  "function updateUserRole(address _userAddress, uint8 _newRole) external", //  UserRole enum maps to uint8
  "function verifyUser(address _userAddress) external",
  "function isStudentEnrolled(address _institution, address _student) external view returns (bool)",// Added isStudentEnrolled
];

// --- Examinations ABI ---
export const ExaminationsABI = [
  // Constructor
  "constructor(address _identityContract)",

  // Events
  "event AnswersSubmitted(bytes32 indexed examId, address indexed student)",
  "event ExaminationCreated(bytes32 indexed examId, address indexed institution)",
  "event GradeAssigned(bytes32 indexed examId, address indexed student, uint256 grade)",
  "event StudentRegistered(bytes32 indexed examId, address indexed student)",

  // State Variable Getters
  "function examinations(bytes32) view returns (address institution, string ipfsHash, uint256 startTime, uint256 endTime, bool isActive)",
  "function identityContract() view returns (address)",
  "function institutionExams(address, uint256) view returns (bytes32)", // Getter for array element
  "function studentExams(address, uint256) view returns (bytes32)", // Getter for array element

  // Functions
  "function assignGrade(bytes32 _examId, address _student, uint256 _grade) external", // Removed onlyVerifiedInstitution, nonReentrant
  "function createExamination(string memory _ipfsHash, uint256 _startTime, uint256 _endTime) external returns (bytes32)", // Removed onlyVerifiedInstitution, nonReentrant
  "function getExamDetails(bytes32 _examId) external view returns (address institution, string memory ipfsHash, uint256 startTime, uint256 endTime, bool isActive)",
  "function getStudentGrade(bytes32 _examId, address _student) external view returns (uint256 grade, bool isGraded)",
  "function registerForExam(bytes32 _examId) external", // Removed onlyVerifiedStudent, nonReentrant
  "function submitAnswers(bytes32 _examId, string memory _answersIpfsHash) external" // Removed onlyVerifiedStudent, nonReentrant
];

// --- Certificates ABI ---
export const CertificatesABI = [
  // Constructor
  "constructor(address _identityContract)",

  // Events
  "event CertificateIssued(bytes32 indexed certificateId, address indexed student, address indexed institution)",
  "event CertificateRevoked(bytes32 indexed certificateId)",

  // State Variable Getters
  "function certificates(bytes32) view returns (address student, address institution, string ipfsHash, uint256 issuedAt, bool isValid)",
  "function identityContract() view returns (address)",

  // Functions
  "function getUserCertificates(address _user) external view returns (tuple(bytes32 certificate, string ipfsHash, bool exist)[] memory)",
  "function issueCertificate(address _student, string memory _ipfsHash) external returns (bytes32)",
  "function revokeCertificate(bytes32 _certificateId) external",
  "function verifyCertificate(bytes32 _certificateId) external view returns (address student, address institution, string memory ipfsHash, uint256 issuedAt, bool isValid)"
];