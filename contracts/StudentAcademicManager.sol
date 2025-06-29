// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "./Identity.sol";
import "./Certificates.sol";

contract StudentAcademicManager is Ownable, Pausable, ReentrancyGuard {
    using Counters for Counters.Counter;

    Counters.Counter private _warningCount;
    Counters.Counter private _academicActionCount;

    Identity public identityContract;
    Certificates public certificatesContract;

    struct InstitutionSettings {
        uint256 minCreditsPerSemester;
        uint256 maxCreditsPerSemester;
        uint256 totalCreditsRequiredForGraduation;
        uint256 minGPARequiredForGraduation;
    }

    struct SemesterPerformance {
        uint256 semesterGPA;
        uint256 semesterPercentage;
        string semesterGrade;
        uint256 earnedCreditsThisSemester;
        uint256 totalAttemptedCreditsThisSemester;
        uint256 startDate;
        uint256 endDate;
        bool isCompleted;
    }

    struct AcademicPerformance {
        uint256 cumulativeGPA;
        uint256 cumulativePercentage;
        string overallGrade;
        uint256 totalEarnedCredits;
        uint256 totalAttemptedCredits;
        uint256 lastUpdated;
        bool hasProposedGraduation;
    }

    struct Course {
        bytes32 courseId;
        string name;
        uint256 credits;
        uint256 passingScore;
        bool isActive;
    }

    enum ExamStatus { NOT_TAKEN, PASSED, FAILED }
    enum WarningType { ACADEMIC, BEHAVIORAL, ATTENDANCE }
    enum DisciplinaryAction { WARNING, PROBATION, SUSPENSION, DISMISSAL }

    struct Grade {
        uint256 score;
        ExamStatus status;
        uint256 timestamp;
    }

    struct Warning {
        uint256 warningId;
        address studentAddress;
        WarningType warningType;
        string reason;
        uint256 timestamp;
        bool isActive;
    }

    struct AcademicAction {
        uint256 actionId;
        address studentAddress;
        DisciplinaryAction actionType;
        string reason;
        uint256 startDate;
        uint256 endDate;
        bool isActive;
    }

    mapping(address => AcademicPerformance) public studentAcademicRecords;
    mapping(address => mapping(uint256 => SemesterPerformance)) public studentSemesterPerformance;
    mapping(address => mapping(bytes32 => Grade)) public studentGrades;
    mapping(bytes32 => Course) public courses;
    mapping(address => uint256) public currentSemesterNumber;

    mapping(uint256 => Warning) public warnings;
    mapping(address => uint256[]) public studentWarnings;

    mapping(uint256 => AcademicAction) public academicActions;
    mapping(address => uint256[]) public studentAcademicActions;

    InstitutionSettings public institutionSettings;

    event CourseRegistered(bytes32 indexed courseId, string name, uint256 credits);
    event GradeAssigned(address indexed studentAddress, bytes32 indexed courseId, uint256 score, ExamStatus status);
    event AcademicPerformanceUpdated(address indexed studentAddress, uint256 cumulativeGPA, uint256 totalEarnedCredits, uint256 totalAttemptedCredits);
    event SemesterPerformanceUpdated(address indexed studentAddress, uint256 semesterNumber, uint256 semesterGPA, uint256 earnedCreditsThisSemester);
    event NewSemesterStarted(address indexed studentAddress, uint256 semesterNumber, uint256 startDate, uint256 endDate);
    event SemesterCompleted(address indexed studentAddress, uint256 semesterNumber);
    event StudentGraduationProposed(address indexed studentAddress);

    event WarningIssued(uint256 indexed warningId, address indexed studentAddress, WarningType warningType, string reason);
    event AcademicActionTaken(uint256 indexed actionId, address indexed studentAddress, DisciplinaryAction actionType, string reason);

    /**
     * @dev Constructor for the StudentAcademicManager contract. Executed once upon deployment.
     * @param _identityContractAddress The address of the Identity.sol contract for cross-contract interaction.
     * @param _certificatesContractAddress The address of the Certificates.sol contract for certificate issuance.
     */
    constructor(address _identityContractAddress, address _certificatesContractAddress) Pausable() {
        require(_identityContractAddress != address(0), "StudentAcademicManager: Invalid Identity contract address.");
        identityContract = Identity(_identityContractAddress);
        certificatesContract = Certificates(_certificatesContractAddress);

        institutionSettings = InstitutionSettings({
            minCreditsPerSemester: 12,
            maxCreditsPerSemester: 21,
            totalCreditsRequiredForGraduation: 130,
            minGPARequiredForGraduation: 200
        });
    }

    /**
     * @dev Modifier to ensure that only the contract owner (University) or an authorized admin can call the function.
     */
    modifier onlyAdminOrOwner() {
        require(identityContract.isAdmin(msg.sender), "StudentAcademicManager: Caller is not authorized as Admin or Owner.");
        _;
    }

    /**
     * @dev Modifier to ensure that the provided address belongs to a registered and verified student in the Identity contract.
     * @param _studentAddress The address of the student to verify.
     */
    modifier onlyVerifiedStudent(address _studentAddress) {
        require(identityContract.isVerifiedUser(_studentAddress), "StudentAcademicManager: Student is not registered or not verified.");
        ( , Identity.UserRole role, , , , , , , ) = identityContract.users(_studentAddress);
        require(role == Identity.UserRole.STUDENT, "StudentAcademicManager: Address is not a student.");
        _;
    }

    /**
     * @dev Modifier to ensure that a course exists and is active.
     * @param _courseId The unique identifier of the course.
     */
    modifier courseExists(bytes32 _courseId) {
        require(courses[_courseId].isActive, "StudentAcademicManager: Course does not exist or is not active.");
        _;
    }

    /**
     * @dev Registers a new course in the system.
     * Only the owner (University) or an Admin can register courses.
     * @param _courseId A unique identifier for the course (e.g., a hash of its name).
     * @param _name The name of the course.
     * @param _credits The number of credits for the course.
     * @param _passingScore The minimum score required to pass the course (out of 100).
     */
    function registerCourse(
        bytes32 _courseId,
        string memory _name,
        uint256 _credits,
        uint256 _passingScore
    ) external onlyAdminOrOwner whenNotPaused {
        require(courses[_courseId].courseId == bytes32(0), "StudentAcademicManager: Course already registered.");
        require(_credits > 0, "StudentAcademicManager: Invalid credits. Must be greater than 0.");
        require(_passingScore > 0 && _passingScore <= 100, "StudentAcademicManager: Invalid passing score. Must be between 1 and 100.");

        courses[_courseId] = Course({
            courseId: _courseId,
            name: _name,
            credits: _credits,
            passingScore: _passingScore,
            isActive: true
        });

        emit CourseRegistered(_courseId, _name, _credits);
    }

    /**
     * @dev Assigns a grade to a student for a specific course.
     * Only the owner (University) or an Admin can assign grades.
     * @param _studentAddress The address of the student to assign the grade to.
     * @param _courseId The course ID for which the grade is being assigned.
     * @param _score The numerical score (0-100) achieved by the student.
     */
    function assignGrade(
        address _studentAddress,
        bytes32 _courseId,
        uint256 _score
    ) external onlyAdminOrOwner whenNotPaused onlyVerifiedStudent(_studentAddress) courseExists(_courseId) {
        require(_score <= 100, "StudentAcademicManager: Invalid score. Score must be between 0 and 100.");

        ExamStatus status = _score >= courses[_courseId].passingScore ? ExamStatus.PASSED : ExamStatus.FAILED;

        studentGrades[_studentAddress][_courseId] = Grade({
            score: _score,
            status: status,
            timestamp: block.timestamp
        });

        _updateOverallAcademicPerformance(_studentAddress);

        emit GradeAssigned(_studentAddress, _courseId, _score, status);
    }

    /**
     * @dev Internal function to update a student's overall academic performance.
     * It calculates the cumulative GPA, overall percentage, and overall letter grade based on all recorded grades.
     * @param _studentAddress The address of the student whose performance is to be updated.
     */
    function _updateOverallAcademicPerformance(address _studentAddress) internal {
        // uint256 totalPoints = 0;
        // uint256 totalEarnedCredits = 0;
        // uint256 totalAttemptedCredits = 0;
        // uint256 totalWeightedPercentage = 0;

        // Note: Course enrollment tracking needs to be implemented
        // For now, skip the course iteration until proper enrollment system is in place
        
        // Simplified version - just update timestamp
        studentAcademicRecords[_studentAddress].lastUpdated = block.timestamp;

        // TODO: Implement proper performance calculation when course enrollment is available
        if (true) { // Placeholder condition
            AcademicPerformance storage academicPerf = studentAcademicRecords[_studentAddress];
            academicPerf.lastUpdated = block.timestamp;

            emit AcademicPerformanceUpdated(
                _studentAddress,
                academicPerf.cumulativeGPA,
                academicPerf.totalEarnedCredits,
                academicPerf.totalAttemptedCredits
            );
        }
    }

    /**
     * @dev Internal pure function to convert a numerical score (0-100) to GPA points on a 4.0 scale.
     * @param _score The numerical score.
     * @return The corresponding GPA points.
     */
    function getGradePoints(uint256 _score) internal pure returns (uint256) {
        if (_score >= 90) return 4;
        if (_score >= 80) return 3;
        if (_score >= 70) return 2;
        if (_score >= 60) return 1;
        return 0;
    }

    /**
     * @dev Internal pure function to determine the letter grade (e.g., A+, B-) based on a percentage.
     * @param _percentage The percentage score.
     * @return The corresponding letter grade.
     */
    function determineOverallGrade(uint256 _percentage) internal pure returns (string memory) {
        if (_percentage >= 95) return "A+";
        if (_percentage >= 90) return "A";
        if (_percentage >= 85) return "A-";
        if (_percentage >= 80) return "B+";
        if (_percentage >= 75) return "B";
        if (_percentage >= 70) return "B-";
        if (_percentage >= 65) return "C+";
        if (_percentage >= 60) return "C";
        return "F";
    }

    /**
     * @dev Issues an academic or behavioral warning to a student.
     * Only the owner (University) or an Admin can issue warnings.
     * @param _studentAddress The address of the student to whom the warning is issued.
     * @param _warningType The type of warning (Academic, Behavioral, Attendance).
     * @param _reason The reason for the warning.
     */
    function issueWarning(
        address _studentAddress,
        WarningType _warningType,
        string memory _reason
    ) external onlyAdminOrOwner whenNotPaused onlyVerifiedStudent(_studentAddress) {
        _warningCount.increment();
        uint256 warningId = _warningCount.current();

        warnings[warningId] = Warning({
            warningId: warningId,
            studentAddress: _studentAddress,
            warningType: _warningType,
            reason: _reason,
            timestamp: block.timestamp,
            isActive: true
        });

        studentWarnings[_studentAddress].push(warningId);

        emit WarningIssued(warningId, _studentAddress, _warningType, _reason);
    }

    /**
     * @dev Takes an academic disciplinary action against a student (e.g., probation, suspension, dismissal).
     * Only the owner (University) or an Admin can take academic actions.
     * If the action is suspension or dismissal, the student's status in the Identity contract may be updated.
     * @param _studentAddress The address of the student receiving the action.
     * @param _actionType The type of disciplinary action.
     * @param _reason The reason for the action.
     * @param _durationInDays The duration of the action in days (if applicable, e.g., for suspension).
     */
    function takeAcademicAction(
        address _studentAddress,
        DisciplinaryAction _actionType,
        string memory _reason,
        uint256 _durationInDays
    ) external onlyAdminOrOwner whenNotPaused onlyVerifiedStudent(_studentAddress) {
        require(_durationInDays > 0, "StudentAcademicManager: Invalid duration for academic action.");

        _academicActionCount.increment();
        uint256 actionId = _academicActionCount.current();

        uint256 startDate = block.timestamp;
        uint256 endDate = startDate + (_durationInDays * 1 days);

        academicActions[actionId] = AcademicAction({
            actionId: actionId,
            studentAddress: _studentAddress,
            actionType: _actionType,
            reason: _reason,
            startDate: startDate,
            endDate: endDate,
            isActive: true
        });

        studentAcademicActions[_studentAddress].push(actionId);

        // Determine target status based on disciplinary action type.
        // Currently, severe actions like suspension and dismissal are handled as comments
        // Future implementation could add status management to Identity contract
        
        // Update student status in Identity.sol if the action requires it.
        // Note: This functionality would require adding status management to Identity.sol
        if (_actionType == DisciplinaryAction.SUSPENSION || _actionType == DisciplinaryAction.DISMISSAL) {
            // TODO: Implement status update in Identity contract when StudentStatus enum is added
            // identityContract.updateStudentStatus(_studentAddress, targetStatus);
        }

        emit AcademicActionTaken(actionId, _studentAddress, _actionType, _reason);
    }
    
    /**
     * @dev Initiates a new semester for a specific student.
     * Only the owner (University) or an Admin can start new semesters.
     * Requires the previous semester (if any) to be completed.
     * @param _studentAddress The address of the student.
     * @param _startDate The start timestamp of the new semester.
     * @param _endDate The end timestamp of the new semester.
     */
    function startNewSemester(
        address _studentAddress,
        uint256 _startDate,
        uint256 _endDate
    ) external onlyAdminOrOwner whenNotPaused onlyVerifiedStudent(_studentAddress) {
        require(_startDate < _endDate, "StudentAcademicManager: Invalid semester dates. Start date must be before end date.");
        require(_startDate >= block.timestamp || _startDate + 1 days >= block.timestamp, "StudentAcademicManager: Start date must be in the present or future.");

        uint256 currentSemNum = currentSemesterNumber[_studentAddress];
        
        // If there's an active semester, ensure it's completed first.
        if (currentSemNum > 0) {
            require(
                studentSemesterPerformance[_studentAddress][currentSemNum].isCompleted,
                "StudentAcademicManager: Current semester not completed. Please complete it first."
            );
        }

        currentSemesterNumber[_studentAddress]++; // Increment semester number for the student.
        uint256 newSemesterNum = currentSemesterNumber[_studentAddress];

        // Initialize performance metrics for the new semester.
        studentSemesterPerformance[_studentAddress][newSemesterNum] = SemesterPerformance({
            semesterGPA: 0,
            semesterPercentage: 0,
            semesterGrade: "N/A",
            earnedCreditsThisSemester: 0,
            totalAttemptedCreditsThisSemester: 0,
            startDate: _startDate,
            endDate: _endDate,
            isCompleted: false
        });

        emit NewSemesterStarted(_studentAddress, newSemesterNum, _startDate, _endDate);
    }

    /**
     * @dev Marks the current semester as completed for a specific student and calculates its final performance.
     * Only the owner (University) or an Admin can complete semesters.
     * Updates the student's overall academic performance after semester completion.
     * If the student meets graduation requirements, a graduation certificate is proposed.
     * @param _studentAddress The address of the student.
     * @param _programName The name of the academic program/major.
     * @param _degreeType The type of degree (e.g., "Bachelor's", "Master's").
     * @param _institutionName The name of the issuing institution/university.
     * @param _collegeName The name of the college within the institution.
     */
    function completeSemester(
        address _studentAddress,
        string memory _programName,
        string memory _degreeType,
        string memory _institutionName,
        string memory _collegeName
    ) external onlyAdminOrOwner whenNotPaused onlyVerifiedStudent(_studentAddress) {
        uint256 currentSemNum = currentSemesterNumber[_studentAddress];
        require(currentSemNum > 0, "StudentAcademicManager: No active semester to complete.");

        AcademicPerformance storage academicPerf = studentAcademicRecords[_studentAddress];
        SemesterPerformance storage semester = studentSemesterPerformance[_studentAddress][currentSemNum];
        
        require(!semester.isCompleted, "StudentAcademicManager: Semester already completed.");
        require(block.timestamp >= semester.endDate, "StudentAcademicManager: Semester not yet ended. Cannot complete.");

        // Calculate final performance for the semester.
        _calculateSemesterPerformance(_studentAddress, currentSemNum);
        
        // Mark the semester as completed.
        semester.isCompleted = true;

        // Update overall academic performance after each completed semester.
        _updateOverallAcademicPerformance(_studentAddress);

        emit SemesterCompleted(_studentAddress, currentSemNum);

        // Check for graduation eligibility and propose certificate
        if (academicPerf.totalEarnedCredits >= institutionSettings.totalCreditsRequiredForGraduation &&
            academicPerf.cumulativeGPA >= institutionSettings.minGPARequiredForGraduation &&
            !academicPerf.hasProposedGraduation) // Ensure certificate is proposed only once
        {
            // TODO: Update student status in Identity contract when StudentStatus enum is added
            // identityContract.updateStudentStatus(_studentAddress, Identity.StudentStatus.GRADUATED);
            
            // Propose certificate in Certificates contract
            certificatesContract.proposeCertificate(
                _studentAddress,
                _programName,
                _degreeType,
                _institutionName,
                _collegeName,
                block.timestamp / (365 * 24 * 60 * 60), // Graduation year (approx.)
                academicPerf.overallGrade,
                false // Default to false for isCustomDesign for automatic proposal
            );
            academicPerf.hasProposedGraduation = true; // Mark that graduation has been proposed
            emit StudentGraduationProposed(_studentAddress);
        }
    }

    /**
     * @dev Internal function to calculate a student's performance for a specific semester.
     * It iterates through grades within the semester's timeframe to compute GPA and credits for that period.
     * @param _studentAddress The address of the student.
     * @param _semesterNumber The number of the semester for which to calculate performance.
     */
    function _calculateSemesterPerformance(
        address _studentAddress,
        uint256 _semesterNumber
    ) internal {
        uint256 semesterTotalPoints = 0;
        uint256 semesterEarnedCredits = 0;
        uint256 semesterAttemptedCredits = 0;
        uint256 semesterTotalWeightedPercentage = 0;

        SemesterPerformance storage semPerf = studentSemesterPerformance[_studentAddress][_semesterNumber];

        // TODO: Replace with proper course enrollment tracking
        // (,,, ,,, string[] memory studentCoursesFromIdentity) = identityContract.getStudentData(_studentAddress);
        string[] memory studentCoursesFromIdentity = new string[](0); // Empty array placeholder

        for (uint256 i = 0; i < studentCoursesFromIdentity.length; i++) {
            // Using keccak256 of the course name as a temporary ID.
            // Consider using bytes32 course IDs directly in Identity.sol for better consistency and efficiency.
            bytes32 currentCourseId = keccak256(abi.encodePacked(studentCoursesFromIdentity[i]));

            // Skip courses that are not registered in this contract (StudentAcademicManager).
            if (courses[currentCourseId].courseId == bytes32(0)) { continue; }

            Grade memory grade = studentGrades[_studentAddress][currentCourseId];
            Course memory course = courses[currentCourseId];

            // Only consider grades recorded within the semester's start and end dates.
            if (grade.timestamp >= semPerf.startDate && grade.timestamp <= semPerf.endDate) {
                if (grade.status != ExamStatus.NOT_TAKEN) {
                    uint256 gradePoints = getGradePoints(grade.score);
                    semesterTotalPoints += (gradePoints * course.credits);
                    semesterAttemptedCredits += course.credits;

                    if (grade.status == ExamStatus.PASSED) {
                        semesterEarnedCredits += course.credits;
                    }
                    semesterTotalWeightedPercentage += (grade.score * course.credits);
                }
            }
        }

        if (semesterAttemptedCredits > 0) {
            semPerf.semesterGPA = (semesterTotalPoints * 100) / (semesterAttemptedCredits * 4);
            semPerf.semesterPercentage = semesterTotalWeightedPercentage / semesterAttemptedCredits;
            semPerf.semesterGrade = determineOverallGrade(semPerf.semesterPercentage);
            semPerf.earnedCreditsThisSemester = semesterEarnedCredits;
            semPerf.totalAttemptedCreditsThisSemester = semesterAttemptedCredits;

            emit SemesterPerformanceUpdated(
                _studentAddress,
                _semesterNumber,
                semPerf.semesterGPA,
                semPerf.earnedCreditsThisSemester
            );
        }
    }

    /**
     * @dev Retrieves a student's overall academic performance details.
     * @param _studentAddress The address of the student.
     * @return cumulativeGPA The student's cumulative GPA.
     * @return cumulativePercentage The student's overall percentage.
     * @return overallGrade The student's overall letter grade.
     * @return totalEarnedCredits The total credits successfully earned by the student.
     * @return totalAttemptedCredits The total credits attempted by the student.
     * @return lastUpdated The timestamp of the last update to the academic performance.
     */
    function getOverallAcademicPerformance(address _studentAddress)
        external
        view
        onlyVerifiedStudent(_studentAddress)
        returns (
            uint256 cumulativeGPA,
            uint256 cumulativePercentage,
            string memory overallGrade,
            uint256 totalEarnedCredits,
            uint256 totalAttemptedCredits,
            uint256 lastUpdated
        )
    {
        AcademicPerformance storage academicPerf = studentAcademicRecords[_studentAddress];
        return (
            academicPerf.cumulativeGPA,
            academicPerf.cumulativePercentage,
            academicPerf.overallGrade,
            academicPerf.totalEarnedCredits,
            academicPerf.totalAttemptedCredits,
            academicPerf.lastUpdated
        );
    }

    /**
     * @dev Retrieves a student's academic performance details for a specific semester.
     * @param _studentAddress The address of the student.
     * @param _semesterNumber The number of the semester.
     * @return semesterGPA The student's GPA for that semester.
     * @return semesterPercentage The student's percentage for that semester.
     * @return semesterGrade The student's letter grade for that semester.
     * @return earnedCreditsThisSemester The credits earned in that semester.
     * @return totalAttemptedCreditsThisSemester The total credits attempted in that semester.
     * @return startDate The start date of the semester.
     * @return endDate The end date of the semester.
     * @return isCompleted True if the semester has been marked as completed.
     */
    function getSemesterPerformanceDetails(address _studentAddress, uint256 _semesterNumber)
        external
        view
        onlyVerifiedStudent(_studentAddress)
        returns (
            uint256 semesterGPA,
            uint256 semesterPercentage,
            string memory semesterGrade,
            uint256 earnedCreditsThisSemester,
            uint256 totalAttemptedCreditsThisSemester,
            uint256 startDate,
            uint256 endDate,
            bool isCompleted
        )
    {
        SemesterPerformance storage semPerf = studentSemesterPerformance[_studentAddress][_semesterNumber];
        return (
            semPerf.semesterGPA,
            semPerf.semesterPercentage,
            semPerf.semesterGrade,
            semPerf.earnedCreditsThisSemester,
            semPerf.totalAttemptedCreditsThisSemester,
            semPerf.startDate,
            semPerf.endDate,
            semPerf.isCompleted
        );
    }

    /**
     * @dev Retrieves details of a specific course.
     * @param _courseId The unique identifier of the course.
     * @return name The name of the course.
     * @return credits The number of credits for the course.
     * @return passingScore The passing score for the course.
     * @return isActive True if the course is active.
     */
    function getCourseDetails(bytes32 _courseId)
        external
        view
        returns (
            string memory name,
            uint256 credits,
            uint256 passingScore,
            bool isActive
        )
    {
        Course memory course = courses[_courseId];
        require(course.courseId != bytes32(0), "StudentAcademicManager: Course does not exist.");
        return (
            course.name,
            course.credits,
            course.passingScore,
            course.isActive
        );
    }

    /**
     * @dev Retrieves a student's grade for a specific course.
     * @param _studentAddress The address of the student.
     * @param _courseId The unique identifier of the course.
     * @return score The student's score in the course.
     * @return status The exam status (PASSED, FAILED, NOT_TAKEN).
     * @return timestamp The timestamp when the grade was assigned.
     */
    function getStudentGrade(address _studentAddress, bytes32 _courseId)
        external
        view
        onlyVerifiedStudent(_studentAddress)
        returns (
            uint256 score,
            ExamStatus status,
            uint256 timestamp
        )
    {
        require(courses[_courseId].courseId != bytes32(0), "StudentAcademicManager: Course does not exist.");
        Grade memory grade = studentGrades[_studentAddress][_courseId];
        require(grade.timestamp != 0, "StudentAcademicManager: Grade not found for this student in this course.");
        return (grade.score, grade.status, grade.timestamp);
    }

    /**
     * @dev Retrieves a list of warning IDs issued to a specific student.
     * @param _studentAddress The address of the student.
     * @return An array of warning IDs.
     */
    function getStudentWarnings(address _studentAddress) external view returns (uint256[] memory) {
        ( , Identity.UserRole role, , , , , , , ) = identityContract.users(_studentAddress);
        require(role == Identity.UserRole.STUDENT, "StudentAcademicManager: Address is not a student.");
        return studentWarnings[_studentAddress];
    }

    /**
     * @dev Retrieves the details of a specific warning.
     * @param _warningId The ID of the warning.
     * @return warningId The ID of the warning.
     * @return studentAddress The address of the student who received the warning.
     * @return warningType The type of warning.
     * @return reason The reason for the warning.
     * @return timestamp The timestamp when the warning was issued.
     * @return isActive True if the warning is still active.
     */
    function getWarningDetails(uint256 _warningId) external view returns (uint256 warningId, address studentAddress, WarningType warningType, string memory reason, uint256 timestamp, bool isActive) {
        Warning storage w = warnings[_warningId];
        require(w.warningId != 0, "StudentAcademicManager: Warning ID does not exist.");
        return (w.warningId, w.studentAddress, w.warningType, w.reason, w.timestamp, w.isActive);
    }

    /**
     * @dev Retrieves a list of academic action IDs taken against a specific student.
     * @param _studentAddress The address of the student.
     * @return An array of academic action IDs.
     */
    function getStudentAcademicActions(address _studentAddress) external view returns (uint256[] memory) {
        ( , Identity.UserRole role, , , , , , , ) = identityContract.users(_studentAddress);
        require(role == Identity.UserRole.STUDENT, "StudentAcademicManager: Address is not a student.");
        return studentAcademicActions[_studentAddress];
    }

    /**
     * @dev Retrieves the details of a specific academic action.
     * @param _actionId The ID of the academic action.
     * @return actionId The ID of the academic action.
     * @return studentAddress The address of the student who received the action.
     * @return actionType The type of disciplinary action.
     * @return reason The reason for the action.
     * @return startDate The start date of the action.
     * @return endDate The end date of the action.
     * @return isActive True if the action is still active.
     */
    function getAcademicActionDetails(uint256 _actionId) external view returns (uint256 actionId, address studentAddress, DisciplinaryAction actionType, string memory reason, uint256 startDate, uint256 endDate, bool isActive) {
        AcademicAction storage a = academicActions[_actionId];
        require(a.actionId != 0, "StudentAcademicManager: Academic Action ID does not exist.");
        return (a.actionId, a.studentAddress, a.actionType, a.reason, a.startDate, a.endDate, a.isActive);
    }

    /**
     * @dev Retrieves the current semester number for a specific student.
     * @param _studentAddress The address of the student.
     * @return The current semester number.
     */
    function getCurrentSemesterNumber(address _studentAddress) external view returns (uint256) {
        ( , Identity.UserRole role, , , , , , , ) = identityContract.users(_studentAddress);
        require(role == Identity.UserRole.STUDENT, "StudentAcademicManager: Address is not a student.");
        return currentSemesterNumber[_studentAddress];
    }

    /**
     * @dev Sets the address of the Certificates contract.
     * Can only be called by the contract owner or an admin.
     * @param _certificatesContractAddress The address of the Certificates contract.
     */
    function setCertificatesContract(address _certificatesContractAddress) external onlyAdminOrOwner whenNotPaused {
        require(_certificatesContractAddress != address(0), "StudentAcademicManager: Invalid Certificates contract address.");
        certificatesContract = Certificates(_certificatesContractAddress);
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