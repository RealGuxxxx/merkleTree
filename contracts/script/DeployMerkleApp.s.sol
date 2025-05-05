// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import {Script, console} from "forge-std/Script.sol";
import {MerkleApp} from "../src/MerkleApp.sol";

contract DeployMerkleApp is Script {
    function run() external {
        vm.startBroadcast();

        bytes32 initialMerkleRoot = 0x63956462a063080e3fbd6b9a3b6a1a90b20ae71cc63dded58e0fc3cc6387aaac;
        
        // 部署合约
        MerkleApp merkleApp = new MerkleApp(initialMerkleRoot);

        vm.stopBroadcast();

        console.log("MerkleApp deployed at:", address(merkleApp));
    }
}