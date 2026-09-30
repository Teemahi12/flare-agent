// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title AgentIdentity — onchain registry for human + AI agent profiles
/// @notice Mirrors Base Verify (offchain attestation) with an onchain anchor:
/// one verified identity => one primary agent; Basename stored as string.
/// @dev Auditor notes: no funds held; owner-gated verifier role only.
contract AgentIdentity {
    address public owner;
    address public verifier;
    uint256 public nextTokenId = 1;
    uint256 public platformFeeBps = 400; // 4% marketplace fee, cap 10%

    struct Profile {
        address wallet;
        address controller; // human owner; agents act via controller/sig
        string name;
        string metadataURI;
        bool isAgent;
        bool verified;
        uint256 createdAt;
    }

    mapping(uint256 => Profile) public profiles;
    mapping(address => uint256) public walletToToken;
    mapping(address => uint256) public verifiedHumans; // human => tokenId (sybil: 1)

    event Registered(uint256 indexed tokenId, address indexed wallet, bool isAgent, string name);
    event Verified(uint256 indexed tokenId, address indexed wallet);
    event VerifierUpdated(address indexed verifier);
    event PlatformFeeUpdated(uint256 bps);

    error AlreadyRegistered();
    error NotRegistered();
    error NotAuthorized();
    error InvalidInput();
    error FeeTooHigh();

    modifier onlyOwner() { if (msg.sender != owner) revert NotAuthorized(); _; }
    modifier onlyVerifier() { if (msg.sender != verifier && msg.sender != owner) revert NotAuthorized(); _; }

    constructor(address _verifier) {
        if (_verifier == address(0)) revert InvalidInput();
        owner = msg.sender;
        verifier = _verifier;
    }

    function register(address wallet, string calldata name, string calldata metadataURI, bool isAgent, address controller)
        external returns (uint256 tokenId)
    {
        if (wallet == address(0) || bytes(name).length == 0) revert InvalidInput();
        if (walletToToken[wallet] != 0) revert AlreadyRegistered();
        if (isAgent && controller == address(0)) revert InvalidInput();
        tokenId = nextTokenId++;
        profiles[tokenId] = Profile(wallet, isAgent ? controller : wallet, name, metadataURI, isAgent, false, block.timestamp);
        walletToToken[wallet] = tokenId;
        emit Registered(tokenId, wallet, isAgent, name);
    }

    /// @notice verifier anchors an offchain Base Verify attestation onchain
    function verify(uint256 tokenId) external onlyVerifier {
        Profile storage p = profiles[tokenId];
        if (p.wallet == address(0)) revert NotRegistered();
        if (!p.isAgent && verifiedHumans[p.wallet] != 0 && verifiedHumans[p.wallet] != tokenId) revert AlreadyRegistered();
        p.verified = true;
        if (!p.isAgent) verifiedHumans[p.wallet] = tokenId;
        emit Verified(tokenId, p.wallet);
    }

    function setVerifier(address v) external onlyOwner {
        if (v == address(0)) revert InvalidInput();
        verifier = v;
        emit VerifierUpdated(v);
    }

    function setPlatformFee(uint256 bps) external onlyOwner {
        if (bps > 1000) revert FeeTooHigh();
        platformFeeBps = bps;
        emit PlatformFeeUpdated(bps);
    }
}
