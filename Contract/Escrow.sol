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

constructor(address _buyer, address _seller, address _token) public {
        buyer = _buyer;
        seller = _seller;
        token = FreshCoin(_token);
        currentState = State.AWAITING_PAYMENT;
    }

function deposit(uint256 _amount) external {
        require(msg.sender == buyer, "Only buyer can deposit");
        require(currentState == State.AWAITING_PAYMENT, "Already paid");

        emit Debug("Before token transfer");
        require(token.transferFrom(msg.sender, address(this), _amount), "Token transfer failed");
        emit Debug("After token transfer");

        amount = _amount;
        currentState = State.AWAITING_DELIVERY;
        emit PaymentDeposited(_amount);
    }

function confirmDelivery() external {
        require(msg.sender == buyer, "Only buyer can confirm delivery");
        require(currentState == State.AWAITING_DELIVERY, "Cannot confirm delivery");

        require(token.transfer(seller, amount), "Token transfer failed");
        currentState = State.COMPLETE;
    }
}
  
