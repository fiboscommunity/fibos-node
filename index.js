const fibos = require('chain');
console.notice("start FIBOS node");

const config = require('./config.json');

const p2pPort      = config.p2p_port;
const httpPort     = config.http_port;
const public_key   = config.public_key;
const private_key  = config.private_key;
const producername = config.producer_name;

fibos.pubkey_prefix = config.pubkey_prefix;
fibos.config_dir    = config.config_dir;
fibos.data_dir      = config.data_dir;

let chain_config = {
	"contracts-console": true,
	'chain-state-db-size-mb': 8 * 1024,
	// "delete-all-blocks": true
};

const snapshotPath = config.snapshot_dir;
if(snapshotPath && snapshotPath.length !== 0){
	chain_config['snapshot'] = snapshotPath;
} else {
	chain_config['genesis-json'] = config.genesis_json;
}

console.notice("config_dir:", fibos.config_dir);
console.notice("data_dir:", fibos.data_dir);

fibos.load("http", {
	"http-server-address": `0.0.0.0:${httpPort}`,
	"access-control-allow-origin": "*",
	"http-validate-host": false,
	"verbose-http-errors": true
});

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
fibos.load("chain_api");
fibos.load("cross");

fibos.start();
