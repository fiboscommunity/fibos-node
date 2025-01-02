# How to Start a FIBOS Node

## Directory Structure

1. The current directory contains three files: `config.json`, `genesis.json`, and `index.js`. These files, by default, can be used to start a genesis node. The block-producing node's producer_name is `eosio`.

2. The `config.json` file mainly contains the configuration information for node startup, including the node's port numbers, keys, and other settings.

- Detailed parameter explanations:

```json
{
    "http_port" : 8870,        // The HTTPS port used by the node
    "p2p_port"  : 9870,        // The P2P port used by the node
    "p2p_peer_address": ["127.0.0.1:9870", "127.0.0.1:9871"], // P2P addresses the node connects to
    "pubkey_prefix": "FO",     // The public key prefix used by the node
    "producer_name": "eosio",  // The producer name of the node
    "config_dir"   : "./data", // The configuration directory of the node (usually, the configuration files and data should be in the same directory)
    "data_dir"     : "./data", // The data directory of the node
    "snapshot_dir" : "",       // The snapshot directory used by the node
    "public_key"   : "FO6MRyAjQq8ud7hVNYcfnVPJqcVpscN5So8BhtHuGYqET5GDW5CV", // The public key used by the node
    "private_key"  : "5KQwrPbwdL6PhXujxW37FSSQZ1JiwsST4cqQzDeyXtP79zkvFD3",  // The private key used by the node
    "genesis_json" : "genesis.json" // The path to the genesis file used by the node
}
```

3. The `genesis.json` file contains the genesis information for the node and generally does not need to be modified.

4. The `index.js` file is the entry point to start the node. It contains detailed configurations for the node's behavior, which is executed using the compiled fibos binary to create a node.

- Detailed explanation: If you have any doubts about configuring any plugin (except for the cross plugin) or want to understand the functionality of plugin configurations, such as the `http` plugin's `http-server-address`, which sets the HTTP service address of the node, it is recommended to visit the `EOSIO(LEAP)` official community for more information. You can search and learn more at: `https://github.com/AntelopeIO/leap`. We will not go into further detail here.

```js
// Using the chain module from fibos (blockchain)
const fibos = require('chain');
console.notice("start FIBOS node");

// Loading the config.json file
const config = require('./config.json');

// Node configuration
const p2pPort      = config.p2p_port;
const httpPort     = config.http_port;
const public_key   = config.public_key;
const private_key  = config.private_key;
const producername = config.producer_name;

fibos.pubkey_prefix = config.pubkey_prefix;
fibos.config_dir    = config.config_dir;
fibos.data_dir      = config.data_dir;

// Chain configuration
let chain_config = {
	"contracts-console": true,
	'chain-state-db-size-mb': 8 * 1024,
	// "delete-all-blocks": true
};

// Whether to start the node with a snapshot. If yes, input the snapshot file path, e.g., "snapshots/snapshot.bin". Otherwise, use the genesis.json to start the node.
const snapshotPath = config.snapshot_dir;
if(snapshotPath && snapshotPath.length !== 0){
    chain_config['snapshot'] = snapshotPath;
} else {
	chain_config['genesis-json'] = config.genesis_json;
}

console.notice("config_dir:", fibos.config_dir);
console.notice("data_dir:", fibos.data_dir);

// Load the HTTP module plugin
fibos.load("http", {
	"http-server-address": `0.0.0.0:${httpPort}`,
	"access-control-allow-origin": "*",           
	"http-validate-host": false,
	"verbose-http-errors": true
});

// Load the net module plugin
fibos.load("net", {
	"max-clients": 100,
	"p2p-peer-address": config.p2p_peer_address,
	"p2p-listen-endpoint": `0.0.0.0:${p2pPort}`,
	"agent-name": "FIBOS NODE"
});

let producer_config = {
	'max-transaction-time': 3000,
	'snapshots-dir': 'snapshots'
}

// Whether it is a block-producing node. If yes, configure the node's producer_name, public_key, and private_key. Otherwise, for sync nodes, these parameters are not required.
if (producername && public_key && private_key) {
	producer_config['producer-name']           = producername;
    producer_config['enable-stale-production'] = true;
	producer_config['signature-provider']      = `${public_key}=KEY:${private_key}`;
}

if(producer_config){
    fibos.load("producer", producer_config);
	fibos.load("producer_api");
}

fibos.load("chain", chain_config);

// Load the chain API module plugin
fibos.load("chain_api");

// Load the cross-chain module plugin
fibos.load("cross");

// Start the node
fibos.start();
```

## Start a Node

1. Obtain the fibos executable file: You can compile `fibos` binary executable file, the reference address is: `https://github.com/fiboscommunity/fibos` and install it in the system environment. Alternatively, you can download the `fibos` binary executable file from the official `FIBOS` website and install it in your environment. Use the following command to download:

```bash
curl -s https://fibos.io/download/installer.sh | sh
```

2. Enter the current `node` directory: Run the `index.js` file to start a block-producing node:

```bash
fibos ./index.js
```