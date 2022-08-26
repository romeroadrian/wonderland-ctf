# Wonderland CTF - ETHLatam @ Buenos Aires 2022

This is a hardhat project with the contracts and solutions for the Wonderland CTF hosted at ETHLatam @ Buenos Aires 2022.

Each challenge has a corresponding test with the implementation and a description of the solution.

Install dependencies with `yarn` and execute the tests using `npx hardhat test`.

**Thanks Wonderland and Connext for the amazing experience!**

## Challenges

### Lottery

>Let the games begin!  
>First off, a Lottery. Pay to play, get the bounty by buying the winning ticket 🎟  
>Here is the source code of the contract, this challenge is of MEDIUM difficulty:  

Contract: [Lottery.sol](contracts/Lottery.sol)

Solution: [Lottery.js](test/Lottery.js)

### Timelock

> 3... 2... 1...  
> You can now start with Timelock!  
> this one should be quite EASY!  

Contract: [TimeLock.sol](contracts/TimeLock.sol)

Solution: [Timelock.js](test/Timelock.js)

### DistributePayments

>OH NO! (Oh YES actually)  
>It looks like there is a payment system out there that seems to be vulnerable.  
>Either breaking the contract or stealing the funds would be great, it should be fairly EASY 😄  

Contract: [DistributePayments.sol](contracts/DistributePayments.sol)

Solution: [DistributePayments.js](test/DistributePayments.js)

### GuessMyAnswerFromEtherscan

>Hey all! just found out about a potentially vulnerable contract, it's really HARD for me to exploit it, but I'm sure you'll be able to solve it!  
>There is also another contract, but I cannot find the source now, I'll keep looking and keep you posted.  
>Best of luck!

>YES! Found out the other contract!  
>This should help you debug what's happening with the answers and questions ! GLHF!

Contract: [GuessMyAnswerFromEtherscan.sol](contracts/GuessMyAnswerFromEtherscan.sol)

Solution?: [GuessMyAnswerFromEtherscan.js](test/GuessMyAnswerFromEtherscan.js)

### FundCommiter

>Hey all!  
>Yes, you guessed correctly, another vulnerable contract just appeared x.x  
>This one seems to be harder than easy but easier than hard. In case you didn’t get that, it is of MEDIUM difficulty.  
>Try to get its funds back!

Contract: [FundCommiter.sol](contracts/FundCommiter.sol)

Solution: [FundCommiter.js](test/FundCommiter.js)

### UnverifiedRandomness

> Welp... this one is the last one, and it's preeeeety MEDIUM. (UnverifiedRandomness)  
> You can find some help here, but there might be more than one way of solving it:  
> https://github.com/defi-wonderland/ctf-unverified-randomness  
> God speed, you beautiful hackers

Contract: [UnverifiedRandomness.sol](contracts/UnverifiedRandomness.sol)

Solution: [UnverifiedRandomness.js](test/UnverifiedRandomness.js)
