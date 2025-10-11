const Identity = artifacts.require("Identity");
const Certificates = artifacts.require("Certificates");
const Examinations = artifacts.require("Examinations");
const ExamManagement = artifacts.require("ExamManagement");
const SecurityUtils = artifacts.require("SecurityUtils");
const CourseManagement = artifacts.require("CourseManagement");
const StudentAcademicManager = artifacts.require("StudentAcademicManager");

module.exports = async function(deployer, network, accounts) {
    await deployer.deploy(SecurityUtils);
    const securityUtilsInstance = await SecurityUtils.deployed();
    
    await deployer.deploy(Identity);
    const identityInstance = await Identity.deployed();
    
    await deployer.deploy(CourseManagement, identityInstance.address);
    const courseManagementInstance = await CourseManagement.deployed();
    
    await deployer.deploy(StudentAcademicManager, identityInstance.address, courseManagementInstance.address);
    const studentAcademicManagerInstance = await StudentAcademicManager.deployed();
    
    await deployer.deploy(Certificates, identityInstance.address);
    const certificatesInstance = await Certificates.deployed();
    
    await deployer.deploy(Examinations, identityInstance.address);
    const examinationsInstance = await Examinations.deployed();
    
    await deployer.deploy(ExamManagement, identityInstance.address);
    const examManagementInstance = await ExamManagement.deployed();
    
    if (network !== 'development' && network !== 'test') {
        console.log('SecurityUtils contract deployed at:', securityUtilsInstance.address);
        console.log('Identity contract deployed at:', identityInstance.address);
        console.log('Certificates contract deployed at:', certificatesInstance.address);
        console.log('Examinations contract deployed at:', examinationsInstance.address);
        console.log('ExamManagement contract deployed at:', examManagementInstance.address);
    }
};