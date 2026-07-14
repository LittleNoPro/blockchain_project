# Hardhat Template

A clean, reusable Hardhat (TypeScript) template for Ethereum smart contract development.

## Quick Start

```bash
# 1. Clone and enter the project
git clone <your-repo-url> my-project
cd my-project

# 2. Install dependencies (no --legacy-peer-deps needed)
npm install

# 3. Set up environment variables
cp .env_example .env
# Edit .env: add your TESTNET_PRIVATE_KEY, MAINNET_PRIVATE_KEY, ETHERSCAN_API

# 4. Compile contracts
npm run compile

# 5. Run tests
npm test
```

## Project Structure

```
├── contracts/          # Solidity source files (*.sol)
│   └── Example.sol     # Example contract — replace with your own
├── scripts/
│   └── deploy.ts       # Deployment script — edit for your contract
├── test/
│   └── Example.test.ts # Example tests — replace with your own
├── hardhat.config.ts   # Network & tooling config
├── tsconfig.json
├── .env_example        # Copy to .env and fill secrets
├── .gitignore
└── package.json
```

## How to Use

### 1. Code Your Contract

Write your Solidity contract in `contracts/`. Inherit from OpenZeppelin if needed (already installed):

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/Ownable.sol";

contract MyContract is Ownable {
    // your logic
}
```

### 2. Write the Deploy Script

Edit `scripts/deploy.ts` to match your contract's constructor:

```typescript
const MyContract = await ethers.getContractFactory("MyContract");
const contract = await MyContract.deploy(arg1, arg2); // constructor args
await contract.waitForDeployment();
console.log("Deployed to:", await contract.getAddress());
```

### 3. Write Tests

Add test files in `test/` using Chai + Ethers:

```typescript
import { expect } from "chai";
import { ethers } from "hardhat";

describe("MyContract", () => {
  it("should work", async () => {
    // ...
  });
});
```

### 4. Run Locally (Hardhat Network)

```bash
# Terminal 1: Start local node
npm run node

# Terminal 2: Deploy to localhost
npm run deploy:local
```

### 5. Deploy to Testnet (Sepolia)

```bash
npm run deploy:sepolia
```

### 6. Verify on Etherscan

```bash
npm run verify:sepolia <DEPLOYED_CONTRACT_ADDRESS> [CONSTRUCTOR_ARGS...]
```

### 7. Deploy to Mainnet

```bash
npm run deploy:mainnet
npm run verify:mainnet <DEPLOYED_CONTRACT_ADDRESS> [CONSTRUCTOR_ARGS...]
```

## Available Networks

| Network   | Chain ID | RPC URL                                     |
|-----------|----------|---------------------------------------------|
| localhost | 31337    | http://127.0.0.1:8545                       |
| Sepolia   | 11155111 | https://ethereum-sepolia.publicnode.com     |
| Ethereum  | 1        | https://ethereum.publicnode.com             |

## Available Commands

| Command                 | Description                        |
|-------------------------|------------------------------------|
| `npm run compile`       | Compile Solidity contracts         |
| `npm test`              | Run all tests                      |
| `npm run test:gas`      | Run tests with gas report          |
| `npm run node`          | Start local Hardhat node           |
| `npm run clean`         | Delete artifacts and cache         |
| `npm run size`          | Show contract sizes                |
| `npm run deploy:local`  | Deploy to localhost                |
| `npm run deploy:sepolia`| Deploy to Sepolia testnet          |
| `npm run deploy:mainnet`| Deploy to Ethereum mainnet         |
| `npm run verify:sepolia`| Verify contract on Sepolia (add address + args after) |
| `npm run verify:mainnet`| Verify contract on mainnet (add address + args after) |

## Environment Variables (`.env`)

| Variable             | Required for      | Description          |
|----------------------|-------------------|----------------------|
| `TESTNET_PRIVATE_KEY`| Sepolia deploy    | Private key with test ETH |
| `MAINNET_PRIVATE_KEY`| Mainnet deploy    | Private key with real ETH |
| `ETHERSCAN_API`      | Verification      | Etherscan API key    |
| `REPORT_GAS`         | Gas reporting     | Set to `1` to enable |

## Dependencies

- [Hardhat](https://hardhat.org/) — development environment
- [Ethers v6](https://docs.ethers.org/v6/) — Ethereum interaction library
- [OpenZeppelin Contracts](https://www.openzeppelin.com/contracts) — audited contract standards
- [TypeChain](https://github.com/dethcrypto/TypeChain) — type-safe contract bindings
- [hardhat-verify](https://hardhat.org/hardhat-runner/plugins/nomicfoundation-hardhat-verify) — source code verification
- [hardhat-gas-reporter](https://github.com/cgewecke/hardhat-gas-reporter) — gas usage metrics
- [hardhat-contract-sizer](https://github.com/ItsNickBarry/hardhat-contract-sizer) — contract size reporting
