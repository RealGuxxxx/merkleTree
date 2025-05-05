// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.25;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {MerkleProof} from "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

contract MerkleApp is Ownable {

    error NotInTheMerkleTree(address user);

    bytes32 public merkleRoot;
    address public latest_user;

    event UserUpdated(address indexed previousUser, address indexed newUser);
    event MerkleRootUpdated(
        bytes32 indexed previousRoot,
        bytes32 indexed newRoot
    );

    constructor(bytes32 root) Ownable(msg.sender) {
        merkleRoot = root;
    }

    function updateMerkleRoot(bytes32 newRoot) external onlyOwner {
        emit MerkleRootUpdated(merkleRoot, newRoot);
        merkleRoot = newRoot;
    }

    function updateLatestUser(bytes32[] calldata merkleProof) external {
        bytes32 leaf = keccak256(abi.encode(msg.sender));
        if (!MerkleProof.verify(merkleProof, merkleRoot, leaf)) {
            revert NotInTheMerkleTree(msg.sender);
        }

        emit UserUpdated(latest_user, msg.sender);
        latest_user = msg.sender;
    }
}
