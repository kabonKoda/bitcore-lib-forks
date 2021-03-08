'use strict';
var _ = require('lodash');

var BufferUtil = require('./util/buffer');
var JSUtil = require('./util/js');
var networks = [];
var networkMaps = {};

/**
 * A network is merely a map containing values that correspond to version
 * numbers for each bitcoin network. Currently only supporting "livenet"
 * (a.k.a. "mainnet") and "testnet".
 * @constructor
 */
function Network() {}

Network.prototype.toString = function toString() {
  return this.name;
};

/**
 * @function
 * @member Networks#get
 * Retrieves the network associated with a magic number or string.
 * @param {string|number|Network} arg
 * @param {string|Array} keys - if set, only check if the magic number associated with this name matches
 * @return Network
 */
function get(arg, keys) {
  if (~networks.indexOf(arg)) {
    return arg;
  }
  if (keys) {
    if (!_.isArray(keys)) {
      keys = [keys];
    }
    var containsArg = function(key) {
      return networks[index][key] === arg;
    };
    for (var index in networks) {
      if (_.some(keys, containsArg)) {
        return networks[index];
      }
    }
    return undefined;
  }
  if(networkMaps[arg] && networkMaps[arg].length >= 1) {
    return networkMaps[arg][0];
  } else {
    return networkMaps[arg];
  }
}

/***
 * Derives an array from the given prefix to be used in the computation
 * of the address' checksum.
 *
 * @param {string} prefix Network prefix. E.g.: 'bitcoincash'.
 */
function prefixToArray(prefix) {
  var result = [];
  for (var i=0; i < prefix.length; i++) {
    result.push(prefix.charCodeAt(i) & 31);
  }
  return result;
}

/**
 * @function
 * @member Networks#add
 * Will add a custom Network
 * @param {Object} data
 * @param {string} data.name - The name of the network
 * @param {string} data.alias - The aliased name of the network
 * @param {Number} data.pubkeyhash - The publickey hash prefix
 * @param {Number} data.privatekey - The privatekey prefix
 * @param {Number} data.scripthash - The scripthash prefix
 * @param {string} data.bech32prefix - The native segwit prefix
 * @param {Number} data.xpubkey - The extended public key magic
 * @param {Number} data.xprivkey - The extended private key magic
 * @param {Number} data.networkMagic - The network magic number
 * @param {Number} data.port - The network port
 * @param {Array}  data.dnsSeeds - An array of dns seeds
 * @return Network
 */
function addNetwork(data) {

  var network = new Network();

  JSUtil.defineImmutable(network, {
    name: data.name,
    alias: data.alias,
    pubkeyhash: data.pubkeyhash,
    privatekey: data.privatekey,
    scripthash: data.scripthash,
    xpubkey: data.xpubkey,
    xprivkey: data.xprivkey
  });

  if (data.bech32prefix) {
    _.extend(network, {
      bech32prefix: data.bech32prefix,
    });
  }

  if (data.zaddr) {
    _.extend(network, {
      zaddr: data.zaddr,
    });
  }

  if (data.zkey) {
    _.extend(network, {
      zkey: data.zkey,
    });
  }

  if (data.prefix) {
    _.extend(network, {
      prefix: data.prefix,
      prefixArray: prefixToArray(data.prefix),
    });
  }

  if (data.networkMagic) {
    JSUtil.defineImmutable(network, {
      networkMagic: BufferUtil.integerAsBuffer(data.networkMagic)
    });
  }

  if (data.port) {
    JSUtil.defineImmutable(network, {
      port: data.port
    });
  }

  if (data.dnsSeeds) {
    JSUtil.defineImmutable(network, {
      dnsSeeds: data.dnsSeeds
    });
  }
  _.each(network, function(value) {
    if (!_.isUndefined(value) && !_.isObject(value)) {
      if(!networkMaps[value]) {
        networkMaps[value] = [];
      }
      networkMaps[value].push(network);
    }
  });

  networks.push(network);

  return network;

}

/**
 * @function
 * @member Networks#remove
 * Will remove a custom network
 * @param {Network} network
 */
function removeNetwork(network) {
  for (var i = 0; i < networks.length; i++) {
    if (networks[i] === network) {
      networks.splice(i, 1);
    }
  }
  for (var key in networkMaps) {
    const index = networkMaps[key].indexOf(network);
    if (index >= 0) {
      delete networkMaps[key][index];
    }
  }
}

//set to default also as livenet ... works for BSV too
addNetwork({
  name: 'livenet',
  alias: 'mainnet',
  pubkeyhash: 0x00,
  privatekey: 0x80,
  scripthash: 0x05,
  bech32prefix: 'bc',
  xpubkey: 0x0488b21e,
  xprivkey: 0x0488ade4,
  networkMagic: 0xf9beb4d9,
  port: 8333,
  dnsSeeds: [
    'seed.bitcoin.sipa.be',
    'dnsseed.bluematt.me',
    'dnsseed.bitcoin.dashjr.org',
    'seed.bitcoinstats.com',
    'seed.bitnodes.io',
    'bitseed.xf2.org'
  ]
});

//BTC set to default also as livenet ... works for BSV too
addNetwork({
  name: 'btc',
  alias: 'mainnet',
  pubkeyhash: 0x00,
  privatekey: 0x80,
  scripthash: 0x05,
  bech32prefix: 'bc',
  xpubkey: 0x0488b21e,
  xprivkey: 0x0488ade4,
  networkMagic: 0xf9beb4d9,
  port: 8333,
  dnsSeeds: [
    'seed.bitcoin.sipa.be',
    'dnsseed.bluematt.me',
    'dnsseed.bitcoin.dashjr.org',
    'seed.bitcoinstats.com',
    'seed.bitnodes.io',
    'bitseed.xf2.org'
  ]
});

//Add BCH network ... works for BSV too
addNetwork({
  name: 'bch',
  alias: 'mainnet',
  prefix: 'bitcoincash',
  pubkeyhash: 28,
  privatekey: 0x80,
  scripthash: 40,
  xpubkey: 0x0488b21e,
  xprivkey: 0x0488ade4,
  networkMagic: 0xe3e1f3e8,
  port: 8333,
  dnsSeeds: [
    'seed.bitcoinabc.org',
    'seed-abc.bitcoinforks.org',
    'btccash-seeder.bitcoinunlimited.info',
    'seeder.jasonbcox.com',
    'seed.deadalnix.me',
    'seed.bchd.cash'
  ]
});

//Add BSV network ... works for BSV too
addNetwork({
  name: 'bsv',
  alias: 'mainnet',
  prefix: 'bitcoincash',
  pubkeyhash: 28,
  privatekey: 0x80,
  scripthash: 40,
  xpubkey: 0x0488b21e,
  xprivkey: 0x0488ade4,
  networkMagic: 0xe3e1f3e8,
  port: 8333,
  dnsSeeds: [
    'seed.bitcoinabc.org',
    'seed-abc.bitcoinforks.org',
    'btccash-seeder.bitcoinunlimited.info',
    'seeder.jasonbcox.com',
    'seed.deadalnix.me',
    'seed.bchd.cash'
  ]
});

//Add ZEC network
addNetwork({
  name: 'zec',
  alias: 'mainnet',
  pubkeyhash: 0x1cb8,
  privatekey: 0x80,
  scripthash: 0x1cbd,
  xpubkey: 0x0488b21e,
  xprivkey: 0x0488ade4,
  zaddr: 0x169a,
  zkey: 0xab36,
  networkMagic: 0x24e92764,
  port: 8233,
  dnsSeeds: [
    'dnsseed.z.cash',
    'dnsseed.str4d.xyz',
    'dnsseed.znodes.org'
  ]
})

//Add DOGE network .... Works for XVG too
addNetwork({
  name: 'doge',
  alias: 'mainnet',
  pubkeyhash: 0x1e,
  privatekey: 0x9e,
  scripthash: 0x16,
  xpubkey: 0x02facafd,
  xprivkey: 0x02fac398,
  networkMagic: 0xc0c0c0c0,
  port: 22556,
  dnsSeeds: [
    'seed.dogecoin.com',
    'seed.multidoge.org',
    'seed2.multidoge.org',
    'seed.doger.dogecoin.com'
  ]
})

//Add DASH network
addNetwork ({
  name: 'dash',
  alias: 'mainnet',
  pubkeyhash: 0x4c,
  privatekey: 0xcc,
  scripthash: 0x10,
  xpubkey: 0x488b21e,
  xprivkey: 0x488ade4,
  networkMagic: 0xbf0c6bbd,
  port: 9999,
  dnsSeeds: [
    'dnsseed.darkcoin.io',
    'dnsseed.dashdot.io',
    'dnsseed.masternode.io',
    'dnsseed.dashpay.io'
  ]
})

//Add DGB network
addNetwork({
  name: 'dgb',
  alias: 'mainnet',
  bech32prefix: 'dgb',
  pubkeyhash: 0x1e,
  privatekey: 0x80,
  privatekeyOld: 0x9e,
  scripthash: 0x3f,
  scripthashTwo: 0x05,
  xpubkey:  0x0488b21e,
  xprivkey: 0x0488ade4,
  networkMagic: 0xfac3b6da,
  port: 12024,
  dnsSeeds: [
    'seed.digibyte.co',
    'seed.digibyte.io',
    'digiexplorer.info'
  ]
})

//Add QTUM network
addNetwork({
  name: 'qtum',
  alias: 'mainnet',
  pubkeyhash: 0x3a,
  privatekey: 0x80,
  scripthash: 0x32,
  xpubkey: 0x0488b21e,
  xprivkey: 0x0488ade4,
  networkMagic: 0xf9beb4d9,
  port: 8333,
  dnsSeeds: []
})

//Add BTG network
addNetwork({
  name: 'btg',
  alias: 'mainnet',
  pubkeyhash: 0x26,
  privatekey: 0x80,
  scripthash: 0x17,
  xpubkey: 0x0488b21e,
  xprivkey: 0x0488ade4,
  networkMagic: 0xe3e1f3e8,
  port: 8333,
  dnsSeeds: [
    'eu-dnsseed.bitcoingold-official.org',
    'dnsseed.bitcoingold.org',
    'dnsseed.btcgpu.org'
  ]
})

/**
 * @instance
 * @member Networks#livenet
 */
var livenet = get('livenet');

addNetwork({
  name: 'testnet',
  alias: 'test',
  pubkeyhash: 0x6f,
  privatekey: 0xef,
  scripthash: 0xc4,
  bech32prefix: 'tb',
  xpubkey: 0x043587cf,
  xprivkey: 0x04358394,
  networkMagic: 0x0b110907,
  port: 18333,
  dnsSeeds: [
    'testnet-seed.bitcoin.petertodd.org',
    'testnet-seed.bluematt.me',
    'testnet-seed.alexykot.me',
    'testnet-seed.bitcoin.schildbach.de'
  ]
});

/**
 * @instance
 * @member Networks#testnet
 */
var testnet = get('testnet');

addNetwork({
  name: 'regtest',
  alias: 'dev',
  pubkeyhash: 0x6f,
  privatekey: 0xef,
  scripthash: 0xc4,
  bech32prefix: 'bcrt',
  xpubkey: 0x043587cf,
  xprivkey: 0x04358394,
  networkMagic: 0xfabfb5da,
  port: 18444,
  dnsSeeds: []
});

/**
 * @instance
 * @member Networks#testnet
 */
var regtest = get('regtest');

/**
 * @function
 * @deprecated
 * @member Networks#enableRegtest
 * Will enable regtest features for testnet
 */
function enableRegtest() {
  testnet.regtestEnabled = true;
}

/**
 * @function
 * @deprecated
 * @member Networks#disableRegtest
 * Will disable regtest features for testnet
 */
function disableRegtest() {
  testnet.regtestEnabled = false;
}

/**
 * @namespace Networks
 */
module.exports = {
  add: addNetwork,
  remove: removeNetwork,
  defaultNetwork: livenet,
  livenet: livenet,
  mainnet: livenet,
  testnet: testnet,
  regtest: regtest,
  get: get,
  enableRegtest: enableRegtest,
  disableRegtest: disableRegtest
};
