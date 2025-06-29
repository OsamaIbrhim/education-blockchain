// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "./Identity.sol";

contract CourseManagement is Ownable, Pausable {

    struct Course {
        bytes32 courseId;
        string name;
        uint256 credits;
        string department;
        bool isActive;
        uint256 creationDate;
    }

    struct CourseOffering {
        string semester;
        string doctorName;
        uint256 examDate;
        string bookTitle;
        bool isAvailableForEnrollment;
    }

    mapping(bytes32 => Course) public courses;
    mapping(bytes32 => mapping(string => CourseOffering)) public courseOfferings;
    mapping(bytes32 => string[]) public courseOfferingTerms;
    mapping(string => bytes32[]) public departmentCourses;

    string public currentActiveSemester;

    Identity public identityContract;

    event CourseAdded(bytes32 indexed courseId, string name, string department);
    event CourseDetailsUpdated(bytes32 indexed courseId, string name, uint256 credits, string department);
    event CourseDeactivated(bytes32 indexed courseId);
    event CourseOfferingAdded(bytes32 indexed courseId, string indexed semester, string doctorName);
    event CourseOfferingUpdated(bytes32 indexed courseId, string indexed semester, string doctorName, uint256 examDate, string bookTitle);
    event CurrentActiveSemesterUpdated(string oldSemester, string newSemester);

    /**
     * @dev Constructor for the CourseManagement contract. Executed once upon deployment.
     * @param _identityContractAddress The address of the Identity.sol contract for role verification.
     */
    constructor(address _identityContractAddress) Pausable() {
        require(_identityContractAddress != address(0), "CourseManagement: Invalid Identity contract address.");
        identityContract = Identity(_identityContractAddress);
    }

    /**
     * @dev Modifier to ensure that only the contract owner (University) or an authorized admin can call the function.
     */
    modifier onlyAdminOrOwner() {
        require(identityContract.isAdmin(msg.sender), "CourseManagement: Caller is not authorized as Admin or Owner.");
        _;
    }

    /**
     * @dev Modifier to ensure a static course with the given ID exists and is active.
     * @param _courseId The unique identifier of the course.
     */
    modifier courseExists(bytes32 _courseId) {
        require(courses[_courseId].courseId != bytes32(0), "CourseManagement: Course does not exist.");
        require(courses[_courseId].isActive, "CourseManagement: Course is inactive.");
        _;
    }

    /**
     * @dev Checks if a course exists and is active.
     * @param _courseId The unique identifier of the course.
     * @return bool True if the course exists and is active, false otherwise.
     */
    function isCourseExist(bytes32 _courseId) external view returns (bool) {
        return courses[_courseId].courseId != bytes32(0) && courses[_courseId].isActive;
    }

    /**
     * @dev Adds a new static course definition to the system.
     * Only the owner (University) or an Admin can add courses.
     * @param _courseId Unique identifier for the course.
     * @param _name Name of the course.
     * @param _credits Number of credits for the course.
     * @param _department The department this course belongs to.
     */
    function addCourse(
        bytes32 _courseId,
        string memory _name,
        uint256 _credits,
        string memory _department
    ) external onlyAdminOrOwner whenNotPaused {
        require(courses[_courseId].courseId == bytes32(0), "CourseManagement: Course ID already exists.");
        require(_credits > 0, "CourseManagement: Credits must be greater than 0.");
        require(bytes(_name).length > 0, "CourseManagement: Course name cannot be empty.");
        require(bytes(_department).length > 0, "CourseManagement: Department cannot be empty.");

        courses[_courseId] = Course({
            courseId: _courseId,
            name: _name,
            credits: _credits,
            department: _department,
            isActive: true,
            creationDate: block.timestamp
        });

        bool foundInDepartment = false;
        for (uint i = 0; i < departmentCourses[_department].length; i++) {
            if (departmentCourses[_department][i] == _courseId) {
                foundInDepartment = true;
                break;
            }
        }
        if (!foundInDepartment) {
            departmentCourses[_department].push(_courseId);
        }

        emit CourseAdded(_courseId, _name, _department);
    }

    /**
     * @dev Updates the static details of an existing course.
     * Only the owner (University) or an Admin can update course details.
     * @param _courseId Unique identifier of the course to update.
     * @param _newName New name of the course.
     * @param _newCredits New number of credits.
     * @param _newDepartment New department this course belongs to.
     */
    function updateCourseStaticDetails(
        bytes32 _courseId,
        string memory _newName,
        uint256 _newCredits,
        string memory _newDepartment
    ) external onlyAdminOrOwner whenNotPaused courseExists(_courseId) {
        require(bytes(_newName).length > 0, "CourseManagement: New course name cannot be empty.");
        require(_newCredits > 0, "CourseManagement: New credits must be greater than 0.");
        require(bytes(_newDepartment).length > 0, "CourseManagement: New department cannot be empty.");

        Course storage courseToUpdate = courses[_courseId];
        string memory oldDepartment = courseToUpdate.department;

        courseToUpdate.name = _newName;
        courseToUpdate.credits = _newCredits;
        
        if (keccak256(abi.encodePacked(oldDepartment)) != keccak256(abi.encodePacked(_newDepartment))) {
            for (uint i = 0; i < departmentCourses[oldDepartment].length; i++) {
                if (departmentCourses[oldDepartment][i] == _courseId) {
                    departmentCourses[oldDepartment][i] = departmentCourses[oldDepartment][departmentCourses[oldDepartment].length - 1];
                    departmentCourses[oldDepartment].pop();
                    break;
                }
            }
            departmentCourses[_newDepartment].push(_courseId);
            courseToUpdate.department = _newDepartment;
        }

        emit CourseDetailsUpdated(_courseId, _newName, _newCredits, _newDepartment);
    }

    /**
     * @dev Deactivates a static course, preventing new offerings for it.
     * Only the owner (University) or an Admin can deactivate courses.
     * @param _courseId Unique identifier of the course to deactivate.
     */
    function deactivateCourse(bytes32 _courseId) external onlyAdminOrOwner whenNotPaused courseExists(_courseId) {
        require(courses[_courseId].isActive, "CourseManagement: Course is already inactive.");
        courses[_courseId].isActive = false;
    }

    /**
     * @dev Sets the current active semester for the university.
     * This is used to retrieve the "latest" course offering for students.
     * Only the owner (University) or an Admin can set the active semester.
     * @param _semester The string representing the current active semester (e.g., "Fall 2024").
     */
    function setCurrentActiveSemester(string memory _semester) external onlyAdminOrOwner {
        require(bytes(_semester).length > 0, "CourseManagement: Semester cannot be empty.");
        string memory oldSemester = currentActiveSemester;
        currentActiveSemester = _semester;
        emit CurrentActiveSemesterUpdated(oldSemester, _semester);
    }

    /**
     * @dev Adds a new offering for a course for a specific semester.
     * This allows associating a specific doctor, exam date, and book with a course for a given term.
     * Only the owner (University) or an Admin can add course offerings.
     * @param _courseId The ID of the course.
     * @param _semester The semester for this offering (e.g., "Fall 2024").
     * @param _doctorName The name of the doctor teaching this offering.
     * @param _examDate The timestamp of the exam date (0 if not set yet).
     * @param _bookTitle The title of the main book/resource.
     */
    function addCourseOffering(
        bytes32 _courseId,
        string memory _semester,
        string memory _doctorName,
        uint256 _examDate,
        string memory _bookTitle
    ) external onlyAdminOrOwner whenNotPaused courseExists(_courseId) {
        require(bytes(_semester).length > 0, "CourseManagement: Semester cannot be empty.");
        require(bytes(_doctorName).length > 0, "CourseManagement: Doctor name cannot be empty.");
        require(keccak256(abi.encodePacked(courseOfferings[_courseId][_semester].semester)) == keccak256(abi.encodePacked("")), "CourseManagement: Offering for this semester already exists.");

        courseOfferings[_courseId][_semester] = CourseOffering({
            semester: _semester,
            doctorName: _doctorName,
            examDate: _examDate,
            bookTitle: _bookTitle,
            isAvailableForEnrollment: true
        });

        bool foundTerm = false;
        for (uint i = 0; i < courseOfferingTerms[_courseId].length; i++) {
            if (keccak256(abi.encodePacked(courseOfferingTerms[_courseId][i])) == keccak256(abi.encodePacked(_semester))) {
                foundTerm = true;
                break;
            }
        }
        if (!foundTerm) {
            courseOfferingTerms[_courseId].push(_semester);
        }

        emit CourseOfferingAdded(_courseId, _semester, _doctorName);
    }

    /**
     * @dev Updates the details of an existing course offering for a specific semester.
     * Only the owner (University) or an Admin can update course offerings.
     * @param _courseId The ID of the course.
     * @param _semester The semester of the offering to update.
     * @param _newDoctorName New name of the doctor.
     * @param _newExamDate New exam date timestamp.
     * @param _newBookTitle New title of the main book/resource.
     * @param _isAvailableForEnrollment New enrollment availability status.
     */
    function updateCourseOfferingDetails(
        bytes32 _courseId,
        string memory _semester,
        string memory _newDoctorName,
        uint256 _newExamDate,
        string memory _newBookTitle,
        bool _isAvailableForEnrollment
    ) external onlyAdminOrOwner whenNotPaused courseExists(_courseId) {
        require(keccak256(abi.encodePacked(courseOfferings[_courseId][_semester].semester)) != keccak256(abi.encodePacked("")), "CourseManagement: Offering for this semester does not exist.");
        require(bytes(_newDoctorName).length > 0, "CourseManagement: Doctor name cannot be empty.");

        CourseOffering storage offeringToUpdate = courseOfferings[_courseId][_semester];
        offeringToUpdate.doctorName = _newDoctorName;
        offeringToUpdate.examDate = _newExamDate;
        offeringToUpdate.bookTitle = _newBookTitle;
        offeringToUpdate.isAvailableForEnrollment = _isAvailableForEnrollment;

        emit CourseOfferingUpdated(_courseId, _semester, _newDoctorName, _newExamDate, _newBookTitle);
    }

    /**
     * @dev Retrieves the static details of a course.
     * @param _courseId The unique identifier of the course.
     * @return courseId The unique identifier of the course.
     * @return name The name of the course.
     * @return credits The number of credits.
     * @return department The department the course belongs to.
     * @return isActive True if the course is active.
     * @return creationDate The creation timestamp.
     */
    function getCourseStaticDetails(bytes32 _courseId)
        external
        view
        returns (
            bytes32 courseId,
            string memory name,
            uint256 credits,
            string memory department,
            bool isActive,
            uint256 creationDate
        )
    {
        Course memory course = courses[_courseId];
        require(course.courseId != bytes32(0), "CourseManagement: Course does not exist.");
        return (
            course.courseId,
            course.name,
            course.credits,
            course.department,
            course.isActive,
            course.creationDate
        );
    }

    /**
     * @dev Retrieves the details of a specific course offering for a given semester.
     * This function can be used by students to get the details of the course for their current enrolled term.
     * @param _courseId The unique identifier of the course.
     * @param _semester The specific semester (e.g., "Fall 2024").
     * @return semester The semester/term.
     * @return doctorName The name of the doctor.
     * @return examDate The exam date timestamp.
     * @return bookTitle The book title.
     * @return isAvailableForEnrollment True if available for enrollment.
     */
    function getCourseOfferingDetails(bytes32 _courseId, string memory _semester)
        external
        view
        returns (
            string memory semester,
            string memory doctorName,
            uint256 examDate,
            string memory bookTitle,
            bool isAvailableForEnrollment
        )
    {
        require(courses[_courseId].courseId != bytes32(0), "CourseManagement: Course does not exist.");
        CourseOffering memory offering = courseOfferings[_courseId][_semester];
        require(keccak256(abi.encodePacked(offering.semester)) != keccak256(abi.encodePacked("")), "CourseManagement: Course offering for this semester does not exist.");
        return (
            offering.semester,
            offering.doctorName,
            offering.examDate,
            offering.bookTitle,
            offering.isAvailableForEnrollment
        );
    }

    /**
     * @dev Retrieves the details of the latest/current course offering for a specific course.
     * This relies on the `currentActiveSemester` being set by the university.
     * @param _courseId The unique identifier of the course.
     * @return semester The current active semester.
     * @return doctorName The name of the doctor.
     * @return examDate The exam date timestamp.
     * @return bookTitle The book title.
     * @return isAvailableForEnrollment True if available for enrollment.
     */
    function getLatestCourseOfferingDetails(bytes32 _courseId)
        external
        view
        returns (
            string memory semester,
            string memory doctorName,
            uint256 examDate,
            string memory bookTitle,
            bool isAvailableForEnrollment
        )
    {
        require(courses[_courseId].courseId != bytes32(0), "CourseManagement: Course does not exist.");
        require(bytes(currentActiveSemester).length > 0, "CourseManagement: Current active semester is not set.");
        
        CourseOffering memory offering = courseOfferings[_courseId][currentActiveSemester];
        require(keccak256(abi.encodePacked(offering.semester)) != keccak256(abi.encodePacked("")), "CourseManagement: No offering found for the current active semester.");

        return (
            offering.semester,
            offering.doctorName,
            offering.examDate,
            offering.bookTitle,
            offering.isAvailableForEnrollment
        );
    }

    /**
     * @dev Retrieves all historical course offerings for a specific course.
     * This function can be used by the University/Admin to view the full history.
     * @param _courseId The unique identifier of the course.
     * @return An array of CourseOffering structs for all terms this course was offered.
     */
    function getAllCourseOfferingsForCourse(bytes32 _courseId)
        external
        view
        returns (CourseOffering[] memory)
    {
        require(courses[_courseId].courseId != bytes32(0), "CourseManagement: Course does not exist.");

        string[] memory terms = courseOfferingTerms[_courseId];
        CourseOffering[] memory allOfferings = new CourseOffering[](terms.length);

        for (uint i = 0; i < terms.length; i++) {
            allOfferings[i] = courseOfferings[_courseId][terms[i]];
        }
        return allOfferings;
    }

    /**
     * @dev Retrieves a list of static course IDs belonging to a specific department.
     * @param _departmentName The name of the department.
     * @return An array of course IDs.
     */
    function getCoursesByDepartment(string memory _departmentName)
        external
        view
        returns (bytes32[] memory)
    {
        require(bytes(_departmentName).length > 0, "CourseManagement: Department name cannot be empty.");
        return departmentCourses[_departmentName];
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