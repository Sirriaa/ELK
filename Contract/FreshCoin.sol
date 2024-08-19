// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

contract FreshCoin {
    string public constant name = "FreshCoin";
    string public constant symbol = "FRC";
    uint8 public constant decimals = 18;
    uint256 public constant initialSupply = 10000 * (10 ** uint256(decimals)); // 10,000 * 10^18
    uint256 public totalSupply;

    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    address public owner;

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
 function transfer(address _to, uint256 _value) public returns (bool success) {
  require(_to != address(0), "Invalid address");
        require(_value <= balanceOf[msg.sender], "Insufficient balance");

        balanceOf[msg.sender] -= _value;
        balanceOf[_to] += _value;
        emit Transfer(msg.sender, _to, _value);
        return true;
    }
     function approve(address _spender, uint256 _value) public returns (bool success) {
        allowance[msg.sender][_spender] = _value;
        emit Approval(msg.sender, _spender, _value);
        return true;
    }

     function transferFrom(address _from, address _to, uint256 _value) public returns (bool success) {
        require(_to != address(0), "Invalid address");
        require(_value <= balanceOf[_from], "Insufficient balance");
        require(_value <= allowance[_from][msg.sender], "Allowance exceeded");

        balanceOf[_from] -= _value;
        balanceOf[_to] += _value;
        allowance[_from][msg.sender] -= _value;
        emit Transfer(_from, _to, _value);
        return true;
    }

     function mint(uint256 _amount) external {
        require(msg.sender == owner, "Only the owner can mint tokens");
        totalSupply += _amount;
        balanceOf[owner] += _amount;
        emit Transfer(address(0), owner, _amount);
    }
  function burn(uint256 _amount) external {
        require(msg.sender == owner, "Only the owner can burn tokens");
        require(balanceOf[owner] >= _amount, "Insufficient balance to burn");

        totalSupply -= _amount;
        balanceOf[owner] -= _amount;
        emit Transfer(owner, address(0), _amount);
    }
   }
