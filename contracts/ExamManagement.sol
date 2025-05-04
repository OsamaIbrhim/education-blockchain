// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

interface IIdentity {
    enum UserRole { NONE, STUDENT, INSTITUTION, EMPLOYER, ADMIN }
    
    function getUserRole(address _userAddress) external view returns (UserRole);
    function isVerifiedUser(address _userAddress) external view returns (bool);
    function isInstitution(address _address) external view returns (bool);
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

    struct Certificate {
        address student;
        address issuer;
        string ipfsHash;
        uint256 issuedAt;
        bool exists;
    }

    struct ExamResult {
        uint256 score;
        string grade;
        string notes;
        bool exists;
    }

    // Mappings
    mapping(address => Institution) public institutions;
    mapping(address => Student) public students;
    mapping(address => mapping(address => bool)) public institutionStudents;
    mapping(bytes32 => Exam) public exams;
    mapping(bytes32 => mapping(address => ExamResult)) public examResults;
    mapping(bytes32 => Certificate) public certificates;
    mapping(address => bytes32[]) public institutionExams;
    
    // Counters
    Counters.Counter private _examIds;
    Counters.Counter private _certificateIds;

    // Events
    event InstitutionRegistered(address indexed institution, string name);
    event InstitutionVerified(address indexed institution);
    event StudentAdded(address indexed institution, address indexed student);
    event StudentStatusUpdated(address indexed student, string status);
    event ExamCreated(bytes32 indexed examId, string title);
    event ExamStatusUpdated(bytes32 indexed examId, string status);
    event StudentsRegistered(bytes32 indexed examId, address[] students);
    event ResultSubmitted(bytes32 indexed examId, address indexed student);
    event CertificateIssued(bytes32 indexed certificateId, address indexed student);
    event InstitutionProfileUpdated(address indexed institution, string name);

    constructor(address _identityContractAddress) {
        identityContract = IIdentity(_identityContractAddress);
    }

    // Modifiers
    modifier onlyVerifiedInstitution() {
        require(identityContract.isInstitution(msg.sender), "Not a registered institution");
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

    // Institution Management
    function registerInstitution(
        string memory name,
        string memory description,
        string memory physicalAddress,
        string memory email,
        string memory phone,
        string memory website,
        string memory logo,
        string memory ministry,
        string memory university,
        string memory college
    ) external {
        require(!institutions[msg.sender].exists, "Institution already registered");
        
        institutions[msg.sender] = Institution({
            name: name,
            description: description,
            physicalAddress: physicalAddress,
            email: email,
            phone: phone,
            website: website,
            logo: logo,
            ministry: ministry,
            university: university,
            college: college,
            isVerified: false,
            exists: true
        });

        emit InstitutionRegistered(msg.sender, name);
    }

    function verifyInstitution(address institution) external onlyOwner {
        require(institutions[institution].exists, "Institution does not exist");
        institutions[institution].isVerified = true;
        emit InstitutionVerified(institution);
    }

    function updateInstitutionProfile(
        string memory name,
        string memory ministry,
        string memory university,
        string memory college,
        string memory description,
        string memory logo,
        string memory website,
        string memory email,
        string memory phone
    ) external {
        require(institutions[msg.sender].exists, "Institution does not exist");
        
        Institution storage institution = institutions[msg.sender];
        institution.name = name;
        institution.ministry = ministry;
        institution.university = university;
        institution.college = college;
        institution.description = description;
        institution.logo = logo;
        institution.website = website;
        institution.email = email;
        institution.phone = phone;

        emit InstitutionProfileUpdated(msg.sender, name);
    }

    // Student Management
    function addStudent(
        address studentAddress,
        string memory name,
        string memory email
    ) external onlyVerifiedInstitution {
        require(!students[studentAddress].exists, "Student already exists");
        require(identityContract.getUserRole(studentAddress) == IIdentity.UserRole.STUDENT, "Address is not registered as a student");
        
        students[studentAddress] = Student({
            name: name,
            email: email,
            enrollmentDate: block.timestamp,
            status: "active",
            exists: true
        });

        institutionStudents[msg.sender][studentAddress] = true;
        emit StudentAdded(msg.sender, studentAddress);
    }

    function updateStudentStatus(
        address studentAddress,
        string memory newStatus
    ) external onlyVerifiedInstitution onlyExistingStudent(studentAddress) {
        require(institutionStudents[msg.sender][studentAddress], "Student not enrolled in this institution");
        students[studentAddress].status = newStatus;
        emit StudentStatusUpdated(studentAddress, newStatus);
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
        for (uint i = 0; i < studentAddresses.length; i++) {
            require(
                institutionStudents[msg.sender][studentAddresses[i]],
                "One or more students not enrolled in this institution"
            );
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

    // Certificate Management
    function issueCertificate(
        address student,
        string memory ipfsHash
    ) external onlyVerifiedInstitution onlyExistingStudent(student) {
        require(
            institutionStudents[msg.sender][student],
            "Student not enrolled in this institution"
        );

        _certificateIds.increment();
        bytes32 certificateId = keccak256(abi.encodePacked(_certificateIds.current(), msg.sender, student));
        
        certificates[certificateId] = Certificate({
            student: student,
            issuer: msg.sender,
            ipfsHash: ipfsHash,
            issuedAt: block.timestamp,
            exists: true
        });

        emit CertificateIssued(certificateId, student);
    }

    // View Functions
    function getInstitution(address institution) external view returns (
        string memory name,
        string memory description,
        string memory physicalAddress,
        string memory email,
        string memory phone,
        string memory website,
        string memory logo,
        string memory ministry,
        string memory university,
        string memory college,
        bool isVerified
    ) {
        Institution memory inst = institutions[institution];
        return (
            inst.name,
            inst.description,
            inst.physicalAddress,
            inst.email,
            inst.phone,
            inst.website,
            inst.logo,
            inst.ministry,
            inst.university,
            inst.college,
            inst.isVerified
        );
    }

    function getStudent(address student) external view returns (
        string memory name,
        string memory email,
        uint256 enrollmentDate,
        string memory status
    ) {
        Student memory stud = students[student];
        return (
            stud.name,
            stud.email,
            stud.enrollmentDate,
            stud.status
        );
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

    function getInstitutionExamList(address institution) external view returns (bytes32[] memory) {
        require(institutions[institution].exists, "Institution does not exist");
        return institutionExams[institution];
    }

    function getExam(bytes32 examId) external view returns (Exam memory) {
        require(exams[examId].exists, "Exam does not exist");
        return exams[examId];
    }
}