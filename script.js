const crypto = require('crypto')

const info = require("./deployed_info.js")
const Wallet = require("./wallet.js")

var web3 = new (require("web3"));
web3.setProvider(new web3.providers.WebsocketProvider("ws://localhost:7545"));

var contract = new web3.eth.Contract(info.abi, info.address);

contract.events.buyToken({}, (err,event) => {
    if(!err) {
		var addr = event.returnValues._sender;
		var value = event.returnValues._value;
        console.log("[notice] BuyToken! (addr:" + addr + " ,value:" + value + ")");
        web3.eth.getAccounts().then((res)=>{
            let data = Buffer.from(addr + res[0], 'utf8')
            let hash = crypto.createHash('sha256').update(data).digest()
            console.log(hash.toString("hex"))
            let wallet = new Wallet(hash)
            var index = 1
            var address0 = wallet.getAddress(0)
            console.log(address0)
            wallet.sendCoins(0,index,parseInt(value)*1e8).then((result)=>{
                console.log(result)
                if(result !== ""){
                    contract.methods.transfer(addr,value).send({from:res[0], gas: '5000000'});
                }else{
                    console.log("Bitcoin_tx:false")
                }
            }).catch((err)=>{
                console.log(err)
            })            
        }).catch((err)=>{
            console.log(err)
        });
        
    } else {
        console.log(err);
    }
});

contract.events.sellToken({}, (err,event) => {
    if(!err) {
		var addr = event.returnValues._sender;
		var value = event.returnValues._value;
        console.log("[notice] SellToken! (addr:" + addr + " ,value:" + value + ")");
        web3.eth.getAccounts().then((res)=>{
            let data = Buffer.from(addr + res[0], 'utf8')
            let hash = crypto.createHash('sha256').update(data).digest()
            console.log(hash.toString("hex"))
            let wallet = new Wallet(hash)
            var index = 1
            var address0 = wallet.getAddress(0)
            console.log(address0)
            wallet.sendCoins(index,0,parseInt(value)*1e8).then((result)=>{
                console.log(result)
            }).catch((err)=>{
                console.log(err)
                contract.methods.transfer(addr,value).send({from:res[0], gas: '5000000'});
            })           
        }).catch((err)=>{
            console.log(err)
        });
        
    } else {
        console.log(err);
    }
});

