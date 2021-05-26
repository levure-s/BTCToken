const crypto = require('crypto');
const express = require('express');
const app = express();
const http = require('http').Server(app);
app.use("/", express.static(__dirname + '/'));
app.get('/', (req, res) => { res.redirect("/"); });


const info = require("./deployed_info.js")
const Wallet = require("./wallet.js")
const sub = new (require("./sub.js"))

const INFURA_PROJECT_ID = "d11c17162d934093bf8bafa878e42df7";
var web3 = new (require("web3"));
web3.setProvider(new web3.providers.WebsocketProvider(`wss://rinkeby.infura.io/ws/v3/${INFURA_PROJECT_ID}`));

var contract = new web3.eth.Contract(info.abi, info.address);

class BTCToken{
    async startSystem() {
        var result = await this.initGanache();
        if(result == false) {
            console.log("startSystem: ERR. please restart 'Ganache' and reTry.")
            return;
        }

        http.listen(3000, () => {
            console.log('listen 3000');
        });
    }

    async initGanache() {
        this.OWNER_ADDR = await sub.getAccount()
        return true;
    }

    buyToken(event){
        var addr = event.returnValues._sender;
		var value = event.returnValues._value;
        console.log("[notice] BuyToken! (addr:" + addr + " ,value:" + value + ")");
        console.log(this.OWNER_ADDR)
        let data = Buffer.from(addr + this.OWNER_ADDR, 'utf8')
        let hash = crypto.createHash('sha256').update(data).digest()
        console.log(hash.toString("hex"))
        let wallet = new Wallet(hash)
        var index = 1
        var address0 = wallet.getAddress(0)
        console.log(address0)
        wallet.sendCoins(0,index,parseInt(value)*1e8).then((result)=>{
            console.log(result)
            sub.contractTransfer(addr,value)
        }).catch((err)=>{
            console.log(err)
        })            
    }

    sellToken(event){
        var addr = event.returnValues._sender;
		var value = event.returnValues._value;
        console.log("[notice] SellToken! (addr:" + addr + " ,value:" + value + ")");
        let data = Buffer.from(addr + this.OWNER_ADDR, 'utf8')
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
            sub.contractTransfer(addr,value)
        })           
    }
}
var v = new BTCToken()
v.startSystem()
contract.events.buyToken({}, (err,event) => {
    if(!err) {
		v.buyToken(event)    
    } else {
        console.log(err);
    }
});
contract.events.sellToken({}, (err,event) => {
    if(!err) {
		v.sellToken(event)
    } else {
        console.log(err);
    }
});

