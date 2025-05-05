-include .env

FORGE := forge

.PHONY: deploy verify

deploy:
	@echo "Deploying to Sepolia..."
	${FORGE} script script/DeployMerkleApp.s.sol:DeployMerkleApp \
		--rpc-url ${SEPOLIA_RPC_URL} \
		--account merkleTree \
		--broadcast \
		--verify \
		--verifier-url https://api-sepolia.etherscan.io/api \
		--etherscan-api-key ${ETHERSCAN_API_KEY} \
		--slow


help:
	@echo "Usage:"
	@echo "  make deploy       - Deploy to Sepolia testnet"
	@echo "  make verify       - Verify contract (set CONTRACT_ADDRESS)"
	@echo ""
	@echo "Configuration:"
	@echo "  Create a .env file with:"
	@echo "  INFURA_API_KEY=your_key"
	@echo "  ETHERSCAN_API_KEY=your_key"
	@echo "  DEPLOYER_ACCOUNT=account_name (optional, defaults to 'default')"
	@echo "  MERKLE_ROOT=0x... (optional)"