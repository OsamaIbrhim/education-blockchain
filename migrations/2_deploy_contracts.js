const Identity = artifacts.require("Identity");
const Certificates = artifacts.require("Certificates");
const Examinations = artifacts.require("Examinations");
const ExamManagement = artifacts.require("ExamManagement");
const SecurityUtils = artifacts.require("SecurityUtils");
const CourseManagement = artifacts.require("CourseManagement");
const StudentAcademicManager = artifacts.require("StudentAcademicManager");

module.exports = async function(deployer, network, accounts) {
    const _institutionOwner = accounts[0];

    const ownerNationalId = "00000000000000";
    const ownerFirstName = "Menofia";
    const ownerLastName = "University";
    const ownerPhoneNumber = "+2048 2224216";
    const ownerEmail = "menofia@menofia.edu.eg";

    await deployer.deploy(
        Identity,
        _institutionOwner,
        ownerNationalId,
        ownerFirstName,
        ownerLastName,
        ownerPhoneNumber,
        ownerEmail
    );
    const identityInstance = await Identity.deployed();
    
    await deployer.deploy(SecurityUtils, identityInstance.address);
    const securityUtilsInstance = await SecurityUtils.deployed();
    
    await deployer.deploy(CourseManagement, identityInstance.address);
    const courseManagementInstance = await CourseManagement.deployed();
          
    const dummyAddress = "0x0000000000000000000000000000000000000001";
    await deployer.deploy(StudentAcademicManager, identityInstance.address, dummyAddress);
    const studentAcademicManagerInstance = await StudentAcademicManager.deployed();

    await deployer.deploy(Certificates, identityInstance.address, studentAcademicManagerInstance.address);
    const certificatesInstance = await Certificates.deployed();
    
    await deployer.deploy(Examinations, identityInstance.address);
    const examinationsInstance = await Examinations.deployed();
    
    await deployer.deploy(ExamManagement, identityInstance.address, studentAcademicManagerInstance.address);
    const examManagementInstance = await ExamManagement.deployed();

    // console.log('Identity contract deployed at:', identityInstance.address);
    // console.log('SecurityUtils contract deployed at:', securityUtilsInstance.address);
    // console.log('Certificates contract deployed at:', certificatesInstance.address);
    // console.log('Examinations contract deployed at:', examinationsInstance.address);
    // console.log('ExamManagement contract deployed at:', examManagementInstance.address);
    // console.log('CourseManagement contract deployed at:', courseManagementInstance.address);
    // console.log('StudentAcademicManager contract deployed at:', studentAcademicManagerInstance.address);
};