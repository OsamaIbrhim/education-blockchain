// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

contract Identity is Ownable, Pausable {
    enum UserRole {
        NONE,
        STUDENT,
        INSTITUTION,
        EMPLOYER,
        ADMIN
    }

    struct User {
        address userAddress;
        UserRole role;
        string nationalId;
        string firstName;
        string lastName;
        string phoneNumber;
        string email;
        string[] enrolledCourses;
        uint8 status;
        bool isVerified;
    }

    mapping(address => User) public users;
    mapping(address => bool) public institutions;
    mapping(address => bool) public admins;
    mapping(address => mapping(address => bool)) public institutionStudents;

    address public institutionOwner;

    event UserRegistered(address indexed userAddress, UserRole indexed role);
    event UserVerified(address indexed userAddress);
    event AdminAdded(address indexed admin);
    event AdminRemoved(address indexed admin);
    event StudentStatusUpdated(address indexed studentAddress, uint8 oldStatus, uint8 newStatus);
    event UserRoleUpdated(address indexed user, UserRole oldRole, UserRole newRole);

    modifier onlyInstitution() {
        require(users[msg.sender].role == UserRole.INSTITUTION, "Not an institution");
        _;
    }

    modifier onlyVerified() {
        require(users[msg.sender].isVerified, "Not a verified user");
        _;
    }

    modifier onlyAdmin() {
        require(admins[msg.sender] || msg.sender == owner(), "Not an admin");
        _;
    }

    modifier onlyInstitutionOwner() {
        require(msg.sender == institutionOwner, "Not institution owner");
        _;
    }

    constructor(
        address _institutionOwner,
        string memory ownerNationalId,
        string memory ownerFirstName,
        string memory ownerLastName,
        string memory ownerPhoneNumber,
        string memory ownerEmail
    ) {
        require(_institutionOwner != address(0), "Invalid institution owner");
        institutionOwner = _institutionOwner;
        users[_institutionOwner] = User(
            _institutionOwner,
            UserRole.ADMIN,
            ownerNationalId,
            ownerFirstName,
            ownerLastName,
            ownerPhoneNumber,
            ownerEmail,
            new string[](0),
            0,
            true
        );
        admins[_institutionOwner] = true;
        emit AdminAdded(_institutionOwner);
        emit UserRegistered(_institutionOwner, UserRole.ADMIN);
        emit UserVerified(_institutionOwner);
    }

    function addAdmin(
        address _newAdmin,
        string memory nationalId,
        string memory firstName,
        string memory lastName,
        string memory phoneNumber,
        string memory email
    ) external onlyOwner {
        require(!admins[_newAdmin], "Already an admin");
        users[_newAdmin] = User(
            _newAdmin,
            UserRole.ADMIN,
            nationalId,
            firstName,
            lastName,
            phoneNumber,
            email,
            new string[](0),
            0,
            true
        );
        admins[_newAdmin] = true;
        emit AdminAdded(_newAdmin);
        emit UserRegistered(_newAdmin, UserRole.ADMIN);
        emit UserVerified(_newAdmin);
    }

    function removeAdmin(address _admin) external onlyOwner {
        require(_admin != owner(), "Cannot remove owner");
        require(admins[_admin], "Not an admin");
        admins[_admin] = false;
        users[_admin].role = UserRole.NONE;
        users[_admin].isVerified = false;
        emit AdminRemoved(_admin);
    }

    function isAdmin(address _address) public view returns (bool) {
        return admins[_address] || _address == owner();
    }

    function isInstitution(address _address) public view returns (bool) {
        return institutions[_address];
    }

    function isVerifiedUser(address _userAddress) external view returns (bool) {
        return users[_userAddress].isVerified;
    }

    function adminRegisterStudent(
        address studentAddress,
        string memory nationalId,
        string memory firstName,
        string memory lastName,
        string memory phoneNumber,
        string memory email
    ) external onlyAdmin {
        require(users[studentAddress].userAddress == address(0), "User already exists");
        users[studentAddress] = User(
            studentAddress,
            UserRole.STUDENT,
            nationalId,
            firstName,
            lastName,
            phoneNumber,
            email,
            new string[](0),
            0,
            true // isVerified
        );
        emit UserRegistered(studentAddress, UserRole.STUDENT);
        emit UserVerified(studentAddress);
    }

    function registerUser(
        UserRole _role,
        address _institutionAddress,
        string memory nationalId,
        string memory firstName,
        string memory lastName,
        string memory phoneNumber,
        string memory email
    ) external whenNotPaused {
        require(users[msg.sender].userAddress == address(0), "User already exists");
        require(_role == UserRole.STUDENT, "Only students can self-register");
        require(_institutionAddress == institutionOwner, "Invalid institution");

        users[msg.sender] = User(
            msg.sender,
            _role,
            nationalId,
            firstName,
            lastName,
            phoneNumber,
            email,
            new string[](0),
            0,
            false // isVerified
        );

        emit UserRegistered(msg.sender, _role);
    }

    function completeStudentProfile(
        string memory nationalId,
        string memory firstName,
        string memory lastName,
        string memory phoneNumber,
        string memory email
    ) external {
        require(users[msg.sender].userAddress != address(0), "User does not exist");
        require(users[msg.sender].role == UserRole.STUDENT, "Not a student");
        // Allow update only if not verified
        require(!users[msg.sender].isVerified, "Already verified");

        users[msg.sender].nationalId = nationalId;
        users[msg.sender].firstName = firstName;
        users[msg.sender].lastName = lastName;
        users[msg.sender].phoneNumber = phoneNumber;
        users[msg.sender].email = email;
        // No event needed, UI can fetch updated data
    }

    function verifyUser(address _userAddress) external onlyInstitutionOwner {
        require(users[_userAddress].userAddress != address(0), "User does not exist");
        require(!users[_userAddress].isVerified, "User already verified");
        require(users[_userAddress].role == UserRole.STUDENT, "Only students can be verified by institution");

        users[_userAddress].isVerified = true;
        emit UserVerified(_userAddress);
    }

    function addStudents(address[] memory studentAddresses) external onlyVerified onlyInstitution {
        for (uint i = 0; i < studentAddresses.length; i++) {
            address studentAddress = studentAddresses[i];

            require(users[studentAddress].userAddress != address(0), "User does not exist");

            require(users[studentAddress].role == UserRole.STUDENT, "User is not a student");

            if (institutionStudents[msg.sender][studentAddress]) {
                continue;
            }

            institutionStudents[msg.sender][studentAddress] = true;
        }
    }

    function getUserRole(
        address _userAddress
    ) external view returns (UserRole) {
        return users[_userAddress].role;
    }

    function updateUserRole(
        address _userAddress,
        UserRole _newRole
    ) external onlyAdmin {
        require(
            users[_userAddress].userAddress != address(0),
            "User does not exist"
        );
        require(
            _newRole != UserRole.NONE && _newRole != UserRole.ADMIN,
            "Invalid role"
        );

        UserRole oldRole = users[_userAddress].role;
        users[_userAddress].role = _newRole;

        if (_newRole == UserRole.INSTITUTION) {
            institutions[_userAddress] = true;
        } else if (oldRole == UserRole.INSTITUTION) {
            delete institutions[_userAddress];
        }

        emit UserRoleUpdated(_userAddress, oldRole, _newRole);
    }

    function getStudentData(address _studentAddress)
        external
        view
        returns (
            string memory nationalId,
            string memory firstName,
            string memory lastName,
            string memory phoneNumber,
            string memory email,
            string[] memory enrolledCourses,
            uint8 role,
            bool isVerified,
            uint8 status
        )
    {
        User memory user = users[_studentAddress];

        require(user.userAddress != address(0), "User does not exist");

        return (
            user.nationalId,
            user.firstName,
            user.lastName,
            user.phoneNumber,
            user.email,
            user.enrolledCourses,
            uint8(user.role),
            user.isVerified,
            user.status
        );
    }

    function updateStudentStatus(address _studentAddress, uint8 _newStatus) external onlyAdmin {
        require(
            users[_studentAddress].userAddress != address(0),
            "User does not exist"
        );
        uint8 oldStatus = users[_studentAddress].status;
        users[_studentAddress].status = _newStatus;

        emit StudentStatusUpdated(_studentAddress, oldStatus, _newStatus);
    }

    // Emergency functions
    function pause() external onlyAdmin {
        _pause();
    }

    function unpause() external onlyAdmin {
        _unpause();
    }

    function userExists(address _userAddress) external view returns (bool) {
        return users[_userAddress].userAddress != address(0);
    }

    function isStudentEnrolled(address _institution, address _student) external view returns (bool) {
        return institutionStudents[_institution][_student];
    }
}
