// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IERC20Min { function transferFrom(address f, address t, uint256 a) external returns (bool); }

/// @title AgentWalletFactory — per-agent wallet with onchain spend permissions
/// @notice Mirrors Base Spend Permissions offchain: per-request cap, per-session
/// cap, token allowlist, expiry, revoke. Agent calls are executed via `exec`
/// after permission checks; owner (controller) manages permissions.
contract AgentWalletFactory {
    struct Permission {
        address token;
        uint256 perRequest;
        uint256 perSession;
        uint256 spentSession;
        uint64 expiresAt;
        bool revoked;
    }

    mapping(address => address) public walletOwner; // wallet => controller
    mapping(address => mapping(address => Permission)) public perms; // wallet => spender => perm
    mapping(address => bool) public isAgentWallet;

    event WalletCreated(address indexed wallet, address indexed controller);
    event PermissionSet(address indexed wallet, address indexed spender, address token, uint256 perReq, uint256 perSess);
    event PermissionRevoked(address indexed wallet, address indexed spender);
    event Exec(address indexed wallet, address indexed to, uint256 value);

    error NotAuthorized(); error LimitExceeded(); error Expired(); error BadWallet();

    address public implementation; // reserved for future AA upgrade

    function createWallet(address controller) external returns (address wallet) {
        if (controller == address(0)) revert NotAuthorized();
        wallet = address(uint160(uint256(keccak256(abi.encodePacked(controller, block.timestamp, msg.sender)))));
        walletOwner[wallet] = controller;
        isAgentWallet[wallet] = true;
        emit WalletCreated(wallet, controller);
    }

    function setPermission(address wallet, address spender, address token, uint256 perReq, uint256 perSess, uint64 expiresAt) external {
        if (walletOwner[wallet] != msg.sender) revert NotAuthorized();
        perms[wallet][spender] = Permission(token, perReq, perSess, 0, expiresAt, false);
        emit PermissionSet(wallet, spender, token, perReq, perSess);
    }

    function revoke(address wallet, address spender) external {
        if (walletOwner[wallet] != msg.sender) revert NotAuthorized();
        perms[wallet][spender].revoked = true;
        emit PermissionRevoked(wallet, spender);
    }

    /// @notice pseudo-execution hook: validates spend policy for an agent purchase.
    /// Real settlement happens in token contracts; this is the policy gate.
    function checkAndSpend(address wallet, address spender, address token, uint256 amount) external returns (bool) {
        Permission storage p = perms[wallet][spender];
        if (p.revoked || p.token != token) revert NotAuthorized();
        if (block.timestamp > p.expiresAt) revert Expired();
        if (amount > p.perRequest) revert LimitExceeded();
        if (p.spentSession + amount > p.perSession) revert LimitExceeded();
        p.spentSession += amount;
        emit Exec(wallet, spender, amount);
        return true;
    }
}
