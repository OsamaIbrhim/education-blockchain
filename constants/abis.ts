// --- ExamManagement ABI ---
export const ExamManagementABI = [
  // Constructor
  "constructor(address _identityContractAddress, address _academicManagerContractAddress)",

  // Events
  "event ExamCreated(bytes32 indexed examId, bytes32 indexed courseId, string title, uint256 examDate)",
  "event ExamUpdated(bytes32 indexed examId, string newTitle, uint256 newExamDate, bool newIsActive)",
  "event StudentsRegistered(bytes32 indexed examId, address[] students)",
  "event ResultSubmitted(bytes32 indexed examId, address indexed student, uint256 score, string grade)",
  "event ExamDeactivated(bytes32 indexed examId)", // New event

  // State Variable Getters
  "function academicManagerContract() view returns (address)", // New getter
  "function examResults(bytes32, address) view returns (uint256 score, string grade, string notes, uint256 submissionTime)", // Updated returns
  "function exams(bytes32) view returns (bytes32 examId, bytes32 courseId, string title, uint256 examDate, address[] students, bool isActive)", // Updated returns
  "function identityContract() view returns (address)",
  "function institutionExams(address, uint256) view returns (bytes32)",
  "function owner() view returns (address)",
  "function paused() view returns (bool)",
  "function studentExams(address, uint256) view returns (bytes32)",

  // Functions
  "function createExam(bytes32 _examId, bytes32 _courseId, string memory _title, uint256 _examDate) external returns (bytes32)", // Updated signature
  "function deactivateExam(bytes32 _examId) external", // New function
  "function getExam(bytes32 _examId) external view returns (bytes32 examId, bytes32 courseId, string memory title, uint256 examDate, address[] memory students, bool isActive)", // Updated returns
  "function getExamResult(bytes32 _examId, address _student) external view returns (uint256 score, string memory grade, string memory notes, uint256 submissionTime)", // Updated returns
  "function getExamStatistics(bytes32 _examId) external view returns (uint256 totalStudents, uint256 passRate, uint256 averageScore)",
  "function getUserExams(address _user) external view returns (bytes32[] memory)",
  "function pause() external",
  "function registerStudentsForExam(bytes32 _examId, address[] memory _studentAddresses) external",
  "function revokeCertificate(bytes32 _certificateId) external",
  "function submitResult(bytes32 _examId, address _student, uint256 _score, string memory _grade, string memory _notes) external",
  "function unpause() external",
  "function updateExam(bytes32 _examId, string memory _newTitle, uint256 _newExamDate, bool _newIsActive) external" // Updated signature
];

// --- Identity ABI ---
export const IdentityABI = [
  // Constructor
  "constructor()",

  // Events
  "event AdminAdded(address indexed admin)",
  "event AdminRemoved(address indexed admin)",
  "event OwnershipTransferred(address indexed previousOwner, address indexed newOwner)",
  "event Paused(address account)",
  "event Unpaused(address account)",
  "event UserRegistered(address indexed userAddress, uint8 indexed role)",
  "event UserVerified(address indexed userAddress)",
  "event VerificationRevoked(address indexed userAddress)",
  "event UserRoleUpdated(address indexed user, uint8 oldRole, uint8 newRole)",
  "event StudentStatusUpdated(address indexed studentAddress, uint8 oldStatus, uint8 newStatus)",

  // State Variable Getters
  "function admins(address) view returns (bool)",
  "function owner() view returns (address)",
  "function paused() view returns (bool)",
  "function users(address) view returns (address userAddress, uint8 role, string nationalId, string firstName, string lastName, string phoneNumber, string email, string[] enrolledCourses, uint8 status, bool isVerified)",

  // Functions
  "function addStudents(address[] memory studentAddresses) external",
  "function completeUserProfile(string memory nationalId, string memory firstName, string memory lastName, string memory phoneNumber, string memory email) external",
  "function getStudentData(address _studentAddress) external view returns (string memory nationalId, string memory firstName, string memory lastName, string memory phoneNumber, string memory email, string[] memory enrolledCourses, uint8 role, bool isVerified, uint8 status)",
  "function getUnverifiedUsers() external view returns (address[] memory)",
  "function getUserRole(address _userAddress) external view returns (uint8)",
  "function isAdmin(address _address) public view returns (bool)",
  "function isStudentEnrolled(address _student) external view returns (bool)",
  "function isVerifiedUser(address _userAddress) external view returns (bool)",
  "function pause() external",
  "function registerUser(address userAddress, uint8 _role, string memory nationalId, string memory firstName, string memory lastName, string memory phoneNumber, string memory email) external",
  "function removeAdmin(address _admin) external",
  "function removeStudents(address[] memory studentAddresses) external",
  "function revokeVerification(address _userAddress) external",
  "function selfRegister(uint8 _role, string memory nationalId, string memory firstName, string memory lastName, string memory phoneNumber, string memory email) external",
  "function unpause() external",
  "function updateStudentStatus(address _studentAddress, uint8 _newStatus) external",
  "function updateUserRole(address _userAddress, uint8 _newRole) external",
  "function userExists(address _userAddress) external view returns (bool)",
  "function verifyUser(address _userAddress) external"
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
  "constructor(address _identityContractAddress, address _academicManagerContractAddress)",

  // Events
  "event CertificateProposed(bytes32 indexed certificateId, address indexed student, string programName, string degreeType, string collegeName)", // Updated event
  "event CertificateIssued(bytes32 indexed certificateId, address indexed student, address indexed issuer, string collegeName)", // Updated event
  "event CertificateRevoked(bytes32 indexed certificateId)",

  // State Variable Getters
  "function academicManagerContract() view returns (address)", // New getter
  "function certificates(bytes32) view returns (bytes32 certificateId, address student, address issuer, string programName, string degreeType, string institutionName, string collegeName, uint256 graduationYear, string grade, bool isCustomDesign, uint256 issuedAt, uint8 state)", // Updated returns (no ipfsHash, new fields, enum as uint8)
  "function identityContract() view returns (address)",
  "function proposedCertificateIds(uint256) view returns (bytes32)", // New getter for array element
  "function owner() view returns (address)",
  "function paused() view returns (bool)",

  // Functions
  "function approveCertificate(bytes32 _certificateId) external", // New function
  "function getProposedCertificateIds() external view returns (bytes32[] memory)", // New function
  "function proposeCertificate(address _student, string memory _programName, string memory _degreeType, string memory _institutionName, string memory _collegeName, uint256 _graduationYear, string memory _grade, bool _isCustomDesign) external returns (bytes32)", // Updated signature (no ipfsHash, new fields)
  "function revokeCertificate(bytes32 _certificateId) external",
  "function verifyCertificate(bytes32 _certificateId) external view returns (address student, address issuer, string memory programName, string memory degreeType, string memory institutionName, string memory collegeName, uint256 graduationYear, string memory grade, bool isCustomDesign, uint256 issuedAt, uint8 state)" // Updated returns
];

// --- CourseManagement ABI ---
export const CourseManagementABI = [
  // Constructor
  "constructor(address _identityContractAddress)",

  // Events
  "event CourseAdded(bytes32 indexed courseId, string name, string department)",
  "event CourseDetailsUpdated(bytes32 indexed courseId, string name, uint256 credits, string department)",
  "event CourseDeactivated(bytes32 indexed courseId)",
  "event CourseOfferingAdded(bytes32 indexed courseId, string indexed semester, string doctorName)",
  "event CourseOfferingUpdated(bytes32 indexed courseId, string indexed semester, string doctorName, uint256 examDate, string bookTitle)",
  "event CurrentActiveSemesterUpdated(string oldSemester, string newSemester)",

  // State Variable Getters
  "function courses(bytes32) view returns (bytes32 courseId, string name, uint256 credits, string department, bool isActive, uint256 creationDate)",
  "function courseOfferings(bytes32, string) view returns (string semester, string doctorName, uint256 examDate, string bookTitle, bool isAvailableForEnrollment)",
  "function courseOfferingTerms(bytes32, uint256) view returns (string)",
  "function departmentCourses(string, uint256) view returns (bytes32)",
  "function currentActiveSemester() view returns (string)",
  "function identityContract() view returns (address)",
  "function owner() view returns (address)",
  "function paused() view returns (bool)",

  // Functions
  "function addCourse(bytes32 _courseId, string memory _name, uint256 _credits, string memory _department) external",
  "function updateCourseStaticDetails(bytes32 _courseId, string memory _newName, uint256 _newCredits, string memory _newDepartment) external",
  "function deactivateCourse(bytes32 _courseId) external",
  "function setCurrentActiveSemester(string memory _semester) external",
  "function addCourseOffering(bytes32 _courseId, string memory _semester, string memory _doctorName, uint256 _examDate, string memory _bookTitle) external",
  "function updateCourseOfferingDetails(bytes32 _courseId, string memory _semester, string memory _newDoctorName, uint256 _newExamDate, string memory _newBookTitle, bool _isAvailableForEnrollment) external",
  "function getCourseStaticDetails(bytes32 _courseId) external view returns (bytes32 courseId, string memory name, uint256 credits, string memory department, bool isActive, uint256 creationDate)",
  "function getCourseOfferingDetails(bytes32 _courseId, string memory _semester) external view returns (string memory semester, string memory doctorName, uint256 examDate, string memory bookTitle, bool isAvailableForEnrollment)",
  "function getLatestCourseOfferingDetails(bytes32 _courseId) external view returns (string memory semester, string memory doctorName, uint256 examDate, string memory bookTitle, bool isAvailableForEnrollment)",
  "function getAllCourseOfferingsForCourse(bytes32 _courseId) external view returns (tuple(string semester, string doctorName, uint256 examDate, string bookTitle, bool isAvailableForEnrollment)[] memory)",
  "function getCoursesByDepartment(string memory _departmentName) external view returns (bytes32[] memory)",
  "function pause() external",
  "function unpause() external"
];

// --- StudentAcademicManager ABI ---
export const StudentAcademicManagerABI = [
  // Constructor
  "constructor(address _identityContractAddress, address _certificatesContractAddress)",

  // Events
  "event CourseRegistered(bytes32 indexed courseId, string name, uint256 credits)",
  "event GradeAssigned(address indexed studentAddress, bytes32 indexed courseId, uint256 score, uint8 status)",
  "event AcademicPerformanceUpdated(address indexed studentAddress, uint256 cumulativeGPA, uint256 totalEarnedCredits, uint256 totalAttemptedCredits)",
  "event SemesterPerformanceUpdated(address indexed studentAddress, uint256 semesterNumber, uint256 semesterGPA, uint256 earnedCreditsThisSemester)",
  "event NewSemesterStarted(address indexed studentAddress, uint256 semesterNumber, uint256 startDate, uint256 endDate)",
  "event SemesterCompleted(address indexed studentAddress, uint256 semesterNumber)",
  "event StudentGraduationProposed(address indexed studentAddress)",
  "event WarningIssued(uint256 indexed warningId, address indexed studentAddress, uint8 warningType, string reason)",
  "event AcademicActionTaken(uint256 indexed actionId, address indexed studentAddress, uint8 actionType, string reason)",

  // State Variable Getters
  "function identityContract() view returns (address)",
  "function certificatesContract() view returns (address)",
  "function studentAcademicRecords(address) view returns (uint256 cumulativeGPA, uint256 cumulativePercentage, string overallGrade, uint256 totalEarnedCredits, uint256 totalAttemptedCredits, uint256 lastUpdated, bool hasProposedGraduation)",
  "function studentSemesterPerformance(address, uint256) view returns (uint256 semesterGPA, uint256 semesterPercentage, string semesterGrade, uint256 earnedCreditsThisSemester, uint256 totalAttemptedCreditsThisSemester, uint256 startDate, uint256 endDate, bool isCompleted)",
  "function studentGrades(address, bytes32) view returns (uint256 score, uint8 status, uint256 timestamp)",
  "function courses(bytes32) view returns (bytes32 courseId, string name, uint256 credits, uint256 passingScore, bool isActive)",
  "function currentSemesterNumber(address) view returns (uint256)",
  "function warnings(uint256) view returns (uint256 warningId, address studentAddress, uint8 warningType, string reason, uint256 timestamp, bool isActive)",
  "function studentWarnings(address, uint256) view returns (uint256)",
  "function academicActions(uint256) view returns (uint256 actionId, address studentAddress, uint8 actionType, string reason, uint256 startDate, uint256 endDate, bool isActive)",
  "function studentAcademicActions(address, uint256) view returns (uint256)",
  "function institutionSettings() view returns (uint256 minCreditsPerSemester, uint256 maxCreditsPerSemester, uint256 totalCreditsRequiredForGraduation, uint256 minGPARequiredForGraduation)",
  "function owner() view returns (address)",
  "function paused() view returns (bool)",

  // Functions
  "function registerCourse(bytes32 _courseId, string memory _name, uint256 _credits, uint256 _passingScore) external",
  "function assignGrade(address _studentAddress, bytes32 _courseId, uint256 _score) external",
  "function issueWarning(address _studentAddress, uint8 _warningType, string memory _reason) external",
  "function takeAcademicAction(address _studentAddress, uint8 _actionType, string memory _reason, uint256 _durationInDays) external",
  "function startNewSemester(address _studentAddress, uint256 _endDate) external",
  "function completeSemester(address _studentAddress, string memory _collegeName) external",
  "function getOverallAcademicPerformance(address _studentAddress) external view returns (uint256 cumulativeGPA, uint256 cumulativePercentage, string memory overallGrade, uint256 totalEarnedCredits, uint256 totalAttemptedCredits, uint256 lastUpdated, bool hasProposedGraduation)",
  "function getSemesterPerformanceDetails(address _studentAddress, uint256 _semesterNumber) external view returns (uint256 semesterGPA, uint256 semesterPercentage, string memory semesterGrade, uint256 earnedCreditsThisSemester, uint256 totalAttemptedCreditsThisSemester, uint256 startDate, uint256 endDate, bool isCompleted)",
  "function getCourseDetails(bytes32 _courseId) external view returns (bytes32 courseId, string memory name, uint256 credits, uint256 passingScore, bool isActive)",
  "function getStudentGrade(address _studentAddress, bytes32 _courseId) external view returns (uint256 score, uint8 status, uint256 timestamp)",
  "function getStudentWarnings(address _studentAddress) external view returns (uint256[] memory)",
  "function getWarningDetails(uint256 _warningId) external view returns (uint256 warningId, address studentAddress, uint8 warningType, string memory reason, uint256 timestamp, bool isActive)",
  "function getStudentAcademicActions(address _studentAddress) external view returns (uint256[] memory)",
  "function getAcademicActionDetails(uint256 _actionId) external view returns (uint256 actionId, address studentAddress, uint8 actionType, string memory reason, uint256 startDate, uint256 endDate, bool isActive)",
  "function getCurrentSemesterNumber(address _studentAddress) external view returns (uint256)",
  "function pause() external",
  "function unpause() external",
  "function setCertificatesContract(address _certificatesContractAddress) external"
];