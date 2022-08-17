// SPDX-License-Identifier: MIT
pragma solidity 0.6.12;

contract FundContract {
    function fund(address payable instance) external payable {
        selfdestruct(instance);
    }
}
