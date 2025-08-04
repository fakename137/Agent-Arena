// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract AlteredFightLogic {
    mapping(uint256 => address) public stakedNFTOwners;
    mapping(address => uint256[]) public userStakedNFTs;
    mapping(uint256 => bool) public isInFightQueue;

    uint256[] public fightQueue;
    uint256 public nextFightId = 1;

    struct Fight {
        uint256 id;
        uint256 fighter1Id;
        uint256 fighter2Id;
        uint256 startTime;
        uint256 endTime;
        uint256 rewardAmount;
        address owner1;
        address owner2;
        uint8 status;
        uint256 winningTokenId;
        uint256 startPrice1;
        uint256 startPrice2;
    }

    mapping(uint256 => Fight) public fights;

    event FightCreated(uint256 fightId, uint256 fighter1Id, uint256 fighter2Id, uint256 startTime, uint256 endTime);
    event FightQueued(uint256 indexed nftId, address indexed owner);

    error NotOwnerOfNFT(uint256 nftId);
    error NFTAlreadyInFight(uint256 nftId);
    error InsufficientStakedNFTs();
    error InvalidFightParameters();

    modifier nftIsStakedAndAvailable(uint256 _nftId) {
        if (stakedNFTOwners[_nftId] != msg.sender) revert NotOwnerOfNFT(_nftId);
        if (isInFightQueue[_nftId]) revert NFTAlreadyInFight(_nftId);
        _;
    }

    function queueForFight(
        uint256 _userNftId,
        uint256 _durationSeconds,
        uint256 _rewardAmount,
        uint256 _startPrice1
    ) external nftIsStakedAndAvailable(_userNftId) {
        if (_durationSeconds == 0 || _rewardAmount == 0 || _startPrice1 == 0) {
            revert InvalidFightParameters();
        }

        if (fightQueue.length > 0) {
            uint256 opponentNftId = fightQueue[fightQueue.length - 1];
            fightQueue.pop();
            isInFightQueue[opponentNftId] = false;

            uint256 fighter1Id = _userNftId;
            uint256 fighter2Id = opponentNftId;
            address owner1 = msg.sender;
            address owner2 = stakedNFTOwners[opponentNftId];

            uint256 startPrice2ForOpponent = 100000000;

            uint256 fightId = nextFightId;
            uint256 startTime = block.timestamp;
            uint256 endTime = startTime + _durationSeconds;

            fights[fightId] = Fight({
                id: fightId,
                fighter1Id: fighter1Id,
                fighter2Id: fighter2Id,
                startTime: startTime,
                endTime: endTime,
                rewardAmount: _rewardAmount,
                owner1: owner1,
                owner2: owner2,
                status: 1,
                winningTokenId: 0,
                startPrice1: _startPrice1,
                startPrice2: startPrice2ForOpponent
            });

            nextFightId++;

            emit FightCreated(fightId, fighter1Id, fighter2Id, startTime, endTime);
        } else {
            fightQueue.push(_userNftId);
            isInFightQueue[_userNftId] = true;
            emit FightQueued(_userNftId, msg.sender);
        }
    }

    function createFight(
        uint256 _fighter1Id,
        uint256 _fighter2Id,
        uint256 _durationSeconds,
        uint256 _rewardAmount,
        uint256 _startPrice1,
        uint256 _startPrice2
    ) external {
        require(_fighter1Id != _fighter2Id, "Fighters must be different");
        require(stakedNFTOwners[_fighter1Id] != address(0) && stakedNFTOwners[_fighter2Id] != address(0), "Both NFTs must be staked");
        require(_durationSeconds > 0 && _rewardAmount > 0, "Invalid parameters");
        require(_startPrice1 > 0 && _startPrice2 > 0, "Start prices must be provided");

        uint256 fightId = nextFightId;
        uint256 startTime = block.timestamp;
        uint256 endTime = startTime + _durationSeconds;

        fights[fightId] = Fight({
            id: fightId,
            fighter1Id: _fighter1Id,
            fighter2Id: _fighter2Id,
            startTime: startTime,
            endTime: endTime,
            rewardAmount: _rewardAmount,
            owner1: stakedNFTOwners[_fighter1Id],
            owner2: stakedNFTOwners[_fighter2Id],
            status: 1,
            winningTokenId: 0,
            startPrice1: _startPrice1,
            startPrice2: _startPrice2
        });

        nextFightId++;
        emit FightCreated(fightId, _fighter1Id, _fighter2Id, startTime, endTime);
    }
}
