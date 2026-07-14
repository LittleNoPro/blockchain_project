import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@openzeppelin/hardhat-upgrades";
import * as dotenv from "dotenv";

dotenv.config();

const { TESTNET_PRIVATE_KEY, ETHERSCAN_API } = process.env;
const reportGas = process.env.REPORT_GAS;

const config: HardhatUserConfig = {
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545",
    },
    amoy: {
      url: "https://rpc-amoy.polygon.technology/",
      chainId: 80002,
      ...(TESTNET_PRIVATE_KEY ? { accounts: [TESTNET_PRIVATE_KEY] } : {}),
    },
    sepolia: {
      url: "https://ethereum-sepolia.publicnode.com",
      chainId: 11155111,
      ...(TESTNET_PRIVATE_KEY ? { accounts: [TESTNET_PRIVATE_KEY] } : {}),
    },
  },
  solidity: {
    version: "0.8.28",
    settings: {
      evmVersion: "cancun",
      optimizer: {
        enabled: true,
        runs: 1000,
      },
      viaIR: true,
    },
  },
  etherscan: {
    apiKey: ETHERSCAN_API || "",
  },
  sourcify: {
    enabled: false,
  },
  gasReporter: {
    enabled: reportGas === "1",
  },
};

export default config;
