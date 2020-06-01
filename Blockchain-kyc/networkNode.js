const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const Blockchain = require('./blockchain');
const uuid = require('uuid/v1');
const port = process.env.PORT || process.argv[2];
const rp = require('request-promise');

const nodeAddress = uuid().split('-').join('');

const kycBlockchain = new Blockchain();


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(function(req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	next();
  });


// get entire blockchain
app.get('/blockchain', function (req, res) {
  res.json(kycBlockchain);
});


// create a new transaction
app.post('/transaction', function(req, res) {
	const newTransaction = req.body;
	const blockIndex = kycBlockchain.addTransactionToPendingTransactions(newTransaction);
	res.json({ note: `Transaction will be added in block ${blockIndex}.` });
});


// broadcast transaction
app.post('/transaction/broadcast', function(req, res) {
	const newTransaction = kycBlockchain.createNewTransaction(req.body.documentName, req.body.documentId, req.body.fullName, req.body.address, req.body.DOB, req.body.kycId, req.body.kycApprovedOn);
	kycBlockchain.addTransactionToPendingTransactions(newTransaction);

	const requestPromises = [];
	kycBlockchain.networkNodes.forEach(networkNodeUrl => {
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
	const lastBlock = kycBlockchain.getLastBlock();
	const previousBlockHash = lastBlock['hash'];
	const currentBlockData = {
		transactions: kycBlockchain.pendingTransactions,
		index: lastBlock['index'] + 1
	};
	const nonce = kycBlockchain.proofOfWork(previousBlockHash, currentBlockData);
	const blockHash = kycBlockchain.hashBlock(previousBlockHash, currentBlockData, nonce);
	const newBlock = kycBlockchain.createNewBlock(nonce, previousBlockHash, blockHash);

	const requestPromises = [];
	kycBlockchain.networkNodes.forEach(networkNodeUrl => {
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
	// 		uri: kycBlockchain.currentNodeUrl + '/transaction/broadcast',
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
	const lastBlock = kycBlockchain.getLastBlock();
	const correctHash = lastBlock.hash === newBlock.previousBlockHash; 
	const correctIndex = lastBlock['index'] + 1 === newBlock['index'];

	if (correctHash && correctIndex) {
		kycBlockchain.chain.push(newBlock);
		kycBlockchain.pendingTransactions = [];
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
	if (kycBlockchain.networkNodes.indexOf(newNodeUrl) == -1) kycBlockchain.networkNodes.push(newNodeUrl);

	const regNodesPromises = [];
	kycBlockchain.networkNodes.forEach(networkNodeUrl => {
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
			body: { allNetworkNodes: [ ...kycBlockchain.networkNodes, kycBlockchain.currentNodeUrl ] },
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
	const nodeNotAlreadyPresent = kycBlockchain.networkNodes.indexOf(newNodeUrl) == -1;
	const notCurrentNode = kycBlockchain.currentNodeUrl !== newNodeUrl;
	if (nodeNotAlreadyPresent && notCurrentNode) kycBlockchain.networkNodes.push(newNodeUrl);
	res.json({ note: 'New node registered successfully.' });
});


// register multiple nodes at once
app.post('/register-nodes-bulk', function(req, res) {
	const allNetworkNodes = req.body.allNetworkNodes;
	allNetworkNodes.forEach(networkNodeUrl => {
		const nodeNotAlreadyPresent = kycBlockchain.networkNodes.indexOf(networkNodeUrl) == -1;
		const notCurrentNode = kycBlockchain.currentNodeUrl !== networkNodeUrl;
		if (nodeNotAlreadyPresent && notCurrentNode) kycBlockchain.networkNodes.push(networkNodeUrl);
	});

	res.json({ note: 'Bulk registration successful.' });
});


// consensus
app.get('/consensus', function(req, res) {
	const requestPromises = [];
	kycBlockchain.networkNodes.forEach(networkNodeUrl => {
		const requestOptions = {
			uri: networkNodeUrl + '/blockchain',
			method: 'GET',
			json: true
		};

		requestPromises.push(rp(requestOptions));
	});

	Promise.all(requestPromises)
	.then(blockchains => {
		const currentChainLength = kycBlockchain.chain.length;
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


		if (!newLongestChain || (newLongestChain && !kycBlockchain.chainIsValid(newLongestChain))) {
			res.json({
				note: 'Current chain has not been replaced.',
				chain: kycBlockchain.chain
			});
		}
		else {
			kycBlockchain.chain = newLongestChain;
			kycBlockchain.pendingTransactions = newPendingTransactions;
			res.json({
				note: 'This chain has been replaced.',
				chain: kycBlockchain.chain
			});
		}
	});
});


// get transaction by kycId
app.get('/kycDetailById/:kycId', function(req, res) {
	const kycId = req.params.kycId;
	const transactionData = kycBlockchain.getTransactionBykycId(kycId);
	res.json({
		transactionData: transactionData.transaction
	});
});

// get transaction by fullname
app.get('/kycDetailByName/:name', function(req, res) {
	const name = req.params.name;
	const transactionData = kycBlockchain.getTransactionByName(name);
	res.json({
		transactionData: transactionData.transaction
	});
});

// get transaction by documentId
app.get('/kycDetailByDocumentId/:documentId', function(req, res) {
	const documentId = req.params.documentId;
	const transactionData = kycBlockchain.getTransactionBydocumentId(documentId);
	res.json({
		transactionData: transactionData.transaction
	});
});

// get registered nodes
app.get('/registeredNodes', function(req, res) {
	const transactionData = kycBlockchain.networkNodes;
	res.json({
		transactionData: transactionData
	});
});

app.listen(port, function() {
	console.log(`Listening on port ${port}...`);
});





