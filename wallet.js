const rp = require('request-promise')
const fs = require('fs')
const bitcoinjs = require('bitcoinjs-lib')
const bip32 = require('bip32')

function getUtxos (address) {
    return rp('https://testnet-api.smartbit.com.au/v1/blockchain/address/' + address + '/unspent')
      .then(res => JSON.parse(res))
}

function pushTransaction (rawTx) {
    const OPTS = {
      method: 'POST',
      uri: 'https://testnet-api.smartbit.com.au/v1/blockchain/pushtx',
      body: {
        hex: rawTx
      },
      json: true
    }
    return rp(OPTS)
}

class Wallet{
  constructor(seed, network) {
    this.seed = seed 
    this.network = network || bitcoinjs.networks.testnet
    this.rootNode = bip32.fromSeed(this.seed,this.network)
  }

  static fromFile(filePath) {
    filePath = filePath || 'backup.wallet'
    const b64Data = fs.readFileSync(filePath).toString('utf8')
    const jsonString = Buffer.from(b64Data, 'base64').toString('utf8')
    const jsonData = JSON.parse(jsonString)
    return new Wallet(Buffer.from(jsonData.seed,'hex'), jsonData.network)
  }

  toFile(filePath) {
    filePath = filePath || 'backup.wallet'
    const jsonData = {
      seed: this.seed.toString('hex'),
      network: this.network,
    }
    const jsonString = JSON.stringify(jsonData)
    const jsonBuffer = Buffer.from(jsonString, 'utf8')
    fs.writeFileSync(filePath, jsonBuffer.toString('base64'))
  }

  getAddress(n) {
    this.address = bitcoinjs.payments.p2pkh({
      pubkey: this.rootNode.derivePath("m/44'/0'/0'/0/" + n).publicKey,
      network: this.network
    }).address
    return this.address
  }

  getWIF(n) {
    this.wif = this.wif || this.rootNode.derivePath("m/44'/0'/0'/0/" + n).toWIF()
    return this.wif
  }

  checkUtxos(n) {
    return getUtxos(this.getAddress(n))
      .then(results => {
        this.utxos = results.unspent
      })
  }

  getUtxos() {
    return this.utxos || []
  }

  async sendCoins(from,to, amount, fee0) {
    const fee = fee0 || 100000
    await this.checkUtxos(from)
    const utxos = this.getUtxos()
          
    const txb = new bitcoinjs.TransactionBuilder(this.network)
    let inputTotalAmount = 0
    utxos.forEach(utxo => {
      inputTotalAmount += utxo.value_int
      txb.addInput(utxo.txid, utxo.n)
    })
          
    if (amount + fee > inputTotalAmount)
      throw new Error('残高不足')
          
    txb.addOutput(this.getAddress(to), amount)
          
    const MIN_OUTPUT_AMOUNT = 600
    if (amount + fee + MIN_OUTPUT_AMOUNT < inputTotalAmount) {
      txb.addOutput(this.getAddress(from), inputTotalAmount - fee - amount)
    }
  
          
    utxos.forEach((_u, i) => {
      txb.sign(i, this.rootNode.derivePath("m/44'/0'/0'/0/" + from))
    })
          
    const tx = txb.build()
    const txHex = tx.toHex()
    const result = await pushTransaction(txHex)
          
    return result.success ? tx.getId() : ''
  }  
}

module.exports = Wallet