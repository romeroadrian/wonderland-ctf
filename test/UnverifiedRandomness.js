const { time } = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");
const { ethers } = require("hardhat");

// The key here is to understand how the pseudoGenerator works internally and try to reverse
// engineer it to precompute the correct password value.
// The pseudoGenerator contract isn't verified at etherscan and we don't have it's source code,
// but we can use the decompiler to get an idea of how it computes the password.
// For example see: https://goerli.etherscan.io/bytecode-decompiler?a=0x853d06b847a63a648a6882dc6e2613f30a331015
// There's an additional trick though, the function of the pseudoGenerator that is called is named
// "unknown0d8b674d" which is similar to how the decompiler labels the functions in the decompilation
// output ("unknown" + first 4 bytes of the selector). In fact there's a function with the exact same
// name ("unknown0d8b674d") in the decompilation, but this isn't the one we need. Remember function selectors
// are created by hashing the signature of the function and taking the first 4 bytes, so the function we
// are looking for is keccak("unknown0d8b674d(uint256)")[0..4] => f21091a9. It's source is:
//
// def unknownf21091a9(uint256 _param1) payable:
//   require calldata.size - 4 >=ΓÇ▓ 32
//   if stor2 != caller:
//       revert with 770176735
//   log 0xfe74d480: sha3(stor0[caller], stor1), -1
//   return sha3(tx.origin, block.number, _param1 << 120)
//
// This reveals we need to hash the origin address, block number and the (shifted by 120) seed
// in order to precompute the password.
describe("UnverifiedRandomness", function () {
  const teamAddress = '0x0009a0c1903b72a652a0266fc50fe3364e218aab';
  const instanceAddress = '0x59eCfaB19c1fF4a424771C77779579879BB089A0';
  const forkBlock = 7393910;

  let randomness;
  let team;

  beforeEach(async function() {
    // need to fork goerli to get to the contract instance
    await network.provider.request({
      method: "hardhat_reset",
      params: [
        {
          forking: {
            jsonRpcUrl: process.env.GOERLI_NODE_URL,
            blockNumber: forkBlock,
          },
        },
      ],
    });

    // impersonate with the team address
    await hre.network.provider.request({
      method: "hardhat_impersonateAccount",
      params: [teamAddress],
    });

    team = await ethers.getSigner(teamAddress);

    // attach to the deployed contract
    const UnverifiedRandomness = await ethers.getContractFactory("UnverifiedRandomness", team);
    randomness = UnverifiedRandomness.attach(instanceAddress);
  });

  afterEach(async function() {
    await network.provider.request({
      method: "hardhat_reset",
      params: [],
    });
  });

  it("can be hacked", async function() {
    // we need to compute the following hash to reveal the password. "_param1" is the seed
    // sha3(tx.origin, block.number, _param1 << 120)
    const origin = team.address;
    const blockNumber = (await time.latestBlock()) + 1;
    const seed = ethers.BigNumber.from("111111111111111111111");
    const shiftedSeed = seed.shl(120);

    const abiCoder = ethers.utils.defaultAbiCoder;
    const password = ethers.utils.keccak256(abiCoder.encode(['address', 'uint256', 'uint256'], [origin, blockNumber, shiftedSeed]));

    await randomness.canYouUnlockMe(password, seed);

    expect(await ethers.provider.getBalance(randomness.address)).to.eq(0);
  });
});
