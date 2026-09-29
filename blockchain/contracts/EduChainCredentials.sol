// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title EduChainCredentials
/// @notice Stores student credentials on-chain so anyone can verify them.
contract EduChainCredentials {
    struct Credential {
        address student;
        string achievement;
        uint256 issuedAt; // block timestamp
    }

    // The account allowed to issue credentials (the deployer, e.g. the school)
    address public owner;

    // credentialId => timestamp it was issued (0 means "not issued")
    mapping(bytes32 => uint256) private issuedAtById;

    // student => list of their credentials
    mapping(address => Credential[]) private studentCredentials;

    event CredentialIssued(
        address indexed student,
        string achievement,
        uint256 issuedAt
    );

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only the issuer can do this");
        _;
    }

    /// @notice Record a credential for a student.
    function issueCredential(address student, string calldata achievement)
        external
        onlyOwner
    {
        require(student != address(0), "Invalid student address");
        require(bytes(achievement).length > 0, "Achievement name is empty");

        bytes32 id = _credentialId(student, achievement);
        require(issuedAtById[id] == 0, "Credential already issued");

        issuedAtById[id] = block.timestamp;
        studentCredentials[student].push(
            Credential(student, achievement, block.timestamp)
        );

        emit CredentialIssued(student, achievement, block.timestamp);
    }

    /// @notice Anyone can check if a student has a given credential.
    /// @return exists True if the credential was issued
    /// @return issuedAt When it was issued (0 if it wasn't)
    function verifyCredential(address student, string calldata achievement)
        external
        view
        returns (bool exists, uint256 issuedAt)
    {
        issuedAt = issuedAtById[_credentialId(student, achievement)];
        exists = issuedAt != 0;
    }

    /// @notice Get every credential a student has earned.
    function getStudentCredentials(address student)
        external
        view
        returns (Credential[] memory)
    {
        return studentCredentials[student];
    }

    /// @dev A student + achievement pair maps to one unique ID.
    function _credentialId(address student, string memory achievement)
        private
        pure
        returns (bytes32)
    {
        return keccak256(abi.encodePacked(student, achievement));
    }
}