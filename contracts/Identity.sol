// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

contract Identity is Ownable, Pausable {
    enum UserRole { NONE, STUDENT, INSTITUTION, EMPLOYER, ADMIN }
    
    struct User {
        address userAddress;
        string ipfsHash;  // IPFS hash containing user details
        UserRole role;
        bool isVerified;
        uint256 createdAt;
    }
    
    mapping(address => User) public users;
    mapping(address => bool) public institutions;
    mapping(address => bool) public admins;
    
    event UserRegistered(address indexed userAddress, UserRole role);
    event UserVerified(address indexed userAddress);
    event InstitutionAdded(address indexed institution);
    event AdminAdded(address indexed admin);
    event AdminRemoved(address indexed admin);
    
    modifier onlyVerifiedInstitution() {
        require(institutions[msg.sender] && users[msg.sender].isVerified, "Not a verified institution");
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
        users[_admin] = User(
            _admin,
            "",
            UserRole.ADMIN,
            true,
            block.timestamp
        );
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
    
    function registerUser(UserRole _role, string memory _ipfsHash) external whenNotPaused {
        require(users[msg.sender].userAddress == address(0), "User already exists");
        require(_role != UserRole.NONE && _role != UserRole.ADMIN, "Invalid role");
        
        users[msg.sender] = User(
            msg.sender,
            _ipfsHash,
            _role,
            false,
            block.timestamp
        );
        
        if (_role == UserRole.INSTITUTION) {
            institutions[msg.sender] = true;
            emit InstitutionAdded(msg.sender);  // Add this line
        }
        
        emit UserRegistered(msg.sender, _role);
    }
    
    function verifyUser(address _userAddress) external onlyAdmin {
        require(users[_userAddress].userAddress != address(0), "User does not exist");
        require(!users[_userAddress].isVerified, "User already verified");
        
        users[_userAddress].isVerified = true;
        emit UserVerified(_userAddress);
    }
    
    function updateUserIPFS(string memory _newIpfsHash) external whenNotPaused {
        require(users[msg.sender].userAddress != address(0), "User does not exist");
        users[msg.sender].ipfsHash = _newIpfsHash;
    }
    
    function getUserRole(address _userAddress) external view returns (UserRole) {
        return users[_userAddress].role;
    }
    
    function isVerifiedUser(address _userAddress) external view returns (bool) {
        return users[_userAddress].isVerified;
    }
    
    function updateUserRole(address _userAddress, UserRole _newRole) external onlyAdmin {
        require(users[_userAddress].userAddress != address(0), "User does not exist");
        require(_newRole != UserRole.NONE && _newRole != UserRole.ADMIN, "Invalid role");
        
        UserRole oldRole = users[_userAddress].role;
        users[_userAddress].role = _newRole;
        
        if (_newRole == UserRole.INSTITUTION) {
            institutions[_userAddress] = true;
        } else if (oldRole == UserRole.INSTITUTION) {
            institutions[_userAddress] = false;
        }
        
        emit UserRegistered(_userAddress, _newRole);
    }
    
    // Emergency functions
    function pause() external onlyAdmin {
        _pause();
    }
    
    function unpause() external onlyAdmin {
        _unpause();
    }
    
    // Add this function to check if an address is registered as an institution
    function isInstitution(address _address) public view returns (bool) {
        return institutions[_address];
    }
}