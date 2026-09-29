const hre = require("hardhat");

async function main() {
  const EduChainCredentials =
    await hre.ethers.getContractFactory("EduChainCredentials");

  const contract = await EduChainCredentials.deploy();

  await contract.waitForDeployment();

  console.log("EduChainCredentials deployed to:");
  console.log(await contract.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});