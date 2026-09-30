// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
}

/// @title AgentEscrow — milestone escrow with disputes, mirroring Base Commerce
/// AuthCaptureEscrow (authorize→capture/void, charge, refund) semantics.
/// @notice Client funds escrow (authorize). Agent works. Client/caller releases
/// per-milestone (capture). Arbiter resolves disputes. Operator never custodies
/// beyond escrow. Reentrancy-guarded, CEI-ordered, expiry-safe.
contract AgentEscrow {
    address public owner;
    address public arbiter;
    address public reputation; // AgentReputation, notified on completion
    uint256 public nextEscrowId = 1;

    enum Status { None, Funded, InProgress, Completed, Disputed, Cancelled, Refunded }

    struct Milestone {
        string title;
        uint256 amount;
        bool released;
        bool voided;
    }

    struct Escrow {
        address client;
        address agent;
        address token; // USDC
        uint256 total;
        uint256 released;
        uint256 platformFeeBps;
        address platform;
        Status status;
        uint256 deadline;
        uint256 authExpiry; // after this, client can reclaim unreleased
        Milestone[] milestones;
    }

    mapping(uint256 => Escrow) public escrows;

    event EscrowCreated(uint256 indexed id, address indexed client, address indexed agent, address token, uint256 total);
    event WorkStarted(uint256 indexed id);
    event MilestoneReleased(uint256 indexed id, uint256 indexed idx, uint256 amount, uint256 fee);
    event WorkSubmitted(uint256 indexed id);
    event EscrowCompleted(uint256 indexed id, uint256 released);
    event DisputeRaised(uint256 indexed id, address indexed by);
    event DisputeResolved(uint256 indexed id, uint256 clientShare, uint256 agentShare);
    event Refunded(uint256 indexed id, uint256 amount);
    event Reclaimed(uint256 indexed id, uint256 amount);

    error NotAuthorized(); error BadState(); error InvalidInput();
    error Expired(); error NotExpired(); error InsufficientBalance();

    bool private _locked;
    modifier nonReentrant() { if (_locked) revert BadState(); _locked = true; _; _locked = false; }
    modifier onlyOwner() { if (msg.sender != owner) revert NotAuthorized(); _; }

    constructor(address _arbiter, address _platformAddr) {
        if (_arbiter == address(0) || _platformAddr == address(0)) revert InvalidInput();
        owner = msg.sender; arbiter = _arbiter; _platform = _platformAddr;
    }
    address private _platform; // platform fee recipient
    function platform() public view returns (address) { return _platform; }

    /// @param milestoneAmounts must sum to total; client approves token first (collector pattern)
    function create(address agent, address token, uint256 total, string[] calldata titles, uint256[] calldata milestoneAmounts, uint256 deadline, uint256 authExpiryDays, uint256 feeBps)
        external nonReentrant returns (uint256 id)
    {
        if (agent == address(0) || token == address(0) || total == 0) revert InvalidInput();
        if (titles.length != milestoneAmounts.length || titles.length == 0) revert InvalidInput();
        if (feeBps > 1000) revert InvalidInput();
        uint256 sum; for (uint256 i; i < milestoneAmounts.length; i++) sum += milestoneAmounts[i];
        if (sum != total) revert InvalidInput();
        if (!IERC20(token).transferFrom(msg.sender, address(this), total)) revert InsufficientBalance();
        id = nextEscrowId++;
        Escrow storage e = escrows[id];
        e.client = msg.sender; e.agent = agent; e.token = token; e.total = total;
        e.platformFeeBps = feeBps; e.status = Status.Funded;
        e.deadline = deadline; e.authExpiry = block.timestamp + authExpiryDays * 1 days;
        for (uint256 i; i < titles.length; i++) e.milestones.push(Milestone(titles[i], milestoneAmounts[i], false, false));
        emit EscrowCreated(id, msg.sender, agent, token, total);
    }

    function startWork(uint256 id) external {
        Escrow storage e = escrows[id];
        if (msg.sender != e.agent) revert NotAuthorized();
        if (e.status != Status.Funded) revert BadState();
        e.status = Status.InProgress;
        emit WorkStarted(id);
    }

    function submitWork(uint256 id) external {
        Escrow storage e = escrows[id];
        if (msg.sender != e.agent) revert NotAuthorized();
        if (e.status != Status.InProgress) revert BadState();
        emit WorkSubmitted(id);
    }

    /// @notice client (or agent after deadline) releases one milestone = partial capture
    function releaseMilestone(uint256 id, uint256 idx) external nonReentrant {
        Escrow storage e = escrows[id];
        Milestone storage m = e.milestones[idx];
        if (e.status != Status.Funded && e.status != Status.InProgress) revert BadState();
        if (m.released || m.voided) revert BadState();
        if (msg.sender != e.client && !(msg.sender == e.agent && block.timestamp > e.deadline)) revert NotAuthorized();
        m.released = true;
        e.released += m.amount;
        uint256 fee = (m.amount * e.platformFeeBps) / 10000;
        require(IERC20(e.token).transfer(platform(), fee), "fee xfer");
        require(IERC20(e.token).transfer(e.agent, m.amount - fee), "pay xfer");
        emit MilestoneReleased(id, idx, m.amount, fee);
        if (e.released == e.total) {
            e.status = Status.Completed;
            emit EscrowCompleted(id, e.released);
            if (reputation != address(0)) {
                (bool ok,) = reputation.call(abi.encodeWithSignature("recordCompletion(address,uint256,bool)", e.agent, id, true));
                ok;
            }
        }
    }

    function raiseDispute(uint256 id) external {
        Escrow storage e = escrows[id];
        if (msg.sender != e.client && msg.sender != e.agent) revert NotAuthorized();
        if (e.status != Status.Funded && e.status != Status.InProgress) revert BadState();
        e.status = Status.Disputed;
        emit DisputeRaised(id, msg.sender);
    }

    /// @notice arbiter splits remaining balance; CEI: state before transfers
    function resolveDispute(uint256 id, uint256 clientShareBps) external nonReentrant {
        Escrow storage e = escrows[id];
        if (msg.sender != arbiter) revert NotAuthorized();
        if (e.status != Status.Disputed) revert BadState();
        if (clientShareBps > 10000) revert InvalidInput();
        uint256 remaining = e.total - e.released;
        uint256 toClient = (remaining * clientShareBps) / 10000;
        uint256 toAgent = remaining - toClient;
        e.released = e.total;
        e.status = Status.Completed;
        if (toClient > 0) require(IERC20(e.token).transfer(e.client, toClient), "client xfer");
        if (toAgent > 0) require(IERC20(e.token).transfer(e.agent, toAgent), "agent xfer");
        emit DisputeResolved(id, toClient, toAgent);
    }

    function cancelAndRefund(uint256 id) external nonReentrant {
        Escrow storage e = escrows[id];
        if (msg.sender != e.client) revert NotAuthorized();
        if (e.status != Status.Funded) revert BadState();
        uint256 remaining = e.total - e.released;
        e.status = Status.Refunded;
        require(IERC20(e.token).transfer(e.client, remaining), "refund xfer");
        emit Refunded(id, remaining);
    }

    /// @notice permissionless reclaim after auth expiry (== Commerce void/reclaim path)
    function reclaimExpired(uint256 id) external nonReentrant {
        Escrow storage e = escrows[id];
        if (block.timestamp <= e.authExpiry) revert NotExpired();
        if (e.status != Status.Funded && e.status != Status.InProgress) revert BadState();
        uint256 remaining = e.total - e.released;
        e.status = Status.Refunded;
        require(IERC20(e.token).transfer(e.client, remaining), "reclaim xfer");
        emit Reclaimed(id, remaining);
    }

    function setArbiter(address a) external onlyOwner {
        if (a == address(0)) revert InvalidInput(); arbiter = a;
    }
    function setReputation(address r) external onlyOwner { reputation = r; }
}
