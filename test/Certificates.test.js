const Certificates = artifacts.require("Certificates");
const Identity = artifacts.require("Identity");
const { expectRevert, expectEvent, time } = require('@openzeppelin/test-helpers');

contract("Certificates", accounts => {
    const [admin, institution, student, employer] = accounts;
    let identityContract, certificatesContract;

    beforeEach(async () => {
        // Deploy and setup Identity contract
        identityContract = await Identity.new({ from: admin });
        await identityContract.registerUser(2, "ipfs://institution", { from: institution }); // Register as institution
        await identityContract.verifyUser(institution, { from: admin }); // Verify institution
        
        // Deploy Certificates contract
        certificatesContract = await Certificates.new(identityContract.address, { from: admin });
    });

    describe("Certificate Issuance", () => {
        it("should allow verified institution to issue certificate", async () => {
            const ipfsHash = "QmTest123";
            const tx = await certificatesContract.issueCertificate(
                student,
                ipfsHash,
                { from: institution }
            );

            expectEvent(tx, 'CertificateIssued', {
                student: student,
                institution: institution
            });

            const cert = await certificatesContract.verifyCertificate(tx.logs[0].args.certificateId);
            assert.equal(cert.student, student, "Wrong student address");
            assert.equal(cert.institution, institution, "Wrong institution address");
            assert.equal(cert.ipfsHash, ipfsHash, "Wrong IPFS hash");
            assert.equal(cert.isValid, true, "Certificate should be valid");
        });

        it("should not allow unverified institution to issue certificate", async () => {
            await expectRevert(
                certificatesContract.issueCertificate(student, "QmTest123", { from: employer }),
                "Not a verified institution"
            );
        });

        it("should not allow issuing certificate to zero address", async () => {
            await expectRevert(
                certificatesContract.issueCertificate(
                    "0x0000000000000000000000000000000000000000",
                    "QmTest123",
                    { from: institution }
                ),
                "Invalid student address"
            );
        });
    });

    describe("Certificate Verification", () => {
        let certificateId;

        beforeEach(async () => {
            const tx = await certificatesContract.issueCertificate(
                student,
                "QmTest123",
                { from: institution }
            );
            certificateId = tx.logs[0].args.certificateId;
        });

        it("should allow anyone to verify a certificate", async () => {
            const cert = await certificatesContract.verifyCertificate(certificateId, { from: employer });
            assert.equal(cert.isValid, true, "Certificate should be valid");
        });

        it("should fail for non-existent certificate", async () => {
            const fakeId = web3.utils.sha3("fake");
            await expectRevert(
                certificatesContract.verifyCertificate(fakeId),
                "Certificate does not exist"
            );
        });
    });

    describe("Certificate Revocation", () => {
        let certificateId;

        beforeEach(async () => {
            const tx = await certificatesContract.issueCertificate(
                student,
                "QmTest123",
                { from: institution }
            );
            certificateId = tx.logs[0].args.certificateId;
        });

        it("should allow issuing institution to revoke certificate", async () => {
            const tx = await certificatesContract.revokeCertificate(certificateId, { from: institution });
            expectEvent(tx, 'CertificateRevoked', {
                certificateId: certificateId
            });

            const cert = await certificatesContract.verifyCertificate(certificateId);
            assert.equal(cert.isValid, false, "Certificate should be invalid after revocation");
        });

        it("should not allow non-issuer to revoke certificate", async () => {
            await expectRevert(
                certificatesContract.revokeCertificate(certificateId, { from: employer }),
                "Not certificate issuer"
            );
        });
    });

    describe("Student Certificates", () => {
        beforeEach(async () => {
            // Issue multiple certificates
            await certificatesContract.issueCertificate(student, "QmTest1", { from: institution });
            await certificatesContract.issueCertificate(student, "QmTest2", { from: institution });
        });

        it("should return all certificates for a student", async () => {
            const certificates = await certificatesContract.getStudentCertificates(student);
            assert.equal(certificates.length, 2, "Should have 2 certificates");
        });

        it("should return empty array for student with no certificates", async () => {
            const certificates = await certificatesContract.getStudentCertificates(employer);
            assert.equal(certificates.length, 0, "Should have no certificates");
        });
    });
}); 