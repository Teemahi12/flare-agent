// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
/// Minimal 6-decimal mock USDC for Base Sepolia testing.
contract MockUSDC {
    string public name = "Mock USD Coin";
    string public symbol = "mUSDC";
    uint8 public decimals = 6;
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;
    event Transfer(address indexed f, address indexed t, uint256 v);
    event Approval(address indexed o, address indexed s, uint256 v);
    function mint(address to, uint256 amt) external { balanceOf[to] += amt; emit Transfer(address(0), to, amt); }
    function approve(address s, uint256 amt) external returns (bool) { allowance[msg.sender][s] = amt; emit Approval(msg.sender, s, amt); return true; }
    function transfer(address to, uint256 amt) external returns (bool) {
        require(balanceOf[msg.sender] >= amt, "bal"); balanceOf[msg.sender] -= amt; balanceOf[to] += amt; emit Transfer(msg.sender, to, amt); return true;
    }
    function transferFrom(address f, address t, uint256 amt) external returns (bool) {
        require(balanceOf[f] >= amt, "bal"); require(allowance[f][msg.sender] >= amt, "allow");
        allowance[f][msg.sender] -= amt; balanceOf[f] -= amt; balanceOf[t] += amt; emit Transfer(f, t, amt); return true;
    }
}
