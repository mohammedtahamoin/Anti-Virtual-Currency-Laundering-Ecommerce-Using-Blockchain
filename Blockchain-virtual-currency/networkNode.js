const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const Blockchain = require('./blockchain');
const uuid = require('uuid/v1');
const port = process.env.PORT || process.argv[2];
const rp = require('request-promise');

const nodeAddress = uuid().split('-').join('');

const virtualCurrencyBlockchain = new Blockchain();


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(function(req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	next();
  });


// get entire blockchain
app.get('/blockchain', function (req, res) {
  res.json(virtualCurrencyBlockchain);
});


// create a new transaction
app.post('/transaction', function(req, res) {
	const newTransaction = req.body;
	const blockIndex = virtualCurrencyBlockchain.addTransactionToPendingTransactions(newTransaction);
	res.json({ note: `Transaction will be added in block ${blockIndex}.` });
});


// broadcast transaction
app.post('/transaction/broadcast', function(req, res) {
	const newTransaction = virtualCurrencyBlockchain.createNewTransaction(req.body.kycId, req.body.customerId, req.body.amount, req.body.balance, req.body.sender, req.body.recipient, req.body.typeOfAction);
	virtualCurrencyBlockchain.addTransactionToPendingTransactions(newTransaction);

	const requestPromises = [];
	virtualCurrencyBlockchain.networkNodes.forEach(networkNodeUrl => {
		const requestOptions = {
			uri: networkNodeUrl + '/transaction',
			method: 'POST',
			body: newTransaction,
			json: true
		};

		requestPromises.push(rp(requestOptions));
	});

	Promise.all(requestPromises)
	.then(data => {
		res.json({ note: 'Transaction created and broadcast successfully.' });
	});
});


// mine a block
app.get('/mine', function(req, res) {
	const lastBlock = virtualCurrencyBlockchain.getLastBlock();
	const previousBlockHash = lastBlock['hash'];
	const currentBlockData = {
		transactions: virtualCurrencyBlockchain.pendingTransactions,
		index: lastBlock['index'] + 1
	};
	const nonce = virtualCurrencyBlockchain.proofOfWork(previousBlockHash, currentBlockData);
	const blockHash = virtualCurrencyBlockchain.hashBlock(previousBlockHash, currentBlockData, nonce);
	const newBlock = virtualCurrencyBlockchain.createNewBlock(nonce, previousBlockHash, blockHash);

	const requestPromises = [];
	virtualCurrencyBlockchain.networkNodes.forEach(networkNodeUrl => {
		const requestOptions = {
			uri: networkNodeUrl + '/receive-new-block',
			method: 'POST',
			body: { newBlock: newBlock },
			json: true
		};

		requestPromises.push(rp(requestOptions));
	});

	Promise.all(requestPromises)
	//  This piece of code is used to create transcaction for mining reward.
	// .then(data => {
	// 	const requestOptions = {
	// 		uri: virtualCurrencyBlockchain.currentNodeUrl + '/transaction/broadcast',
	// 		method: 'POST',
	// 		body: {
	// 			amount: 12.5,
	// 			sender: "00",
	// 			recipient: nodeAddress
	// 		},
	// 		json: true
	// 	};

	// 	return rp(requestOptions);
	// })
	.then(data => {
		res.json({
			note: "New block mined & broadcast successfully",
			block: newBlock
		});
	});
});


// receive new block
app.post('/receive-new-block', function(req, res) {
	const newBlock = req.body.newBlock;
	const lastBlock = virtualCurrencyBlockchain.getLastBlock();
	const correctHash = lastBlock.hash === newBlock.previousBlockHash; 
	const correctIndex = lastBlock['index'] + 1 === newBlock['index'];

	if (correctHash && correctIndex) {
		virtualCurrencyBlockchain.chain.push(newBlock);
		virtualCurrencyBlockchain.pendingTransactions = [];
		res.json({
			note: 'New block received and accepted.',
			newBlock: newBlock
		});
	} else {
		res.json({
			note: 'New block rejected.',
			newBlock: newBlock
		});
	}
});


// register a node and broadcast it the network
app.post('/register-and-broadcast-node', function(req, res) {
	const newNodeUrl = req.body.newNodeUrl;
	if (virtualCurrencyBlockchain.networkNodes.indexOf(newNodeUrl) == -1) virtualCurrencyBlockchain.networkNodes.push(newNodeUrl);

	const regNodesPromises = [];
	virtualCurrencyBlockchain.networkNodes.forEach(networkNodeUrl => {
		const requestOptions = {
			uri: networkNodeUrl + '/register-node',
			method: 'POST',
			body: { newNodeUrl: newNodeUrl },
			json: true
		};

		regNodesPromises.push(rp(requestOptions));
	});

	Promise.all(regNodesPromises)
	.then(data => {
		const bulkRegisterOptions = {
			uri: newNodeUrl + '/register-nodes-bulk',
			method: 'POST',
			body: { allNetworkNodes: [ ...virtualCurrencyBlockchain.networkNodes, virtualCurrencyBlockchain.currentNodeUrl ] },
			json: true
		};

		return rp(bulkRegisterOptions);
	})
	.then(data => {
		res.json({ note: 'New node registered with network successfully.' });
	});
});


// register a node with the network
app.post('/register-node', function(req, res) {
	const newNodeUrl = req.body.newNodeUrl;
	const nodeNotAlreadyPresent = virtualCurrencyBlockchain.networkNodes.indexOf(newNodeUrl) == -1;
	const notCurrentNode = virtualCurrencyBlockchain.currentNodeUrl !== newNodeUrl;
	if (nodeNotAlreadyPresent && notCurrentNode) virtualCurrencyBlockchain.networkNodes.push(newNodeUrl);
	res.json({ note: 'New node registered successfully.' });
});


// register multiple nodes at once
app.post('/register-nodes-bulk', function(req, res) {
	const allNetworkNodes = req.body.allNetworkNodes;
	allNetworkNodes.forEach(networkNodeUrl => {
		const nodeNotAlreadyPresent = virtualCurrencyBlockchain.networkNodes.indexOf(networkNodeUrl) == -1;
		const notCurrentNode = virtualCurrencyBlockchain.currentNodeUrl !== networkNodeUrl;
		if (nodeNotAlreadyPresent && notCurrentNode) virtualCurrencyBlockchain.networkNodes.push(networkNodeUrl);
	});

	res.json({ note: 'Bulk registration successful.' });
});


// consensus
app.get('/consensus', function(req, res) {
	const requestPromises = [];
	virtualCurrencyBlockchain.networkNodes.forEach(networkNodeUrl => {
		const requestOptions = {
			uri: networkNodeUrl + '/blockchain',
			method: 'GET',
			json: true
		};

		requestPromises.push(rp(requestOptions));
	});

	Promise.all(requestPromises)
	.then(blockchains => {
		const currentChainLength = virtualCurrencyBlockchain.chain.length;
		let maxChainLength = currentChainLength;
		let newLongestChain = null;
		let newPendingTransactions = null;

		blockchains.forEach(blockchain => {
			if (blockchain.chain.length > maxChainLength) {
				maxChainLength = blockchain.chain.length;
				newLongestChain = blockchain.chain;
				newPendingTransactions = blockchain.pendingTransactions;
			};
		});


		if (!newLongestChain || (newLongestChain && !virtualCurrencyBlockchain.chainIsValid(newLongestChain))) {
			res.json({
				note: 'Current chain has not been replaced.',
				chain: virtualCurrencyBlockchain.chain
			});
		}
		else {
			virtualCurrencyBlockchain.chain = newLongestChain;
			virtualCurrencyBlockchain.pendingTransactions = newPendingTransactions;
			res.json({
				note: 'This chain has been replaced.',
				chain: virtualCurrencyBlockchain.chain
			});
		}
	});
});

// get All transaction 
app.get('/alltransaction/virtualcurrency', function(req, res) {
	const transactionData = virtualCurrencyBlockchain.getAllTransaction();
	res.json({
		transactionData: transactionData.transaction
	});
});

// get transaction by Kyc Id
app.get('/kyctransaction/:kycId', function(req, res) {
	const kycId = req.params.kycId;
	const transactionData = virtualCurrencyBlockchain.getKycTransaction(kycId);
	res.json({
		transactionData: transactionData.transaction
	});
});

// get transactions by sender/recipient customerID address
app.get('/customerData/:customerId', function(req, res) {
	const customerId = req.params.customerId;
	const transactionData = virtualCurrencyBlockchain.getCustomerData(customerId);
	res.json({
		transactionData: transactionData.transaction
	});
});

// get registered nodes
app.get('/registeredNodes', function(req, res) {
	const transactionData = virtualCurrencyBlockchain.networkNodes;
	res.json({
		transactionData: transactionData
	});
});

app.listen(port, function() {
	console.log(`Listening on port ${port}...`);
});





