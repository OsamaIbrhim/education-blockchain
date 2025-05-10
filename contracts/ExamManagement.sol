// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

interface IIdentity {
    enum UserRole { NONE, STUDENT, INSTITUTION, EMPLOYER, ADMIN }
    
    function getUserRole(address _userAddress) external view returns (UserRole);
    function isVerifiedUser(address _userAddress) external view returns (bool);
    function userExists(address _userAddress) external view returns (bool);
    function isStudentEnrolled(address _institution, address _student) external view returns (bool);
}

contract ExamManagement is Ownable, Pausable {
    using Counters for Counters.Counter;

    IIdentity public identityContract;

    struct Institution {
        string name;
        string description;
        string physicalAddress;
        string email;
        string phone;
        string website;
        string logo;
        string ministry;
        string university;
        string college;
        bool isVerified;
        bool exists;
    }

    struct Student {
        string name;
        string email;
        uint256 enrollmentDate;
        string status; // "active", "inactive", "graduated"
        bool exists;
    }

    struct Exam {
        string title;
        string description;
        uint256 date;
        uint256 duration;
        string status; // "pending", "active", "completed"
        string ipfsHash;
        address[] students;
        bool exists;
    }

    struct ExamResult {
        uint256 score;
        string grade;
        string notes;
        bool exists;
    }

    // Mappings
    mapping(address => Student) public students;
    mapping(address => mapping(address => bool)) public institutionStudents;
    mapping(bytes32 => Exam) public exams;
    mapping(bytes32 => mapping(address => ExamResult)) public examResults;
    mapping(address => bytes32[]) public institutionExams;
    mapping(address => bytes32[]) public studentExams;

    // Counters
    Counters.Counter private _examIds;

    // Events
    event InstitutionRegistered(address indexed institution, string name);
    event InstitutionVerified(address indexed institution);
    event StudentAdded(address indexed institution, address indexed student);
    event StudentStatusUpdated(address indexed student, string status);
    event ExamCreated(bytes32 indexed examId, string title);
    event ExamStatusUpdated(bytes32 indexed examId, string status);
    event StudentsRegistered(bytes32 indexed examId, address[] students);
    event ResultSubmitted(bytes32 indexed examId, address indexed student);
    event InstitutionProfileUpdated(address indexed institution, string name);

    constructor(address _identityContractAddress) {
        identityContract = IIdentity(_identityContractAddress);
    }

    // Modifiers
    modifier onlyVerifiedInstitution() {
        require(identityContract.getUserRole(msg.sender) == IIdentity.UserRole.INSTITUTION, "Not a registered institution");
        require(identityContract.isVerifiedUser(msg.sender), "Institution is not verified");
        _;
    }

    modifier onlyExistingExam(bytes32 examId) {
        require(exams[examId].exists, "Exam does not exist");
        _;
    }

    modifier onlyExistingStudent(address student) {
        require(students[student].exists, "Student does not exist");
        _;
    }

    // Exam Management
    function createExam(
        string memory title,
        string memory description,
        uint256 date,
        uint256 duration,
        string memory ipfsHash
    ) external onlyVerifiedInstitution returns (bytes32) {
        _examIds.increment();
        bytes32 examId = keccak256(abi.encodePacked(_examIds.current(), msg.sender));
        
        exams[examId] = Exam({
            title: title,
            description: description,
            date: date,
            duration: duration,
            status: "pending",
            ipfsHash: ipfsHash,
            students: new address[](0),
            exists: true
        });

        institutionExams[msg.sender].push(examId);

        emit ExamCreated(examId, title);
        return examId;
    }

    function updateExamStatus(
        bytes32 examId,
        string memory newStatus
    ) external onlyVerifiedInstitution onlyExistingExam(examId) {
        exams[examId].status = newStatus;
        emit ExamStatusUpdated(examId, newStatus);
    }

    function registerStudentsForExam(
        bytes32 examId,
        address[] memory studentAddresses
    ) external onlyVerifiedInstitution onlyExistingExam(examId) {
        require(studentAddresses.length > 0, "Student list cannot be empty");

        for (uint i = 0; i < studentAddresses.length; i++) {
            address studentAddress = studentAddresses[i];
            require(identityContract.userExists(studentAddress), "Student does not exist in Identity");
            require(identityContract.getUserRole(studentAddress) == IIdentity.UserRole.STUDENT, "User is not a student in Identity");
            require(identityContract.isStudentEnrolled(msg.sender, studentAddress), "Student is not enrolled in this institution");

            bool alreadyRegistered = false;
            for (uint j = 0; j < studentExams[studentAddress].length; j++) {
                if (studentExams[studentAddress][j] == examId) {
                    alreadyRegistered = true;
                    break;
                }
            }

            if (!alreadyRegistered) {
                studentExams[studentAddress].push(examId);
            } else {
                revert("Student already registered for this exam");
            }
        }

        exams[examId].students = studentAddresses;
        emit StudentsRegistered(examId, studentAddresses);
    }

    // Result Management
    function submitResult(
        bytes32 examId,
        address student,
        uint256 score,
        string memory grade,
        string memory notes
    ) external onlyVerifiedInstitution onlyExistingExam(examId) {
        require(
            institutionStudents[msg.sender][student],
            "Student not enrolled in this institution"
        );
        
        examResults[examId][student] = ExamResult({
            score: score,
            grade: grade,
            notes: notes,
            exists: true
        });

        emit ResultSubmitted(examId, student);
    }

    function getExamResult(bytes32 examId, address student) external view returns (
        uint256 score,
        string memory grade,
        string memory notes
    ) {
        ExamResult memory result = examResults[examId][student];
        return (
            result.score,
            result.grade,
            result.notes
        );
    }

    function getExamStatistics(bytes32 examId) external view returns (
        uint256 totalStudents,
        uint256 passRate,
        uint256 averageScore
    ) {
        Exam memory exam = exams[examId];
        uint256 total = 0;
        uint256 passed = 0;
        uint256 scoreSum = 0;
        
        for (uint i = 0; i < exam.students.length; i++) {
            ExamResult memory result = examResults[examId][exam.students[i]];
            if (result.exists) {
                total++;
                scoreSum += result.score;
                if (result.score >= 60) {
                    passed++;
                }
            }
        }
        
        return (
            total,
            total > 0 ? (passed * 100) / total : 0,
            total > 0 ? scoreSum / total : 0
        );
    }

    function getUserExams(address user) external view returns (bytes32[] memory) {
        IIdentity.UserRole role = identityContract.getUserRole(user);

        if (role == IIdentity.UserRole.INSTITUTION) {
            return institutionExams[user];
        } else if (role == IIdentity.UserRole.STUDENT) {
            return studentExams[user];
        } else {
            revert("Unsupported role or user does not exist");
        }
    }

    function getExam(bytes32 examId) external view returns (Exam memory) {
        require(exams[examId].exists, "Exam does not exist");
        return exams[examId];
    }
}