// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;
import "./FreshCoin.sol";

contract Escrow {
    address public buyer;
    address public seller;
    FreshCoin public token;
    uint256 public amount;
enum State { AWAITING_PAYMENT, AWAITING_DELIVERY, COMPLETE }
    State public currentState;

    event Debug(string message);
    event PaymentDeposited(uint256 amount);

  
