// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import {Test, console} from "forge-std/Test.sol";
import {MerkleApp} from "../src/MerkleApp.sol";

contract MerkleAppTest is Test {
    MerkleApp merkleApp;
    address owner = makeAddr("owner");
    
    address whitelistedUser = 0x00E00E64f905001f45A61d278Ea9318ad79f85d9;
    address nonWhitelistedUser = makeAddr("nonWhitelistedUser");
    
    // merkle root
    bytes32 merkleRoot = 0x63956462a063080e3fbd6b9a3b6a1a90b20ae71cc63dded58e0fc3cc6387aaac;
    
    // merkle proof
    bytes32[] proof;

    function setUp() public {
        // 初始化proof数组
        proof = new bytes32[](3);
        proof[0] = 0xb653d32baf6eb330946fd1e57b8918ee4eb464937592d71641ddd31bd50adb9b;
        proof[1] = 0xfc56cc79b1f257d00375c101269751efbd5506e1009afa57dbeec18d667fc3a1;
        proof[2] = 0xc2b97f787f1004a35856672bea2bfd4fe24c6dc33602450582a5ed1ee94e9a73;
        
        vm.prank(owner);
        merkleApp = new MerkleApp(merkleRoot);
    }

    function test_WhitelistedUserCanUpdateLatestUser() public {
        vm.prank(whitelistedUser);
        merkleApp.updateLatestUser(proof);
        
        assertEq(merkleApp.latest_user(), whitelistedUser, "Latest user should be updated");
    }

    function test_NonWhitelistedUserCannotUpdateLatestUser() public {
        // 创建无效proof
        bytes32[] memory invalidProof = new bytes32[](3);
        invalidProof[0] = keccak256("invalid1");
        invalidProof[1] = keccak256("invalid2");
        invalidProof[2] = keccak256("invalid3");

        console.log("nonWhitelistedUser: ", nonWhitelistedUser);
        
        vm.expectRevert(abi.encodeWithSelector(MerkleApp.NotInTheMerkleTree.selector, nonWhitelistedUser));
        vm.prank(nonWhitelistedUser);
        merkleApp.updateLatestUser(invalidProof);
    }

    function test_OwnerCanUpdateMerkleRoot() public {
        bytes32 newRoot = keccak256("newRoot123456789012345678901234567890");
        
        vm.prank(owner);
        merkleApp.updateMerkleRoot(newRoot);
        
        assertEq(merkleApp.merkleRoot(), newRoot, "Root should be updated");
    }

    function test_NonOwnerCannotUpdateMerkleRoot() public {
        bytes32 newRoot = keccak256("newRoot123456789012345678901234567890");
        
        vm.expectRevert();
        vm.prank(whitelistedUser);
        merkleApp.updateMerkleRoot(newRoot);
    }

}