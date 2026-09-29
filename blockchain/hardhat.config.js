require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.24",
    settings: {
      // "paris" is the safest EVM target for testnets that may not
      // support newer opcodes yet. We can revisit once you have MST's docs.
      evmVersion: "paris",
      optimizer: { enabled: true, runs: 200 },
    },
  },
};