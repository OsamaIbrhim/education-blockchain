// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "./Identity.sol"; // استيراد عقد Identity
import "./StudentAcademicManager.sol"; // استيراد عقد StudentAcademicManager لربط الدرجات

// واجهة لعقد Identity (يجب أن تتطابق تمامًا مع Identity.sol)
interface IIdentity {
    enum UserRole { NONE, STUDENT, EMPLOYER, ADMIN } // تحديث الأدوار لتتناسب مع Identity.sol
    
    function getUserRole(address _userAddress) external view returns (UserRole);
    function isVerifiedUser(address _userAddress) external view returns (bool);
    function userExists(address _userAddress) external view returns (bool);
    // تم حذف isStudentEnrolled لأنه غير موجود في Identity.sol الأخير
    function isAdmin(address _userAddress) external view returns (bool); // إضافة دالة isAdmin
}

contract ExamManagement is Ownable, Pausable {
    using Counters for Counters.Counter;

    IIdentity public identityContract;
    StudentAcademicManager public academicManagerContract; // مرجع لعقد StudentAcademicManager

    // هيكل بيانات الامتحان
    struct Exam {
        bytes32 examId;        // معرف فريد للامتحان
        bytes32 courseId;      // معرف المقرر الذي يتبع له هذا الامتحان
        string title;          // عنوان الامتحان (مثل "امتحان برمجة متقدمة - منتصف الترم")
        uint256 examDate;      // تاريخ ووقت الامتحان (timestamp)
        address[] students;    // قائمة الطلاب المسجلين لهذا الامتحان
        bool isActive;         // هل الامتحان نشط (متاح لتسجيل الطلاب أو إرسال النتائج)
    }

    // هيكل بيانات نتيجة الامتحان
    struct ExamResult {
        uint256 score;         // درجة الطالب في الامتحان
        string grade;          // التقدير الحرفي للامتحان (يمكن أن يختلف عن تقدير المقرر)
        string notes;          // أي ملاحظات إضافية حول النتيجة
        uint256 submissionTime; // وقت تقديم النتيجة
    }

    // Mappings
    // exams: تخزين تفاصيل الامتحان الأساسية بواسطة معرف الامتحان
    mapping(bytes32 => Exam) public exams;
    // examResults: تخزين نتائج الطلاب في الامتحانات (examId => studentAddress => ExamResult)
    mapping(bytes32 => mapping(address => ExamResult)) public examResults;
    // institutionExams: قائمة الامتحانات التي أنشأتها كل مؤسسة (أو Admin/Owner)
    mapping(address => bytes32[]) public institutionExams;
    // studentExams: قائمة الامتحانات التي سجل فيها كل طالب
    mapping(address => bytes32[]) public studentExams;

    // Counters (يمكن استخدامها لتوليد معرفات فريدة إذا لم نستخدم keccak256 مباشرة)
    Counters.Counter private _examCounter; // تم تغيير الاسم ليكون أكثر وضوحًا

    // Events
    event ExamCreated(bytes32 indexed examId, bytes32 indexed courseId, string title, uint256 examDate);
    event ExamUpdated(bytes32 indexed examId, string newTitle, uint256 newExamDate, bool newIsActive);
    event StudentsRegistered(bytes32 indexed examId, address[] students);
    event ResultSubmitted(bytes32 indexed examId, address indexed student, uint256 score, string grade);
    event ExamDeactivated(bytes32 indexed examId);

    /**
     * @dev Constructor for the ExamManagement contract.
     * @param _identityContractAddress The address of the Identity contract.
     * @param _academicManagerContractAddress The address of the StudentAcademicManager contract.
     */
    constructor(address _identityContractAddress, address _academicManagerContractAddress) Pausable() {
        require(_identityContractAddress != address(0), "ExamManagement: Invalid Identity contract address.");
        require(_academicManagerContractAddress != address(0), "ExamManagement: Invalid StudentAcademicManager contract address.");
        identityContract = IIdentity(_identityContractAddress);
        academicManagerContract = StudentAcademicManager(_academicManagerContractAddress);
    }

    /**
     * @dev Modifier to ensure that only the contract owner (University) or an authorized admin can call the function.
     */
    modifier onlyAdminOrOwner() {
        require(identityContract.isAdmin(msg.sender), "ExamManagement: Caller is not authorized as Admin or Owner.");
        _;
    }

    /**
     * @dev Modifier to ensure an exam with the given ID exists and is active.
     * @param _examId The unique identifier of the exam.
     */
    modifier onlyExistingAndActiveExam(bytes32 _examId) {
        require(exams[_examId].examId != bytes32(0), "ExamManagement: Exam does not exist.");
        require(exams[_examId].isActive, "ExamManagement: Exam is not active.");
        _;
    }
    
    /**
     * @dev Creates a new exam entry.
     * Only an Admin or Owner can create exams.
     * @param _examId A unique identifier for the exam. This ID is chosen by the caller.
     * @param _courseId The ID of the course this exam belongs to (from CourseManagement.sol).
     * @param _title The title/name of the exam.
     * @param _examDate The timestamp of the exam date.
     * @return The ID of the newly created exam.
     */
    function createExam(
        bytes32 _examId,
        bytes32 _courseId,
        string memory _title,
        uint256 _examDate
    ) external onlyAdminOrOwner whenNotPaused returns (bytes32) {
        require(exams[_examId].examId == bytes32(0), "ExamManagement: Exam with this ID already exists.");
        require(bytes(_title).length > 0, "ExamManagement: Exam title cannot be empty.");
        require(_examDate > 0, "ExamManagement: Exam date must be valid.");
        require(_courseId != bytes32(0), "ExamManagement: Course ID cannot be empty.");

        exams[_examId] = Exam({
            examId: _examId,
            courseId: _courseId,
            title: _title,
            examDate: _examDate,
            students: new address[](0),
            isActive: true
        });

        // Add the exam to the institution's (Admin/Owner's) list of created exams
        institutionExams[msg.sender].push(_examId);

        emit ExamCreated(_examId, _courseId, _title, _examDate);
        return _examId;
    }

    /**
     * @dev Updates the details of an existing exam.
     * Only an Admin or Owner can update exam details.
     * @param _examId The ID of the exam to update.
     * @param _newTitle The new title of the exam.
     * @param _newExamDate The new exam date timestamp.
     * @param _newIsActive The new active status of the exam.
     */
    function updateExam(
        bytes32 _examId,
        string memory _newTitle,
        uint256 _newExamDate,
        bool _newIsActive
    ) external onlyAdminOrOwner whenNotPaused onlyExistingAndActiveExam(_examId) {
        require(bytes(_newTitle).length > 0, "ExamManagement: New exam title cannot be empty.");
        require(_newExamDate > 0, "ExamManagement: New exam date must be valid.");

        Exam storage examToUpdate = exams[_examId];
        examToUpdate.title = _newTitle;
        examToUpdate.examDate = _newExamDate;
        examToUpdate.isActive = _newIsActive; // Allow deactivating an exam

        emit ExamUpdated(_examId, _newTitle, _newExamDate, _newIsActive);
    }

    /**
     * @dev Deactivates an exam, preventing further student registrations or result submissions.
     * @param _examId The ID of the exam to deactivate.
     */
    function deactivateExam(bytes32 _examId) external onlyAdminOrOwner whenNotPaused onlyExistingAndActiveExam(_examId) {
        require(exams[_examId].isActive, "ExamManagement: Exam is already inactive.");
        exams[_examId].isActive = false;
        emit ExamDeactivated(_examId);
    }

    /**
     * @dev Registers students for a specific exam.
     * Only an Admin or Owner can register students.
     * Each student must exist and be a verified student in the Identity contract.
     * @param _examId The ID of the exam.
     * @param _studentAddresses An array of student addresses to register.
     */
    function registerStudentsForExam(
        bytes32 _examId,
        address[] memory _studentAddresses
    ) external onlyAdminOrOwner whenNotPaused onlyExistingAndActiveExam(_examId) {
        require(_studentAddresses.length > 0, "ExamManagement: Student list cannot be empty.");

        for (uint i = 0; i < _studentAddresses.length; i++) {
            address studentAddress = _studentAddresses[i];
            // Verify student existence and role in Identity contract
            require(identityContract.userExists(studentAddress), "ExamManagement: Student does not exist in Identity.");
            require(identityContract.getUserRole(studentAddress) == IIdentity.UserRole.STUDENT, "ExamManagement: User is not a student in Identity.");
            require(identityContract.isVerifiedUser(studentAddress), "ExamManagement: Student is not verified in Identity."); // Check verification status

            // Prevent duplicate registration for the same exam
            bool alreadyRegistered = false;
            for (uint j = 0; j < studentExams[studentAddress].length; j++) {
                if (studentExams[studentAddress][j] == _examId) {
                    alreadyRegistered = true;
                    break;
                }
            }
            require(!alreadyRegistered, "ExamManagement: Student already registered for this exam.");

            // Add exam to student's list and student to exam's list
            studentExams[studentAddress].push(_examId);
            exams[_examId].students.push(studentAddress);
        }

        emit StudentsRegistered(_examId, _studentAddresses);
    }

    /**
     * @dev Submits the result for a student in a specific exam.
     * Only an Admin or Owner can submit results.
     * After recording the result, it calls `assignGrade` in `StudentAcademicManager.sol`
     * to update the student's overall academic performance.
     * @param _examId The ID of the exam.
     * @param _student The address of the student.
     * @param _score The score obtained by the student.
     * @param _grade The letter grade for this specific exam.
     * @param _notes Any additional notes about the result.
     */
    function submitResult(
        bytes32 _examId,
        address _student,
        uint256 _score,
        string memory _grade,
        string memory _notes
    ) external onlyAdminOrOwner whenNotPaused onlyExistingAndActiveExam(_examId) {
        // Ensure the student is registered for this exam
        bool isStudentRegistered = false;
        for (uint i = 0; i < exams[_examId].students.length; i++) {
            if (exams[_examId].students[i] == _student) {
                isStudentRegistered = true;
                break;
            }
        }
        require(isStudentRegistered, "ExamManagement: Student is not registered for this exam.");

        // Ensure score is valid (assuming max score is 100 for percentage-based grading)
        require(_score <= 100, "ExamManagement: Score must be between 0 and 100.");
        require(bytes(_grade).length > 0, "ExamManagement: Grade cannot be empty.");

        // Store the exam result
        examResults[_examId][_student] = ExamResult({
            score: _score,
            grade: _grade,
            notes: _notes,
            submissionTime: block.timestamp
        });

        // Call StudentAcademicManager to assign this grade to the relevant course
        // The academic manager will use this score to calculate GPA and overall performance.
        academicManagerContract.assignGrade(_student, exams[_examId].courseId, _score);

        emit ResultSubmitted(_examId, _student, _score, _grade);
    }

    /**
     * @dev Retrieves the result of a specific student for a given exam.
     * @param _examId The ID of the exam.
     * @param _student The address of the student.
     * @return score The student's score.
     * @return grade The letter grade.
     * @return notes Any additional notes.
     * @return submissionTime The timestamp of result submission.
     */
    function getExamResult(bytes32 _examId, address _student) external view returns (
        uint256 score,
        string memory grade,
        string memory notes,
        uint256 submissionTime
    ) {
        ExamResult memory result = examResults[_examId][_student];
        // Ensure result exists for the student in this exam
        require(result.submissionTime > 0, "ExamManagement: Result not found for this student in this exam.");
        return (
            result.score,
            result.grade,
            result.notes,
            result.submissionTime
        );
    }

    /**
     * @dev Retrieves statistics for a specific exam, including total students, pass rate, and average score.
     * @param _examId The ID of the exam.
     * @return totalStudents The total number of students who have results for this exam.
     * @return passRate The percentage of students who passed (score >= 60).
     * @return averageScore The average score of all students with results.
     */
    function getExamStatistics(bytes32 _examId) external view onlyExistingAndActiveExam(_examId) returns (
        uint256 totalStudents,
        uint256 passRate,
        uint256 averageScore
    ) {
        Exam memory exam = exams[_examId];
        uint256 total = 0;
        uint256 passed = 0;
        uint256 scoreSum = 0;
        
        for (uint i = 0; i < exam.students.length; i++) {
            ExamResult memory result = examResults[_examId][exam.students[i]];
            if (result.submissionTime > 0) { // Check if result exists
                total++;
                scoreSum += result.score;
                if (result.score >= 60) { // Assuming 60 is the passing score
                    passed++;
                }
            }
        }
        
        return (
            total,
            total > 0 ? (passed * 100) / total : 0, // Pass rate as percentage
            total > 0 ? scoreSum / total : 0        // Average score
        );
    }

    /**
     * @dev Retrieves a list of exam IDs associated with a specific user (institution/admin or student).
     * Institutions/Admins get exams they created. Students get exams they are registered for.
     * @param _user The address of the user.
     * @return An array of bytes32 containing exam IDs.
     */
    function getUserExams(address _user) external view returns (bytes32[] memory) {
        IIdentity.UserRole role = identityContract.getUserRole(_user);

        if (role == IIdentity.UserRole.ADMIN) { // Admins manage institutionExams
            return institutionExams[_user];
        } else if (role == IIdentity.UserRole.STUDENT) {
            return studentExams[_user];
        } else {
            revert("ExamManagement: Unsupported role or user does not exist in Identity contract.");
        }
    }

    /**
     * @dev Retrieves the full details of a specific exam.
     * @param _examId The ID of the exam.
     * @return examId The unique identifier of the exam.
     * @return courseId The ID of the course this exam belongs to.
     * @return title The title/name of the exam.
     * @return examDate The timestamp of the exam date.
     * @return students An array of student addresses registered for this exam.
     * @return isActive True if the exam is active.
     */
    function getExam(bytes32 _examId) external view returns (
        bytes32 examId,
        bytes32 courseId,
        string memory title,
        uint256 examDate,
        address[] memory students,
        bool isActive
    ) {
        Exam memory exam = exams[_examId];
        require(exam.examId != bytes32(0), "ExamManagement: Exam does not exist."); // Check if exam exists
        return (
            exam.examId,
            exam.courseId,
            exam.title,
            exam.examDate,
            exam.students,
            exam.isActive
        );
    }

    /**
     * @dev Pauses the contract, preventing certain state-changing operations.
     * Only the owner (University) or an Admin can pause the contract.
     */
    function pause() external onlyAdminOrOwner {
        _pause();
    }

    /**
     * @dev Unpauses the contract, allowing previously restricted state-changing operations.
     * Only the owner (University) or an Admin can unpause the contract.
     */
    function unpause() external onlyAdminOrOwner {
        _unpause();
    }
}