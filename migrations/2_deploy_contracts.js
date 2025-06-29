const Identity = artifacts.require("Identity");
const Certificates = artifacts.require("Certificates");
const Examinations = artifacts.require("Examinations");
const ExamManagement = artifacts.require("ExamManagement");
const SecurityUtils = artifacts.require("SecurityUtils");
const CourseManagement = artifacts.require("CourseManagement");
const StudentAcademicManager = artifacts.require("StudentAcademicManager");

module.exports = async function(deployer, network, accounts) {
    // The owner is automatically registered in the Identity constructor
    await deployer.deploy(Identity);
    const identityInstance = await Identity.deployed();
    
    await deployer.deploy(SecurityUtils, identityInstance.address);
    const securityUtilsInstance = await SecurityUtils.deployed();
    
    await deployer.deploy(CourseManagement, identityInstance.address);
    const courseManagementInstance = await CourseManagement.deployed();
          
    // Deploy StudentAcademicManager first with a placeholder for Certificates address
    const dummyCertificatesAddress = "0x0000000000000000000000000000000000000000";
    await deployer.deploy(StudentAcademicManager, identityInstance.address, dummyCertificatesAddress);
    const studentAcademicManagerInstance = await StudentAcademicManager.deployed();

    // Deploy Certificates with the actual StudentAcademicManager address
    await deployer.deploy(Certificates, identityInstance.address, studentAcademicManagerInstance.address);
    const certificatesInstance = await Certificates.deployed();

    // Now, update the StudentAcademicManager with the actual Certificates address
    await studentAcademicManagerInstance.setCertificatesContract(certificatesInstance.address);
    
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