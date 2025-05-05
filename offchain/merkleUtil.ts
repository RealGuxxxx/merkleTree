import { AbiCoder } from "ethers";
import { MerkleTree } from "merkletreejs";
import keccak256 from "keccak256";

// 白名单地址数组示例

const MY_ADDRESS = "0x00E00E64f905001f45A61d278Ea9318ad79f85d9"

const WHITELIST_ADDRESSES = [
  "0x29E3b139f4393aDda86303fcdAa35F60Bb7092bF",
  "0x537C8f3d3E18dF5517a58B3fB9D9143697996802",
  "0xc0A55e2205B289a967823662B841Bd67Aa362Aec",
  "0x90561e5Cd8025FA6F52d849e8867C14A77C94BA0",
  "0x22068447936722AcB3481F41eE8a0B7125526D55",
  MY_ADDRESS
];

const abiCoder = AbiCoder.defaultAbiCoder();

/**
 * 生成完整的 Merkle Tree
 * @param addresses 白名单地址数组
 * @returns 包含 tree 和 root 的对象
 */
export function generateMerkleTree(addresses: string[] = WHITELIST_ADDRESSES) {
  // 标准化地址（小写）
  const normalizedAddresses = addresses.map(addr => addr.toLowerCase());
  
  // 生成叶子节点（使用与Solidity相同的编码方式）
  const leaves = normalizedAddresses.map(addr => 
    keccak256(
      abiCoder.encode(['address'], [addr])
    )
  );

  // 创建 Merkle Tree（自动排序）
  const tree = new MerkleTree(leaves, keccak256, { sort: true });
  
  // 获取十六进制格式的 Merkle Root
  const root = tree.getHexRoot();

  return {
    tree,
    root
  };
}

/**
 * 为指定地址生成 Merkle Proof
 * @param address 用户地址
 * @param tree 可选的 Merkle Tree 实例（若不传则自动生成）
 * @returns Merkle Proof 数组（十六进制格式）
 */
export function generateMerkleProof(
  address: string,
  tree?: MerkleTree
): string[] {
  // 如果没有传入tree，则自动生成
  const merkleTree = tree || generateMerkleTree().tree;
  
  // 标准化地址
  const normalizedAddr = address.toLowerCase();
  
  // 生成叶子节点（必须与建树时相同方式）
  const leaf = keccak256(
    abiCoder.encode(['address'], [normalizedAddr])
  );
  
  // 获取证明
  const proof = merkleTree.getHexProof(leaf);

  // 验证证明有效性（可选检查）
  const isValid = merkleTree.verify(proof, leaf, merkleTree.getRoot());
  if (!isValid) {
    throw new Error('生成的 Merkle Proof 验证失败！');
  }

  return proof;
}

/**
 * 验证地址是否在白名单中
 * @param address 要验证的地址
 * @param root 可选的 Merkle Root（用于独立验证）
 * @returns 包含验证结果和 proof 的对象
 */
export function verifyWhitelist(
  address: string,
  root?: string
): { isValid: boolean; proof: string[] } {
  const { tree, root: currentRoot } = generateMerkleTree();
  
  try {
    const proof = generateMerkleProof(address, tree);
    
    // 如果传入了root，则额外验证root是否匹配
    if (root && root !== currentRoot) {
      return { isValid: false, proof: [] };
    }
    
    return { isValid: true, proof };
  } catch {
    return { isValid: false, proof: [] };
  }
}

(async () => {
  // 1. 生成 Merkle Tree 和 Root
  const { tree, root } = generateMerkleTree();
  console.log('Merkle Root:', root);
  
  // 2. 为特定地址生成 Proof
  const proof = generateMerkleProof(MY_ADDRESS, tree);
  console.log(`Proof for ${MY_ADDRESS}:`, proof);
  
  // 3. 验证地址
  const verification = verifyWhitelist(MY_ADDRESS);
  console.log(`Is whitelisted? ${verification.isValid}`);
})();