import { ethers } from "ethers";
import dotenv from "dotenv";

dotenv.config();

const CONTRACT_ADDRESS = "0xa2bE2a99f507f08A2ffeeAdeFb7CEF72c95C311D";
const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL || "";
const PRIVATE_KEY = process.env.PRIVATE_KEY || "";

const MERKLE_APP_ABI = [
  "function updateMerkleRoot(bytes32 newRoot) external",
  "function updateLatestUser(bytes32[] calldata merkleProof) external",
  "function merkleRoot() public view returns (bytes32)",
  "function latest_user() public view returns (address)",
];

async function main() {
  const provider = new ethers.JsonRpcProvider(SEPOLIA_RPC_URL);
  const signer = new ethers.Wallet(PRIVATE_KEY, provider);

  const merkleApp = new ethers.Contract(
    CONTRACT_ADDRESS,
    MERKLE_APP_ABI,
    signer
  );

  console.log(`Connected to MerkleApp at ${CONTRACT_ADDRESS}`);
  console.log(`Current merkleRoot: ${await merkleApp.merkleRoot()}`);
  console.log(`Current latest_user: ${await merkleApp.latest_user()}`);


  console.log("\nTesting updateLatestUser...");

  const proof = [
    "0xb653d32baf6eb330946fd1e57b8918ee4eb464937592d71641ddd31bd50adb9b",
    "0xfc56cc79b1f257d00375c101269751efbd5506e1009afa57dbeec18d667fc3a1",
    "0xc2b97f787f1004a35856672bea2bfd4fe24c6dc33602450582a5ed1ee94e9a73",
  ];

  try {
    const tx1 = await merkleApp.updateLatestUser(proof);
    console.log(`Transaction sent: ${tx1.hash}`);

    const receipt = await tx1.wait();
    console.log(
      `Transaction confirmed. New latest_user: ${await merkleApp.latest_user()}`
    );

  console.log("\nTesting updateMerkleRoot...");
  const newRoot = ethers.keccak256(
    ethers.toUtf8Bytes("new_test_root_" + Date.now())
  );

  const tx2 = await merkleApp.updateMerkleRoot(newRoot);
  console.log(`Transaction sent: ${tx2.hash}`);

  await tx2.wait();
  console.log(
    `Transaction confirmed. New root: ${await merkleApp.merkleRoot()}`
  );

    // 检查事件
    for (const log of receipt.logs) {
      try {
        const parsedLog = merkleApp.interface.parseLog(log);
        if (parsedLog?.name === "UserUpdated") {
          console.log(
            `UserUpdated event: ${parsedLog.args.previousUser} → ${parsedLog.args.newUser}`
          );
        }
      } catch (e) {}
    }
  } catch (error) {
    console.error(
      "Error in updateLatestUser:",
      error instanceof Error ? error.message : error
    );
    console.log("This is likely because the merkle proof is invalid");
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
