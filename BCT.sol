pragma solidity >=0.6.0 <0.8.0;

import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC20/ERC20.sol";

contract BTCToken is ERC20 {
    address owner = msg.sender;
    event buyToken(address _sender, uint _value);
    event sellToken(address _sender, uint _value);
    

    constructor() ERC20("BitcoinToken","BCT") public {
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