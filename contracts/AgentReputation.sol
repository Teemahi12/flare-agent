// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title AgentReputation — onchain ratings + trust scores, escrow-fed
/// @notice Only escrow (or owner) records completions; ratings are 1-5 per job,
/// one review per (job, reviewer) enforced offchain + via reviewedJobs guard.
contract AgentReputation {
    address public owner;
    address public escrow;

    struct Stats {
        uint256 completedJobs;
        uint256 totalRating; // sum for avg
        uint256 ratingCount;
        int256 scoreAdjust; // dispute penalties / bonuses
        uint256 updatedAt;
    }

    mapping(address => Stats) public stats;
    mapping(uint256 => mapping(address => bool)) public reviewedJobs;

    event CompletionRecorded(address indexed agent, uint256 indexed jobId, bool success);
    event Rated(address indexed agent, uint256 indexed jobId, address indexed reviewer, uint8 rating);
    event Adjusted(address indexed agent, int256 delta, string reason);

    error NotAuthorized(); error InvalidInput(); error AlreadyRated();

    modifier onlyOwner() { if (msg.sender != owner) revert NotAuthorized(); _; }
    modifier onlyRecorder() { if (msg.sender != escrow && msg.sender != owner) revert NotAuthorized(); _; }

    constructor(address _escrow) { owner = msg.sender; escrow = _escrow; }

    function recordCompletion(address agent, uint256 jobId, bool success) external onlyRecorder {
        Stats storage s = stats[agent];
        if (success) s.completedJobs += 1; else s.scoreAdjust -= 10;
        s.updatedAt = block.timestamp;
        emit CompletionRecorded(agent, jobId, success);
    }

    function rate(address agent, uint256 jobId, uint8 rating) external {
        if (rating < 1 || rating > 5) revert InvalidInput();
        if (reviewedJobs[jobId][msg.sender]) revert AlreadyRated();
        reviewedJobs[jobId][msg.sender] = true;
        Stats storage s = stats[agent];
        s.totalRating += rating; s.ratingCount += 1; s.updatedAt = block.timestamp;
        emit Rated(agent, jobId, msg.sender, rating);
    }

    function adjust(address agent, int256 delta, string calldata reason) external onlyOwner {
        stats[agent].scoreAdjust += delta;
        emit Adjusted(agent, delta, reason);
    }

    /// @notice trust = 50 base + 2/job (cap +25) + avgRating bonus (0-20) + adjust, clamped 0-100
    function trustScore(address agent) external view returns (uint256) {
        Stats storage s = stats[agent];
        int256 score = 50;
        uint256 jobPts = s.completedJobs * 2; if (jobPts > 25) jobPts = 25;
        score += int256(jobPts);
        if (s.ratingCount > 0) score += int256((s.totalRating * 20) / (s.ratingCount * 5));
        score += s.scoreAdjust;
        if (score < 0) return 0; if (score > 100) return 100;
        return uint256(score);
    }

    function setEscrow(address e) external onlyOwner { escrow = e; }
}
