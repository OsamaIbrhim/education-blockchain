const Identity = artifacts.require("Identity");
const Certificates = artifacts.require("Certificates");
const Examinations = artifacts.require("Examinations");
const ExamManagement = artifacts.require("ExamManagement");
const SecurityUtils = artifacts.require("SecurityUtils");

module.exports = async function(deployer, network, accounts) {
    // Deploy SecurityUtils first
    await deployer.deploy(SecurityUtils);
    const securityUtilsInstance = await SecurityUtils.deployed();
    
    // Deploy Identity contract
    await deployer.deploy(Identity);
    const identityInstance = await Identity.deployed();
    
    // Deploy Certificates contract with Identity contract address
    await deployer.deploy(Certificates, identityInstance.address);
    const certificatesInstance = await Certificates.deployed();
    
    // Deploy Examinations contract with Identity contract address
    await deployer.deploy(Examinations, identityInstance.address);
    const examinationsInstance = await Examinations.deployed();
    
    // Deploy ExamManagement contract with required addresses
    await deployer.deploy(
        ExamManagement, 
        identityInstance.address,
        certificatesInstance.address,
        examinationsInstance.address
    );
    const examManagementInstance = await ExamManagement.deployed();
    
    // If we're on a testnet or mainnet, verify contracts on Etherscan
    if (network !== 'development' && network !== 'test') {
        console.log('SecurityUtils contract deployed at:', securityUtilsInstance.address);
        console.log('Identity contract deployed at:', identityInstance.address);
        console.log('Certificates contract deployed at:', certificatesInstance.address);
        console.log('Examinations contract deployed at:', examinationsInstance.address);
        console.log('ExamManagement contract deployed at:', examManagementInstance.address);
    }
}; 