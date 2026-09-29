const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("EduChainCredentials", function () {
  let contract, owner, student, other;

  beforeEach(async function () {
    [owner, student, other] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory("EduChainCredentials");
    contract = await Factory.deploy();
    await contract.waitForDeployment();
  });

  it("issues a credential and lets anyone verify it", async function () {
    await contract.issueCredential(student.address, "Blockchain Basics");

    const [exists, issuedAt] = await contract
      .connect(other)
      .verifyCredential(student.address, "Blockchain Basics");

    expect(exists).to.equal(true);
    expect(issuedAt).to.be.gt(0);
  });

  it("returns false for a credential that was never issued", async function () {
    const [exists, issuedAt] = await contract.verifyCredential(
      student.address,
      "Never Earned"
    );
    expect(exists).to.equal(false);
    expect(issuedAt).to.equal(0);
  });

  it("emits an event when a credential is issued", async function () {
    await expect(contract.issueCredential(student.address, "Hackathon Winner"))
      .to.emit(contract, "CredentialIssued");
  });

  it("prevents duplicate credentials for the same student and achievement", async function () {
    await contract.issueCredential(student.address, "Blockchain Basics");
    await expect(
      contract.issueCredential(student.address, "Blockchain Basics")
    ).to.be.revertedWith("Credential already issued");
  });

  it("allows the same achievement for a different student", async function () {
    await contract.issueCredential(student.address, "Blockchain Basics");
    await contract.issueCredential(other.address, "Blockchain Basics");

    const [exists] = await contract.verifyCredential(other.address, "Blockchain Basics");
    expect(exists).to.equal(true);
  });

  it("lists all credentials for a student", async function () {
    await contract.issueCredential(student.address, "Blockchain Basics");
    await contract.issueCredential(student.address, "AI Fundamentals");

    const list = await contract.getStudentCredentials(student.address);
    expect(list.length).to.equal(2);
    expect(list[1].achievement).to.equal("AI Fundamentals");
  });

  it("blocks non-issuers from issuing credentials", async function () {
    await expect(
      contract.connect(other).issueCredential(student.address, "Fake Award")
    ).to.be.revertedWith("Only the issuer can do this");
  });

  it("rejects the zero address and empty achievement names", async function () {
    await expect(
      contract.issueCredential(ethers.ZeroAddress, "X")
    ).to.be.revertedWith("Invalid student address");

    await expect(
      contract.issueCredential(student.address, "")
    ).to.be.revertedWith("Achievement name is empty");
  });
});