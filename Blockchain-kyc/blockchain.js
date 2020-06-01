const sha256 = require('sha256');
const production  = 'https://blockchain-2-kyc.herokuapp.com';
const development = process.argv[3];
const currentNodeUrl = (process.env.NODE_ENV ? production : development);
const uuid = require('uuid/v1');

function Blockchain() {
	this.chain = [];
	this.pendingTransactions = [];

	this.currentNodeUrl = currentNodeUrl;
	this.networkNodes = [];

	this.createNewBlock(100, '0', '0');
};


Blockchain.prototype.createNewBlock = function(nonce, previousBlockHash, hash) {
	const newBlock = {
		index: this.chain.length + 1,
		timestamp: Date.now(),
		transactions: this.pendingTransactions,
		nonce: nonce,
		hash: hash,
		previousBlockHash: previousBlockHash
	};

	this.pendingTransactions = [];
	this.chain.push(newBlock);

	return newBlock;
};


Blockchain.prototype.getLastBlock = function() {
	return this.chain[this.chain.length - 1];
};


Blockchain.prototype.createNewTransaction = function(documentName, documentId, fullName,  address, DOB, kycId, kycApprovedOn) {
	const newTransaction = {
		kycId: kycId,
		documentName: documentName,
		documentId: documentId,
		fullName: fullName,
		address: address,
		DOB: DOB,
		kycApprovedOn: kycApprovedOn,
		transactionId: uuid().split('-').join('')
	};

	return newTransaction;
};


Blockchain.prototype.addTransactionToPendingTransactions = function(transactionObj) {
	this.pendingTransactions.push(transactionObj);
	return this.getLastBlock()['index'] + 1;
};


Blockchain.prototype.hashBlock = function(previousBlockHash, currentBlockData, nonce) {
	const dataAsString = previousBlockHash + nonce.toString() + JSON.stringify(currentBlockData);
	const hash = sha256(dataAsString);
	return hash;
};


Blockchain.prototype.proofOfWork = function(previousBlockHash, currentBlockData) {
	let nonce = 0;
	let hash = this.hashBlock(previousBlockHash, currentBlockData, nonce);
	while (hash.substring(0, 4) !== '0000') {
		nonce++;
		hash = this.hashBlock(previousBlockHash, currentBlockData, nonce);
	}

	return nonce;
};



Blockchain.prototype.chainIsValid = function(blockchain) {
	let validChain = true;

	for (var i = 1; i < blockchain.length; i++) {
		const currentBlock = blockchain[i];
		const prevBlock = blockchain[i - 1];
		const blockHash = this.hashBlock(prevBlock['hash'], { transactions: currentBlock['transactions'], index: currentBlock['index'] }, currentBlock['nonce']);
		if (blockHash.substring(0, 4) !== '0000') validChain = false;
		if (currentBlock['previousBlockHash'] !== prevBlock['hash']) validChain = false;
	};

	const genesisBlock = blockchain[0];
	const correctNonce = genesisBlock['nonce'] === 100;
	const correctPreviousBlockHash = genesisBlock['previousBlockHash'] === '0';
	const correctHash = genesisBlock['hash'] === '0';
	const correctTransactions = genesisBlock['transactions'].length === 0;

	if (!correctNonce || !correctPreviousBlockHash || !correctHash || !correctTransactions) validChain = false;

	return validChain;
};


Blockchain.prototype.getTransactionBykycId = function(kycId) {
	let kycDetails = [];

	this.chain.forEach(block => {
		block.transactions.forEach(transaction => {
			if (transaction.kycId === kycId) {
				kycDetails.push(transaction);
			};
		});
	});

	return {
		transaction: kycDetails,
	};
};

Blockchain.prototype.getTransactionByName = function(name) {
	let kycDetails = [];

	this.chain.forEach(block => {
		block.transactions.forEach(transaction => {
			if (transaction.fullName === name) {
				kycDetails.push(transaction);
			};
		});
	});

	return {
		transaction: kycDetails,
	};
};

Blockchain.prototype.getTransactionBydocumentId = function(documentId) {
	let kycDetails = [];

	this.chain.forEach(block => {
		block.transactions.forEach(transaction => {
			if (transaction.documentId === documentId) {
				kycDetails.push(transaction);
			};
		});
	});

	return {
		transaction: kycDetails,
	};
};

module.exports = Blockchain;














