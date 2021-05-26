const web3 = new (require("web3"));
const HDWalletProvider = require('truffle-hdwallet-provider');
const INFURA_PROJECT_ID = "d11c17162d934093bf8bafa878e42df7";
const mnemonic = "payment festival describe bird jaguar cram artwork flower video window undo join";
const info = require("./deployed_info.js")
web3.setProvider(new HDWalletProvider(mnemonic, `https://rinkeby.infura.io/v3/${INFURA_PROJECT_ID}`));
var contract = new web3.eth.Contract(info.abi, info.address);

class Sub{
    async getAccount(){
        var accounts = await web3.eth.getAccounts();
        var OWNER_ADDR = accounts[0];
        return OWNER_ADDR;
    }

    async contractTransfer(addr,value){
        await contract.methods.transfer(addr,parseInt(value)).send({from:info.deploy_account, gas: '5000000'})
        .catch((err)=>{
            console.log(err)
        });
    }
}
module.exports = Sub