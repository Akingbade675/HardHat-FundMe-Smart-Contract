const { assert, expect } = require("chai");
const { deployments, ethers, getNamedAccounts, network } = require("hardhat");
const { developmentChains } = require("../../helper-hardhat-config");

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("FundMe", () => {
      let fundMe, deployer, mockV3Aggregator;
      const sendValue = ethers.utils.parseEther("1");
      beforeEach(async () => {
        deployer = (await getNamedAccounts()).deployer;
        await deployments.fixture("all");
        // const fundme = await deployments.get("FundMe");
        // console.log(fundme.address);
        fundMe = await ethers.getContract("FundMe", deployer);
        mockV3Aggregator = await ethers.getContract(
          "MockV3Aggregator",
          deployer
        );
      });

      describe("constructor", () => {
        it("should set the aggregator address correctly", async () => {
          const priceFeedAddress = await fundMe.getPriceFeed();
          // console.log(priceFeedAddress);
          assert.equal(priceFeedAddress, mockV3Aggregator.address);
        });
      });

      describe("fund", () => {
        it("Fails if you don't send enough ETH", async () => {
          await expect(fundMe.fund()).to.be.revertedWith(
            "You need to send more ETH"
          );
        });

        it("Should update the address to amount mapping", async () => {
          await fundMe.fund({ value: sendValue });
          const addressToAmount = await fundMe.getAddressToAmountFunded(
            deployer
          );
          assert.equal(addressToAmount.toString(), sendValue.toString());
        });

        it("Should add funders to the funders array", async () => {
          await fundMe.fund({ value: sendValue });
          const funders = await fundMe.getFunders(0);
          assert.equal(funders, deployer);
        });
      });

      describe("Withdraw", () => {
        beforeEach(async () => {
          await fundMe.fund({ value: sendValue });
        });

        it("Withdraw ETH from a single funder", async () => {
          const startingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          );
          const startingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          );

          const transactionResponse = await fundMe.withdraw();
          const transactionReceipt = await transactionResponse.wait(1);

          const { gasUsed, effectiveGasPrice } = transactionReceipt;
          const gasCost = gasUsed.mul(effectiveGasPrice);

          const endingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          );
          const endingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          );

          assert.equal(endingFundMeBalance.toString(), "0");
          assert.equal(
            startingFundMeBalance.add(startingDeployerBalance).toString(),
            endingDeployerBalance.add(gasCost).toString()
          );
        });

        it("allow to withdraw even if there are multiple funders", async () => {
          const accounts = await ethers.getSigners();
          for (let i = 1; i < 6; i++) {
            await fundMe.connect(accounts[i]).fund({ value: sendValue });
          }

          const startingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          );
          const startingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          );

          const transactionResponse = await fundMe.withdraw();
          const transactionReceipt = await transactionResponse.wait(1);

          const { gasUsed, effectiveGasPrice } = transactionReceipt;
          const gasCost = gasUsed.mul(effectiveGasPrice);

          const endingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          );
          const endingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          );

          assert.equal(endingFundMeBalance.toString(), "0");
          assert.equal(
            startingFundMeBalance.add(startingDeployerBalance).toString(),
            endingDeployerBalance.add(gasCost).toString()
          );

          await expect(fundMe.getFunders(0)).to.be.reverted;

          for (let i = 1; i < 6; i++) {
            assert.equal(
              await fundMe.getAddressToAmountFunded(accounts[i].address),
              0
            );
          }
        });

        it("Only allow the owner to withdraw", async () => {
          const attacker = (await ethers.getSigners())[1];
          const atteckerConnectedContract = await fundMe.connect(attacker);
          // await expect(atteckerConnectedContract.withdraw()).to.be.revertedWith(
          //   "FundMe__NotOwner"
          // );
          await expect(atteckerConnectedContract.withdraw()).to.be.reverted;
        });

        it("cheaperWithdraw testing...", async () => {
          const accounts = await ethers.getSigners();
          for (let i = 1; i < 6; i++) {
            await fundMe.connect(accounts[i]).fund({ value: sendValue });
          }

          const startingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          );
          const startingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          );

          const transactionResponse = await fundMe.cheaperWithdraw();
          const transactionReceipt = await transactionResponse.wait(1);

          const { gasUsed, effectiveGasPrice } = transactionReceipt;
          const gasCost = gasUsed.mul(effectiveGasPrice);

          const endingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          );
          const endingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          );

          assert.equal(endingFundMeBalance.toString(), "0");
          assert.equal(
            startingFundMeBalance.add(startingDeployerBalance).toString(),
            endingDeployerBalance.add(gasCost).toString()
          );

          await expect(fundMe.getFunders(0)).to.be.reverted;

          for (let i = 1; i < 6; i++) {
            assert.equal(
              await fundMe.getAddressToAmountFunded(accounts[i].address),
              0
            );
          }
        });
      });
    });
