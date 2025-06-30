// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "./Identity.sol";

contract CourseManagement is Ownable, Pausable {
    string[] public departmentNames;
    mapping(string => bool) public isDepartmentExist;

    struct Course {
        string courseId; // Changed from bytes32 to string
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

    mapping(string => Course) public courses; // Updated mapping key type from bytes32 to string
    mapping(string => mapping(string => CourseOffering)) public courseOfferings; // Updated mapping key type
    mapping(string => string[]) public courseOfferingTerms; // Updated mapping key type
    mapping(string => string[]) public departmentCourses;

    string public currentActiveSemester;

    Identity public identityContract;

    event CourseAdded(string indexed courseId, string name, string department);
    event CourseDetailsUpdated(string indexed courseId, string name, uint256 credits, string department);
    event CourseDeactivated(string indexed courseId);
    event CourseOfferingAdded(string indexed courseId, string indexed semester, string doctorName);
    event CourseOfferingUpdated(string indexed courseId, string indexed semester, string doctorName, uint256 examDate, string bookTitle);
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
    modifier courseExists(string memory _courseId) {
        require(bytes(courses[_courseId].courseId).length > 0, "CourseManagement: Course does not exist.");
        require(courses[_courseId].isActive, "CourseManagement: Course is inactive.");
        _;
    }

    /**
     * @dev Checks if a course exists and is active.
     * @param _courseId The unique identifier of the course.
     * @return bool True if the course exists and is active, false otherwise.
     */
    function isCourseExist(string memory _courseId) external view returns (bool) {
        return bytes(courses[_courseId].courseId).length > 0 && courses[_courseId].isActive;
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
        string memory _courseId,
        string memory _name,
        uint256 _credits,
        string memory _department
    ) external onlyAdminOrOwner whenNotPaused {
        require(bytes(courses[_courseId].courseId).length == 0, "CourseManagement: Course ID already exists.");
        require(_credits > 0, "CourseManagement: Credits must be greater than 0.");
        require(bytes(_name).length > 0, "CourseManagement: Course name cannot be empty.");
        require(bytes(_department).length > 0, "CourseManagement: Department cannot be empty.");
        require(isDepartmentExist[_department], "CourseManagement: Department does not exist. Please add it first.");

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
            if (keccak256(abi.encodePacked(departmentCourses[_department][i])) == keccak256(abi.encodePacked(_courseId))) {
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
        string memory _courseId,
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
            require(isDepartmentExist[_newDepartment], "CourseManagement: New department does not exist. Please add it first.");
            for (uint i = 0; i < departmentCourses[oldDepartment].length; i++) {
                if (keccak256(abi.encodePacked(departmentCourses[oldDepartment][i])) == keccak256(abi.encodePacked(_courseId))) {
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
     * @dev Adds a new department to the system.
     * Only the owner (University) or an Admin can add departments.
     * @param _departmentName The name of the department to add.
     */
    function addDepartment(string memory _departmentName) external onlyAdminOrOwner whenNotPaused {
        require(bytes(_departmentName).length > 0, "CourseManagement: Department name cannot be empty.");
        require(!isDepartmentExist[_departmentName], "CourseManagement: Department already exists.");
        departmentNames.push(_departmentName);
        isDepartmentExist[_departmentName] = true;
    }

    /**
     * @dev Deactivates a static course, preventing new offerings for it.
     * Only the owner (University) or an Admin can deactivate courses.
     * @param _courseId Unique identifier of the course to deactivate.
     */
    function deactivateCourse(string memory _courseId) external onlyAdminOrOwner whenNotPaused courseExists(_courseId) {
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
        string memory _courseId,
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
        string memory _courseId,
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
    function getCourseStaticDetails(string memory _courseId)
        external
        view
        returns (
            string memory courseId,
            string memory name,
            uint256 credits,
            string memory department,
            bool isActive,
            uint256 creationDate
        )
    {
        Course memory course = courses[_courseId];
        require(bytes(course.courseId).length > 0, "CourseManagement: Course does not exist.");
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
    function getCourseOfferingDetails(string memory _courseId, string memory _semester)
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
        require(bytes(courses[_courseId].courseId).length > 0, "CourseManagement: Course does not exist.");
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
    function getLatestCourseOfferingDetails(string memory _courseId)
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
        require(bytes(courses[_courseId].courseId).length > 0, "CourseManagement: Course does not exist.");
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
    function getAllCourseOfferingsForCourse(string memory _courseId)
        external
        view
        returns (CourseOffering[] memory)
    {
        require(bytes(courses[_courseId].courseId).length > 0, "CourseManagement: Course does not exist.");

        string[] memory terms = courseOfferingTerms[_courseId];
        CourseOffering[] memory allOfferings = new CourseOffering[](terms.length);

        for (uint i = 0; i < terms.length; i++) {
            allOfferings[i] = courseOfferings[_courseId][terms[i]];
        }
        return allOfferings;
    }

    /**
     * @dev Retrieves all courses belonging to a specific department with their full data.
     * @param _departmentName The name of the department.
     * @return An array of Course structs containing all courses in the department.
     */
    function getCoursesByDepartment(string memory _departmentName)
        external
        view
        returns (Course[] memory)
    {
        require(bytes(_departmentName).length > 0, "CourseManagement: Department name cannot be empty.");

        string[] memory courseIds = departmentCourses[_departmentName];
        Course[] memory coursesInDepartment = new Course[](courseIds.length);

        for (uint256 i = 0; i < courseIds.length; i++) {
            coursesInDepartment[i] = courses[courseIds[i]];
        }

        return coursesInDepartment;
    }

    /**
     * @dev Retrieves all courses with their full data.
     * @return An array of Course structs containing all courses.
     */
    function getAllCourses() external view returns (Course[] memory) {
        // Collect all courses from all departments using departmentNames array
        uint256 totalCourses = 0;
        for (uint256 i = 0; i < departmentNames.length; i++) {
            totalCourses += departmentCourses[departmentNames[i]].length;
        }

        Course[] memory allCourses = new Course[](totalCourses);
        uint256 index = 0;

        for (uint256 i = 0; i < departmentNames.length; i++) {
            string[] memory coursesInDepartment = departmentCourses[departmentNames[i]];
            for (uint256 j = 0; j < coursesInDepartment.length; j++) {
                allCourses[index] = courses[coursesInDepartment[j]];
                index++;
            }
        }

        return allCourses;
    }

    /**
     * @dev Returns all available department names.
     * @return An array of all department names.
     */
    function getAllDepartments() external view returns (string[] memory) {
        return departmentNames;
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