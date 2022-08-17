
const { expect } = require("chai");
const { ethers } = require("hardhat");

// This challenge ended up being a honeypot without a solution.
// The organizers first released the GuessMyAnswerFromEtherscan contract and later released
// a second contract called InitializeAnswer. I'll reproduce in the test how this was
// deployed and setup, but the main idea was to first initialize the contract from another contract,
// and then call the initialization function again but this time as a direct call.
// The first call isn't shown in the list of transactions in etherscan as this was an internal call,
// and it appeared as if it was initialized by the second transaction to trick players into thinking
// that this transaction included the "correct" answer.
describe("GuessMyAnswerFromEtherscan", function () {
  let guess;
  let owner, sender;

  beforeEach(async function() {
    [owner, sender] = await ethers.getSigners();

    const GuessMyAnswerFromEtherscan = await ethers.getContractFactory("GuessMyAnswerFromEtherscan");
    guess = await GuessMyAnswerFromEtherscan.deploy({ value: ethers.utils.parseEther("0.01") });
  });

  it("can't be hacked", async function() {
    // There's a second contract which calls "initAnswer" and "addQuestion" in the same transaction
    // "initAnswer" initializes the question/answer and the "sender" address
    // "addQuestion" overwrites the secretHash from the answer.
    const InitializeAnswer = await ethers.getContractFactory("InitializeAnswer", sender);
    const initializer = await InitializeAnswer.deploy();

    const question = "a question?";
    const answer = "an answer";
    await initializer.initAnswer([guess.address], question, answer);

    // However, internally initAnswer sets the secretHash to keccak256(abi.encode(12345)) using
    // the "addQuestion" function
    const secretHash = await ethers.provider.getStorageAt(guess.address, 2); // slot 2 contains the secretHash value
    const hiddenHash = ethers.utils.keccak256(ethers.utils.defaultAbiCoder.encode(['uint256'], [12345]));

    expect(secretHash).to.eq(hiddenHash);

    // Now we re-initialize the GuessMyAnswerFromEtherscan using a direct call. This has no effect
    // since the secretHash variable has been already initialized
    await guess.initAnswer(question, answer);

    // Now if we submit the "correct" answer, we don't get the prize
    const playValue = ethers.utils.parseEther("0.02");
    await expect(
      guess.answer(answer, { value:  playValue })
    ).to.changeEtherBalance(guess, playValue);

    // Also, the trick here is that it's impossible to submit a valid answer. The "secretHash" variable
    // has been initialized by hashing an abi-encoded uint (12345). The "answer" function abi-encodes the
    // response as a string which will never match the encoding of a uint (string is a dynamic type and
    // has a more complex encoding that involves the use of multiple words to store the offset, the length
    // and the string data).
  });
});
