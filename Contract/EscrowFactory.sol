// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

import "./Escrow.sol";

contract EscrowFactory {
    address[] public escrows;

    event EscrowCreated(address escrowAddress, address buyer, address seller);

    function createEscrow(address _buyer, address _seller, address _token) external returns (address) {
        Escrow escrow = new Escrow(_buyer, _seller, _token);
        escrows.push(address(escrow));
        emit EscrowCreated(address(escrow), _buyer, _seller);
        return address(escrow);
    }

    function getEscrowAddress(uint256 index) external view returns (address) {
        return escrows[index];
    }

    function getEscrowCount() external view returns (uint256) {
        return escrows.length;
    }
}
