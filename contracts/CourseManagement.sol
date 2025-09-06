// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "./Identity.sol";

contract CourseManagement is Ownable, Pausable {
    Identity public identityContract;

    struct Course {
        string courseId;
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

    // Course data
    mapping(string => Course) public courses;
    mapping(string => mapping(string => CourseOffering)) public courseOfferings;
    mapping(string => string[]) public courseOfferingTerms;
    mapping(string => string[]) public departmentCourses;
    
    string public currentActiveSemester;
    string[] private departmentNames;
    mapping(string => bool) private departments;

    // Events
    event CourseAdded(string indexed courseId, string name, string department);
    event CourseDetailsUpdated(string indexed courseId, string name, uint256 credits, string department);
    event CourseDeactivated(string indexed courseId);
    event CourseOfferingAdded(string indexed courseId, string indexed semester, string doctorName);
    event CourseOfferingUpdated(
        string indexed courseId,
        string indexed semester,
        string doctorName,
        uint256 examDate,
        string bookTitle
    );
    event CurrentActiveSemesterUpdated(string oldSemester, string newSemester);
    event DepartmentAdded(string departmentName);

    modifier onlyVerifiedInstitution() {
        require(
            identityContract.isVerifiedUser(msg.sender) &&
            identityContract.getUserRole(msg.sender) == Identity.UserRole.INSTITUTION,
            "Not a verified institution"
        );
        _;
    }

    constructor(address _identityContractAddress) {
        require(_identityContractAddress != address(0), "Invalid identity contract address");
        identityContract = Identity(_identityContractAddress);
    }

    function addCourse(
        string memory _courseId,
        string memory _name,
        uint256 _credits,
        string memory _department
    ) external onlyVerifiedInstitution {
        require(bytes(_courseId).length > 0, "Course ID cannot be empty");
        require(bytes(_name).length > 0, "Course name cannot be empty");
        require(bytes(_department).length > 0, "Department cannot be empty");
        require(courses[_courseId].creationDate == 0, "Course already exists");
        require(departments[_department], "Department does not exist");

        courses[_courseId] = Course({
            courseId: _courseId,
            name: _name,
            credits: _credits,
            department: _department,
            isActive: true,
            creationDate: block.timestamp
        });

        departmentCourses[_department].push(_courseId);
        emit CourseAdded(_courseId, _name, _department);
    }

    function addDepartment(string memory _departmentName) external onlyVerifiedInstitution {
        require(bytes(_departmentName).length > 0, "Department name cannot be empty");
        require(!departments[_departmentName], "Department already exists");

        departments[_departmentName] = true;
        departmentNames.push(_departmentName);
        emit DepartmentAdded(_departmentName);
    }

    function updateCourseStaticDetails(
        string memory _courseId,
        string memory _newName,
        uint256 _newCredits,
        string memory _newDepartment
    ) external onlyVerifiedInstitution {
        require(courses[_courseId].creationDate > 0, "Course does not exist");
        require(bytes(_newName).length > 0, "Course name cannot be empty");
        require(departments[_newDepartment], "Department does not exist");

        Course storage course = courses[_courseId];
        course.name = _newName;
        course.credits = _newCredits;
        course.department = _newDepartment;

        emit CourseDetailsUpdated(_courseId, _newName, _newCredits, _newDepartment);
    }

    function deactivateCourse(string memory _courseId) external onlyVerifiedInstitution {
        require(courses[_courseId].creationDate > 0, "Course does not exist");
        require(courses[_courseId].isActive, "Course is already inactive");

        courses[_courseId].isActive = false;
        emit CourseDeactivated(_courseId);
    }

    function setCurrentActiveSemester(string memory _semester) external onlyVerifiedInstitution {
        require(bytes(_semester).length > 0, "Semester cannot be empty");
        string memory oldSemester = currentActiveSemester;
        currentActiveSemester = _semester;
        emit CurrentActiveSemesterUpdated(oldSemester, _semester);
    }

    function addCourseOffering(
        string memory _courseId,
        string memory _semester,
        string memory _doctorName,
        uint256 _examDate,
        string memory _bookTitle
    ) external onlyVerifiedInstitution {
        require(courses[_courseId].creationDate > 0, "Course does not exist");
        require(courses[_courseId].isActive, "Course is inactive");
        require(bytes(_semester).length > 0, "Semester cannot be empty");
        require(bytes(_doctorName).length > 0, "Doctor name cannot be empty");
        require(
            keccak256(abi.encodePacked(courseOfferings[_courseId][_semester].semester)) == keccak256(abi.encodePacked("")),
            "Course offering already exists for this semester"
        );

        courseOfferings[_courseId][_semester] = CourseOffering({
            semester: _semester,
            doctorName: _doctorName,
            examDate: _examDate,
            bookTitle: _bookTitle,
            isAvailableForEnrollment: true
        });

        // Check if semester exists in terms array
        bool semesterExists = false;
        for (uint i = 0; i < courseOfferingTerms[_courseId].length; i++) {
            if (keccak256(abi.encodePacked(courseOfferingTerms[_courseId][i])) == keccak256(abi.encodePacked(_semester))) {
                semesterExists = true;
                break;
            }
        }
        if (!semesterExists) {
            courseOfferingTerms[_courseId].push(_semester);
        }

        emit CourseOfferingAdded(_courseId, _semester, _doctorName);
    }

    // View Functions
    function isDepartmentExist(string memory _departmentName) public view returns (bool) {
        return departments[_departmentName];
    }

    function getAllDepartments() external view returns (string[] memory) {
        return departmentNames;
    }

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
        return (
            course.courseId,
            course.name,
            course.credits,
            course.department,
            course.isActive,
            course.creationDate
        );
    }

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
        CourseOffering memory offering = courseOfferings[_courseId][_semester];
        return (
            offering.semester,
            offering.doctorName,
            offering.examDate,
            offering.bookTitle,
            offering.isAvailableForEnrollment
        );
    }

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
        CourseOffering memory offering = courseOfferings[_courseId][currentActiveSemester];
        return (
            offering.semester,
            offering.doctorName,
            offering.examDate,
            offering.bookTitle,
            offering.isAvailableForEnrollment
        );
    }

    function getAllCourseOfferingsForCourse(string memory _courseId)
        external
        view
        returns (CourseOffering[] memory)
    {
        string[] memory terms = courseOfferingTerms[_courseId];
        CourseOffering[] memory allOfferings = new CourseOffering[](terms.length);

        for (uint i = 0; i < terms.length; i++) {
            allOfferings[i] = courseOfferings[_courseId][terms[i]];
        }

        return allOfferings;
    }

    function getCoursesByDepartment(string memory _departmentName)
        external
        view
        returns (Course[] memory)
    {
        string[] memory deptCourses = departmentCourses[_departmentName];
        Course[] memory result = new Course[](deptCourses.length);

        for (uint i = 0; i < deptCourses.length; i++) {
            result[i] = courses[deptCourses[i]];
        }

        return result;
    }
}
