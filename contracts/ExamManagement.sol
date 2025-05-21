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

    struct Exam {
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
    mapping(bytes32 => Exam) public exams;
    mapping(bytes32 => mapping(address => ExamResult)) public examResults;
    mapping(address => bytes32[]) public institutionExams;
    mapping(address => bytes32[]) public studentExams;

    // Counters
    Counters.Counter private _examIds;

    // Events
    event ExamCreated(bytes32 indexed examId, string title);
    event ExamUpdated(bytes32 indexed examId, string ipfsHash, bool exists);
    event StudentsRegistered(bytes32 indexed examId, address[] students);
    event ResultSubmitted(bytes32 indexed examId, address indexed student);

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
    
    // Exam Management
    function createExam(
        string memory ipfsHash
    ) external onlyVerifiedInstitution returns (bytes32) {
        _examIds.increment();
        bytes32 examId = keccak256(abi.encodePacked(_examIds.current(), msg.sender));
        
        exams[examId] = Exam({
            ipfsHash: ipfsHash,
            students: new address[](0),
            exists: true
        });

        institutionExams[msg.sender].push(examId);

        emit ExamCreated(examId, ipfsHash);
        return examId;
    }

    function updateExam(
        bytes32 examId,
        string memory newIpfsHash,
        bool newExists
    ) external onlyVerifiedInstitution onlyExistingExam(examId) {
        exams[examId].ipfsHash = newIpfsHash;
        exams[examId].exists = newExists;
        emit ExamUpdated(examId, newIpfsHash, newExists);
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
                exams[examId].students.push(studentAddress);
            } else {
                revert("Student already registered for this exam");
            }
        }

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
        require(identityContract.isStudentEnrolled(msg.sender, student), "Student is not enrolled in this institution");

        
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
        // require(exams[examId].exists, "Exam does not exist");
        return exams[examId];
    }
}