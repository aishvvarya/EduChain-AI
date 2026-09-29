import { ethers } from "ethers";

export const CONTRACT_ADDRESS =
  "0x0DCd1Bf9A1b36cE34237eEaFef220932846BCD82";

export const CONTRACT_ABI = [
  {
    inputs: [],
    stateMutability: "nonpayable",
    type: "constructor"
  },
  {
    inputs: [{ internalType: "address", name: "student", type: "address" }],
    name: "getStudentCredentials",
    outputs: [
      {
        components: [
          { internalType: "address", name: "student", type: "address" },
          { internalType: "string", name: "achievement", type: "string" },
          { internalType: "uint256", name: "issuedAt", type: "uint256" }
        ],
        internalType: "struct EduChainCredentials.Credential[]",
        name: "",
        type: "tuple[]"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      { internalType: "address", name: "student", type: "address" },
      { internalType: "string", name: "achievement", type: "string" }
    ],
    name: "issueCredential",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [],
    name: "owner",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      { internalType: "address", name: "student", type: "address" },
      { internalType: "string", name: "achievement", type: "string" }
    ],
    name: "verifyCredential",
    outputs: [
      { internalType: "bool", name: "exists", type: "bool" },
      { internalType: "uint256", name: "issuedAt", type: "uint256" }
    ],
    stateMutability: "view",
    type: "function"
  }
];