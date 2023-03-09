const { assert } = require("chai");
const { getNamedAccounts, ethers, network } = require("hardhat");
const { developmentChains } = require("../../helper-hardhat-config");

developmentChains.includes(network.name)
  ? describe.skip
  : describe("FundMe Georli Test", () => {
      let fundMe, deployer;
      const sendValue = ethers.utils.parseEther("0.5");
      beforeEach(async () => {
        deployer = (await getNamedAccounts()).deployer;
        fundMe = await ethers.getContract("FundMe", deployer);
      });

      it("Should update the address to amount mapping", async () => {
        await fundMe.fund({ value: sendValue });
        const addressToAmount = await fundMe.getAddressToAmountFunded(deployer);
        assert.equal(addressToAmount.toString(), sendValue.toString());
      });

      it("allows people to fund and withdraw", async () => {
        console.log("Deploying to Georli Test Network...");
        console.log(sendValue.toString());
        await fundMe.fund({ value: sendValue });
        // fundTxResponse.wait(1);
        const withdrawTxResponse = await fundMe.withdraw();
        await withdrawTxResponse.wait(1);
        const endingBalance = await fundMe.provider.getBalance(fundMe.address);
        assert.equal(endingBalance.toString(), "0");
      });
    });
