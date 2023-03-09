const { network } = require("hardhat");
const { verify } = require("../utils/verify");
const {
  networkConfig,
  developmentChains,
} = require("../helper-hardhat-config");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = network.config.chainId;

  let ethUsdPriceFeedAddress;
  if (developmentChains.includes(network.name)) {
    const MockV3Aggregator = await deployments.get("MockV3Aggregator");
    ethUsdPriceFeedAddress = MockV3Aggregator.address;
  } else {
    ethUsdPriceFeedAddress = networkConfig[chainId].ethUsdPriceFeed;
  }

  const args = [ethUsdPriceFeedAddress];

  const fundMe = await deploy("FundMe", {
    from: deployer,
    args, // put priceFeed address
    log: true,
    waitConfirmations: network.config.blockConfirmations || 1,
  });
  log("---------------------");

  if (
    !developmentChains.includes(network.name) &&
    process.env.ETHERSCAN_API_KEY
  ) {
    await verify(fundMe.address, args);
  }
};

module.exports.tags = ["all", "fundme"];
