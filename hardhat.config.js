const { task } = require("hardhat/config");

require("@nomicfoundation/hardhat-toolbox");
require("@nomiclabs/hardhat-etherscan");
require("hardhat-deploy");
require("dotenv").config();

const GEORLI_RPC_URL = process.env.GEORLI_RPC_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;
const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY;

task("accounts", "Prints the list of accounts", async (args, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  // solidity: "0.8.18",
  solidity: {
    compilers: [{ version: "0.8.18" }, { version: "0.6.6" }],
  },
  defaultNetwork: "hardhat",
  networks: {
    georli: {
      url: GEORLI_RPC_URL,
      accounts: [PRIVATE_KEY],
      chainId: 5,
      blockConfirmations: 6,
    },
    localhost: {
      url: "http://127.0.0.1/8545/",
      chainId: 31337,
    },
  },
  etherscan: {
    apiKey: ETHERSCAN_API_KEY,
  },
  gasReporter: {
    enabled: false,
    currency: "USD",
    // coinmarketcap: COINMARKETCAP_API_KEY,
    outputFile: "./gas-report.txt",
    noColors: true,
    token: "ETH",
  },
  namedAccounts: {
    deployer: {
      default: 0,
      5: 0,
    },
  },
};
