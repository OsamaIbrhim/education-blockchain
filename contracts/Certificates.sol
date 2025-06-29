// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./Identity.sol";
import "./StudentAcademicManager.sol"; // Import StudentAcademicManager for graduation status check

contract Certificates is ReentrancyGuard {
    Identity public identityContract;
    StudentAcademicManager public academicManagerContract; // مرجع لعقد StudentAcademicManager

    // حالات الشهادة لتمثيل دورة حياة الشهادة
    enum CertificateState {
        PROPOSED, // الشهادة مقترحة تلقائيًا من النظام، في انتظار مراجعة واعتماد الجامعة
        ISSUED,   // الشهادة تم اعتمادها وصدرت رسميًا
        REVOKED   // الشهادة تم إلغاؤها بعد إصدارها
    }

    // هيكل بيانات الشهادة
    struct Certificate {
        bytes32 certificateId; // معرف فريد للشهادة
        address student;       // عنوان محفظة الطالب
        address issuer;        // عنوان الجهة المصدرة (الجامعة/الـ Admin الذي اعتمدها)
        
        // بيانات الشهادة الأساسية المخزنة مباشرة في العقد
        string programName;    // اسم البرنامج الدراسي (مثلاً "هندسة حاسوب")
        string degreeType;     // نوع الدرجة العلمية (مثلاً "بكالوريوس")
        string institutionName; // اسم الجامعة المصدرة للشهادة (يمكن أن يكون ثابتًا أو يتم تمريره)
        string collegeName;    // اسم الكلية التي تخرج منها الطالب
        uint256 graduationYear; // سنة التخرج
        string grade;          // التقدير النهائي للطالب (مثلاً "ممتاز"، "جيد جداً")
        bool isCustomDesign;   // هل الشهادة بتصميم خاص؟

        uint256 issuedAt;      // وقت اقتراح أو اعتماد الشهادة
        CertificateState state; // حالة الشهادة (مقترحة، صادرة، ملغاة)
    }
    
    // تخزين الشهادات المقترحة/الصادرة/الملغاة بمعرفاتها
    mapping(bytes32 => Certificate) public certificates;
    // قائمة بالشهادات المقترحة فقط، لسهولة مراجعتها من قبل الجامعة
    bytes32[] public proposedCertificateIds;

    // أحداث لتتبع دورة حياة الشهادات
    event CertificateProposed(bytes32 indexed certificateId, address indexed student, string programName, string degreeType, string collegeName);
    event CertificateIssued(bytes32 indexed certificateId, address indexed student, address indexed issuer, string collegeName);
    event CertificateRevoked(bytes32 indexed certificateId);    /**
     * @dev Constructor for the Certificates contract.
     * @param _identityContractAddress The address of the Identity contract.
     * @param _academicManagerContractAddress The address of the StudentAcademicManager contract.
     */
    constructor(address _identityContractAddress, address _academicManagerContractAddress) {
        require(_identityContractAddress != address(0), "Certificates: Invalid Identity contract address.");
        require(_academicManagerContractAddress != address(0), "Certificates: Invalid StudentAcademicManager contract address.");
        identityContract = Identity(_identityContractAddress);
        academicManagerContract = StudentAcademicManager(_academicManagerContractAddress);
    }
    
    /**
     * @dev Modifier to restrict access to only the contract owner or an authorized admin from the Identity contract.
     */
    modifier onlyAdminOrOwner() {
        require(identityContract.isAdmin(msg.sender), "Certificates: Caller is not authorized as Admin or Owner.");
        _;
    }

    /**
     * @dev Proposes a graduation certificate for a student automatically by the StudentAcademicManager system.
     * This function can only be called by the authorized StudentAcademicManager contract.
     * @param _student The address of the student.
     * @param _programName The name of the academic program/major.
     * @param _degreeType The type of degree (e.g., "Bachelor's", "Master's").
     * @param _institutionName The name of the issuing institution/university.
     * @param _collegeName The name of the college within the institution.
     * @param _graduationYear The year of graduation.
     * @param _grade The final academic grade (e.g., "Excellent", "Very Good").
     * @param _isCustomDesign A flag indicating if the certificate has a custom design.
     * @return certificateId The ID of the proposed certificate.
     */
    function proposeCertificate(
        address _student,
        string memory _programName,
        string memory _degreeType,
        string memory _institutionName,
        string memory _collegeName,
        uint256 _graduationYear,
        string memory _grade,
        bool _isCustomDesign
    ) external nonReentrant returns (bytes32) {
        // Ensure the caller is the authorized StudentAcademicManager contract
        require(msg.sender == address(academicManagerContract), "Certificates: Only Academic Manager can propose certificates.");
        
        // Ensure the recipient is a registered and verified student in the Identity contract
        // Corrected destructuring to match the 9-field User struct getter (enrolledCourses is skipped)
        ( , Identity.UserRole role, , , , , , uint8 status, bool isVerified) = identityContract.users(_student);
        require(isVerified, "Certificates: Student is not verified.");
        require(status > 0, "Certificates: Recipient is not an active student."); // status 1: Enrolled, 2: Graduated
        require(role == Identity.UserRole.STUDENT, "Certificates: Recipient's role must be STUDENT.");

        require(bytes(_programName).length > 0, "Certificates: Program name cannot be empty.");
        require(bytes(_degreeType).length > 0, "Certificates: Degree type cannot be empty.");
        require(bytes(_institutionName).length > 0, "Certificates: Institution name cannot be empty.");
        require(bytes(_collegeName).length > 0, "Certificates: College name cannot be empty.");
        require(bytes(_grade).length > 0, "Certificates: Grade cannot be empty.");
        require(_graduationYear > 0 && _graduationYear <= block.timestamp, "Certificates: Invalid graduation year."); // Ensure year is valid

        // Generate a unique certificate ID (using student address, current time, and a hash of content for uniqueness)
        bytes32 certificateId = keccak256(
            abi.encodePacked(
                _student,
                block.timestamp,
                _programName,
                _degreeType,
                _institutionName,
                _collegeName,
                _graduationYear,
                _grade
            )
        );
        
        // Ensure a certificate with this ID has not been proposed before
        require(certificates[certificateId].certificateId == bytes32(0), "Certificates: Certificate with this ID already exists or is proposed.");
        
        // Store the certificate in "PROPOSED" state
        certificates[certificateId] = Certificate({
            certificateId: certificateId,
            student: _student,
            issuer: address(0), // No issuer set yet, will be set upon approval
            programName: _programName,
            degreeType: _degreeType,
            institutionName: _institutionName,
            collegeName: _collegeName,
            graduationYear: _graduationYear,
            grade: _grade,
            isCustomDesign: _isCustomDesign,
            issuedAt: block.timestamp, // Time of proposal
            state: CertificateState.PROPOSED
        });
        
        // Add the proposed certificate ID to a review list for the university (for Admin's easy viewing)
        proposedCertificateIds.push(certificateId);

        emit CertificateProposed(certificateId, _student, _programName, _degreeType, _collegeName);
        
        return certificateId;
    }
    
    /**
     * @dev Approves (issues) a proposed certificate by the university.
     * Only the owner (University) or an Admin can approve certificates.
     * @param _certificateId The ID of the proposed certificate to approve.
     */
    function approveCertificate(bytes32 _certificateId) external onlyAdminOrOwner nonReentrant {
        Certificate storage cert = certificates[_certificateId];
        // Ensure the certificate exists and is in "PROPOSED" state
        require(cert.certificateId != bytes32(0), "Certificates: Certificate does not exist.");
        require(cert.state == CertificateState.PROPOSED, "Certificates: Certificate is not in PROPOSED state.");
        
        // Update certificate state to "ISSUED", set issuer, and issuance time
        cert.issuer = msg.sender; // The Admin/Owner who approved the certificate
        cert.issuedAt = block.timestamp; // Final approval time
        cert.state = CertificateState.ISSUED;
        
        // Remove the certificate from the proposed certificates list (as it's no longer "proposed")
        _removeProposedCertificateId(_certificateId);

        emit CertificateIssued(_certificateId, cert.student, cert.issuer, cert.collegeName);
    }

    /**
     * @dev Revokes an issued certificate.
     * Only the original issuer of the certificate (University/Admin) can revoke it.
     * @param _certificateId The ID of the certificate to revoke.
     */
    function revokeCertificate(bytes32 _certificateId) external nonReentrant {
        Certificate storage cert = certificates[_certificateId];
        // Ensure the certificate exists
        require(cert.certificateId != bytes32(0), "Certificates: Certificate does not exist.");
        // Ensure the caller is the original issuer of the certificate
        require(cert.issuer == msg.sender, "Certificates: Not certificate issuer.");
        // Ensure the certificate is currently in "ISSUED" state before revocation
        require(cert.state == CertificateState.ISSUED, "Certificates: Certificate is not in ISSUED state.");
        
        // Update certificate state to "REVOKED"
        cert.state = CertificateState.REVOKED;
        emit CertificateRevoked(_certificateId);
    }
    
    /**
     * @dev Verifies the details of a specific certificate.
     * This function can be called by anyone to verify a certificate.
     * @param _certificateId The ID of the certificate to verify.
     * @return student The address of the student who owns the certificate.
     * @return issuer The address of the institution that issued the certificate.
     * @return programName The name of the academic program.
     * @return degreeType The type of degree.
     * @return institutionName The name of the issuing institution.
     * @return collegeName The name of the college.
     * @return graduationYear The year of graduation.
     * @return grade The final academic grade.
     * @return isCustomDesign True if the certificate has a custom design.
     * @return issuedAt The timestamp when the certificate was proposed/issued.
     * @return state The current state of the certificate (PROPOSED, ISSUED, REVOKED).
     */
    function verifyCertificate(bytes32 _certificateId) external view returns (
        address student,
        address issuer,
        string memory programName,
        string memory degreeType,
        string memory institutionName,
        string memory collegeName,
        uint256 graduationYear,
        string memory grade,
        bool isCustomDesign,
        uint256 issuedAt,
        CertificateState state
    ) {
        Certificate memory cert = certificates[_certificateId];
        // Ensure the certificate exists
        require(cert.certificateId != bytes32(0), "Certificates: Certificate does not exist.");
        
        return (
            cert.student,
            cert.issuer,
            cert.programName,
            cert.degreeType,
            cert.institutionName,
            cert.collegeName,
            cert.graduationYear,
            cert.grade,
            cert.isCustomDesign,
            cert.issuedAt,
            cert.state
        );
    }

    /**
     * @dev Retrieves a list of proposed certificate IDs awaiting university review.
     * This function is intended for the university (Admin/Owner) to review certificates.
     * @return An array of bytes32 containing IDs of proposed certificates.
     */
    function getProposedCertificateIds() external view onlyAdminOrOwner returns (bytes32[] memory) {
        return proposedCertificateIds;
    }

    /**
     * @dev Internal function to remove a certificate ID from the proposedCertificateIds list after it has been approved.
     * @param _certificateId The ID of the certificate to remove.
     */
    function _removeProposedCertificateId(bytes32 _certificateId) internal {
        uint256 len = proposedCertificateIds.length;
        for (uint256 i = 0; i < len; i++) {
            if (proposedCertificateIds[i] == _certificateId) {
                proposedCertificateIds[i] = proposedCertificateIds[len - 1];
                proposedCertificateIds.pop();
                break;
            }
        }
    }
}
