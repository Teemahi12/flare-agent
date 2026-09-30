// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
// Forge deploy script (base-anvil toolchain). Broadcasts to Base Sepolia/Mainnet.
import "../AgentIdentity.sol";
import "../AgentEscrow.sol";
import "../AgentReputation.sol";
import "../AgentWalletFactory.sol";

contract DeployScript {
    function run(address verifier, address arbiter, address platform) external returns (address, address, address, address) {
        AgentIdentity idn = new AgentIdentity(verifier);
        AgentEscrow esc = new AgentEscrow(arbiter, platform);
        AgentReputation rep = new AgentReputation(address(esc));
        esc.setReputation(address(rep));
        AgentWalletFactory fac = new AgentWalletFactory();
        return (address(idn), address(esc), address(rep), address(fac));
    }
}
