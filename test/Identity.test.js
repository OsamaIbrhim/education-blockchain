const Identity = artifacts.require("Identity");
const { expectRevert, expectEvent } = require('@openzeppelin/test-helpers');

contract("Identity", accounts => {
    const [admin, student, institution, employer] = accounts;
    let identityContract;

    beforeEach(async () => {
        identityContract = await Identity.new({ from: admin });
    });

    describe("User Registration", () => {
        it("should register a student", async () => {
            const ipfsHash = "QmTest123";
            const tx = await identityContract.registerUser(1, ipfsHash, { from: student });
            
            expectEvent(tx, 'UserRegistered', {
                userAddress: student,
                role: '1'
            });

            const user = await identityContract.users(student);
            assert.equal(user.role, '1', "Incorrect role");
            assert.equal(user.ipfsHash, ipfsHash, "Incorrect IPFS hash");
            assert.equal(user.isVerified, false, "Should not be verified initially");
        });

        it("should register an institution", async () => {
            const ipfsHash = "QmTest456";
            await identityContract.registerUser(2, ipfsHash, { from: institution });
            
            const isInstitution = await identityContract.institutions(institution);
            assert.equal(isInstitution, true, "Should be marked as institution");
        });

        it("should not allow duplicate registration", async () => {
            await identityContract.registerUser(1, "QmTest123", { from: student });
            await expectRevert(
                identityContract.registerUser(1, "QmTest123", { from: student }),
                "User already exists"
            );
        });
    });

    describe("User Verification", () => {
        beforeEach(async () => {
            await identityContract.registerUser(1, "QmTest123", { from: student });
        });

        it("should allow admin to verify user", async () => {
            const tx = await identityContract.verifyUser(student, { from: admin });
            
            expectEvent(tx, 'UserVerified', {
                userAddress: student
            });

            const user = await identityContract.users(student);
            assert.equal(user.isVerified, true, "User should be verified");
        });

        it("should not allow non-admin to verify user", async () => {
            await expectRevert(
                identityContract.verifyUser(student, { from: student }),
                "Ownable: caller is not the owner"
            );
        });
    });

    describe("Emergency Functions", () => {
        it("should allow admin to pause and unpause", async () => {
            await identityContract.pause({ from: admin });
            assert.equal(await identityContract.paused(), true, "Contract should be paused");

            await identityContract.unpause({ from: admin });
            assert.equal(await identityContract.paused(), false, "Contract should be unpaused");
        });

        it("should not allow operations when paused", async () => {
            await identityContract.pause({ from: admin });
            await expectRevert(
                identityContract.registerUser(1, "QmTest123", { from: student }),
                "Pausable: paused"
            );
        });
    });
}); 