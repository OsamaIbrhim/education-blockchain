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
        string ipfsHash;
        UserRole role;
        bool isVerified;
    }

    mapping(address => User) public users;
    mapping(address => bool) public institutions;
    mapping(address => bool) public admins;
    mapping(address => mapping(address => bool)) public institutionStudents;

    event UserRegistered(address indexed userAddress, UserRole indexed role);
    event UserVerified(address indexed userAddress);
    event AdminAdded(address indexed admin);
    event AdminRemoved(address indexed admin);
    event IPFSHashUpdated(address indexed user, string ipfsHash);
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

    constructor() {
        // Set deployer as admin
        _setupAdmin(msg.sender);
    }

    function _setupAdmin(address _admin) private {
        users[_admin] = User(_admin, "", UserRole.ADMIN, true);
        admins[_admin] = true;
        emit AdminAdded(_admin);
        emit UserRegistered(_admin, UserRole.ADMIN);
        emit UserVerified(_admin);
    }

    function addAdmin(address _newAdmin) external onlyOwner {
        require(!admins[_newAdmin], "Already an admin");
        _setupAdmin(_newAdmin);
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

    function registerUser(
        UserRole _role,
        string memory _ipfsHash
    ) external whenNotPaused {
        require(
            users[msg.sender].userAddress == address(0),
            "User already exists"
        );
        require(
            _role != UserRole.NONE && _role != UserRole.ADMIN,
            "Invalid role"
        );

        users[msg.sender] = User(
            msg.sender,
            _ipfsHash,
            _role,
            false
        );

        if (_role == UserRole.INSTITUTION) {
            institutions[msg.sender] = true;
        }

        emit UserRegistered(msg.sender, _role);
    }

    function verifyUser(address _userAddress) external onlyAdmin {
        require(
            users[_userAddress].userAddress != address(0),
            "User does not exist"
        );
        require(!users[_userAddress].isVerified, "User already verified");

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

    function updateUserIPFS(address _userAddress, string memory _newIpfsHash) external whenNotPaused {
        require(
            users[_userAddress].userAddress != address(0),
            "User does not exist"
        );
        users[_userAddress].ipfsHash = _newIpfsHash;
        emit IPFSHashUpdated(_userAddress, _newIpfsHash);
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
