// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract Identity is Ownable, Pausable {
    using Counters for Counters.Counter;

    enum UserRole {
        NONE,
        STUDENT,
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
    mapping(address => bool) public admins;
    mapping(address => mapping(address => bool)) public institutionStudents;

    // This counter will help in iterating through users.
    Counters.Counter private _userCount;
    // Mapping from index to user address
    mapping(uint256 => address) private _userAddresses;


    event UserRegistered(address indexed userAddress, UserRole indexed role);
    event UserVerified(address indexed userAddress);
    event VerificationRevoked(address indexed userAddress);
    event AdminAdded(address indexed admin);
    event AdminRemoved(address indexed admin);
    event StudentStatusUpdated(address indexed studentAddress, uint8 oldStatus, uint8 newStatus);
    event UserRoleUpdated(address indexed user, UserRole oldRole, UserRole newRole);

    modifier onlyVerified() {
        require(users[msg.sender].isVerified, "Not a verified user");
        _;
    }

    modifier onlyAdmin() {
        require(admins[msg.sender] || msg.sender == owner(), "Not an admin");
        _;
    }

    constructor() {
        address _initialOwner = msg.sender;
        users[_initialOwner] = User(
            _initialOwner,
            UserRole.ADMIN,
            "N/A", // Initial owner has no profile data initially
            "Owner",
            "Admin",
            "N/A",
            "N/A",
            new string[](0),
            0,
            true
        );
        admins[_initialOwner] = true;
        _userAddresses[_userCount.current()] = _initialOwner;
        _userCount.increment();
        emit AdminAdded(_initialOwner);
        emit UserRegistered(_initialOwner, UserRole.ADMIN);
        emit UserVerified(_initialOwner);
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

    function isVerifiedUser(address _userAddress) external view returns (bool) {
        return users[_userAddress].isVerified;
    }

    function registerUser(
        address userAddress,
        UserRole _role,
        string memory nationalId,
        string memory firstName,
        string memory lastName,
        string memory phoneNumber,
        string memory email
    ) external whenNotPaused onlyAdmin {
        require(users[userAddress].userAddress == address(0), "User already exists");
        require(_role != UserRole.NONE, "Invalid role");

        if (_role == UserRole.ADMIN) {
            require(msg.sender == owner(), "Only owner can add admins");
            admins[userAddress] = true;
            emit AdminAdded(userAddress);
        }

        users[userAddress] = User(
            userAddress,
            _role,
            nationalId,
            firstName,
            lastName,
            phoneNumber,
            email,
            new string[](0),
            0, // Status will be updated below if student
            true // isVerified by default when registered by admin
        );

        if (_role == UserRole.STUDENT) {
            institutionStudents[owner()][userAddress] = true;
            users[userAddress].status = 1; // Enrolled status
        }

        _userAddresses[_userCount.current()] = userAddress;
        _userCount.increment();

        emit UserRegistered(userAddress, _role);
        emit UserVerified(userAddress);
    }

    function selfRegister(
        UserRole _role,
        string memory nationalId,
        string memory firstName,
        string memory lastName,
        string memory phoneNumber,
        string memory email
    ) external whenNotPaused {
        require(users[msg.sender].userAddress == address(0), "User already exists");
        require(_role == UserRole.STUDENT || _role == UserRole.EMPLOYER, "Self-registration only for students or employers");

        users[msg.sender] = User(
            msg.sender,
            _role,
            nationalId,
            firstName,
            lastName,
            phoneNumber,
            email,
            new string[](0),
            0, // Status will be updated below if student
            false // isVerified is false for self-registration
        );

        if (_role == UserRole.STUDENT) {
            institutionStudents[owner()][msg.sender] = true;
            users[msg.sender].status = 1; // Enrolled status
        }

        _userAddresses[_userCount.current()] = msg.sender;
        _userCount.increment();

        emit UserRegistered(msg.sender, _role);
    }

    function completeUserProfile(
        string memory nationalId,
        string memory firstName,
        string memory lastName,
        string memory phoneNumber,
        string memory email
    ) external {
        require(users[msg.sender].userAddress != address(0), "User does not exist");
        require(users[msg.sender].role == UserRole.STUDENT || users[msg.sender].role == UserRole.EMPLOYER, "Not a student or employer");
        // Allow update only if not verified
        require(!users[msg.sender].isVerified, "Already verified");

        users[msg.sender].nationalId = nationalId;
        users[msg.sender].firstName = firstName;
        users[msg.sender].lastName = lastName;
        users[msg.sender].phoneNumber = phoneNumber;
        users[msg.sender].email = email;
    }

    function verifyUser(address _userAddress) external onlyAdmin {
        require(users[_userAddress].userAddress != address(0), "User does not exist");
        require(!users[_userAddress].isVerified, "User already verified");

        users[_userAddress].isVerified = true;
        emit UserVerified(_userAddress);
    }

    function revokeVerification(address _userAddress) external onlyAdmin {
        require(users[_userAddress].userAddress != address(0), "User does not exist");
        require(users[_userAddress].isVerified, "User is not verified");
        require(_userAddress != msg.sender, "Admin cannot revoke own verification");
        require(_userAddress != owner(), "Cannot revoke owner's verification");

        users[_userAddress].isVerified = false;
        emit VerificationRevoked(_userAddress);
    }

    function getUnverifiedUsers() external view onlyAdmin returns (address[] memory) {
        uint256 unverifiedCount = 0;
        for (uint i = 0; i < _userCount.current(); i++) {
            if (!users[_userAddresses[i]].isVerified) {
                unverifiedCount++;
            }
        }

        address[] memory unverifiedAddresses = new address[](unverifiedCount);
        uint256 index = 0;
        for (uint i = 0; i < _userCount.current(); i++) {
            address userAddr = _userAddresses[i];
            if (!users[userAddr].isVerified) {
                unverifiedAddresses[index] = userAddr;
                index++;
            }
        }
        return unverifiedAddresses;
    }

    function addStudents(address[] memory studentAddresses) external onlyAdmin {
        for (uint i = 0; i < studentAddresses.length; i++) {
            address studentAddr = studentAddresses[i];
            require(users[studentAddr].userAddress != address(0), "Student does not exist");
            require(users[studentAddr].role == UserRole.STUDENT, "User is not a student");

            if (!institutionStudents[owner()][studentAddr]) {
                institutionStudents[owner()][studentAddr] = true;
                users[studentAddr].status = 1; // Enrolled status
                emit StudentStatusUpdated(studentAddr, 0, 1);
            }
        }
    }

    function removeStudents(address[] memory studentAddresses) external onlyAdmin {
        for (uint i = 0; i < studentAddresses.length; i++) {
            address studentAddr = studentAddresses[i];
            if (institutionStudents[owner()][studentAddr]) {
                delete institutionStudents[owner()][studentAddr];
                users[studentAddr].status = 0; // Not enrolled status
                emit StudentStatusUpdated(studentAddr, 1, 0);
            }
        }
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

    function updateUserRole(address _userAddress, UserRole _newRole) external onlyAdmin {
        require(
            _userAddress != address(0),
            "Invalid user address"
        );
        require(
            _newRole != UserRole.NONE && _newRole != UserRole.ADMIN,
            "Invalid role"
        );

        UserRole oldRole = users[_userAddress].role;
        users[_userAddress].role = _newRole;

        emit UserRoleUpdated(_userAddress, oldRole, _newRole);
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

    function isStudentEnrolled(address _student) external view returns (bool) {
        return institutionStudents[owner()][_student];
    }
}
