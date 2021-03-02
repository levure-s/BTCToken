pragma solidity >=0.4.22 <0.9.0;

import "openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";

contract BTCToken is ERC20 {
    string public symbol;
    string public  name;
    address owner = msg.sender;
    event buyToken(address _sender, uint _value);
    event sellToken(address _sender, uint _value);
    

    constructor() public {
        symbol = "BCT";
        name = "BitcoinToken";
        _mint(msg.sender, 11579208923731619542357098500868790785326998466564056403945758400791312963993);
    }

    function balanceOfMe() public view returns (uint) {
        return balanceOf(msg.sender);
    }
    
    function BuyToken(uint _num)public{
        emit buyToken(msg.sender,_num);
    }
    
    function SellToken(uint _num)public{
        transfer(owner,_num);
        emit sellToken(msg.sender,_num);
    }
}