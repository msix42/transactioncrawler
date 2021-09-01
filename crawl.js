/*
    @author Marius Schell
    @version 1.0
 */

'use strict';

// Immediately invoked function expression as a wrapper for asynchronous code
(async () => {
  // Inject web3 variable
  let web3 = new Web3(new Web3.providers.WebsocketProvider("wss://mainnet.infura.io/ws/v3/YOUR_API_KEY_HERE"));

  let addressSelected = '';
  // Prompt for a block and convert to number with unary +
  let blockSelected = +prompt("Please enter block");
  let blockLatest;
  let transactionsFrom = [];
  let transactionsTo = [];
  let blocks = [];
  let currentBalance;

  // Prompt for address of valid length
  while (addressSelected.length !== 42){
    addressSelected = prompt("Please enter address");
  }

  // Request current balance and latest blocks with wrappers for potential errors such as timeouts

  try {
  currentBalance = await web3.eth.getBalance(addressSelected);
  // Convert from Wei to Ether
  currentBalance *= (10**-18);
  } catch (err) {
    console.log(err);
  }

  try {
    blockLatest = await web3.eth.getBlockNumber();
  } catch (err) {
    console.log(err);
  }

  // Ensure selected block is >=0 and <= current block and save chosen blocks' data in blocks array
  if (blockSelected <= blockLatest && blockSelected >= 0){
    for (let i = 0; i <= blockLatest - blockSelected; i++){
      blocks[i] = await web3.eth.getBlock(blockSelected + i, true);
    }
  }
  else {
    alert("Invalid block number.");
  }

  // Add informative text to web page
  document.getElementById('balance').append('Current Balance: ' + currentBalance + ' Ether');
  document.getElementById('description').append('Showing all transactions to and from the address ' + addressSelected + ' between block ' + blockSelected + ' and ' + blockLatest + ':');

  // Iterate over the individual blocks in the blocks[] array
  for(let j = 0; j <= blockLatest - blockSelected; j++){
    // Debugging
    // console.log(blocks[j].number);

    // Look for transactions to or from the selected address and add their Id to the transactionIds arrays (transactionsFrom for outgoing and transactionsTo for incoming transactions)
    blocks[j].transactions.forEach(item => {
      if (item.from === addressSelected){
        transactionsFrom.push(item.transactionIndex);
      }
      if (item.to === addressSelected){
        transactionsTo.push(item.transactionIndex);
      }
    });

    // For each occurrence of addressSelected append descriptions and data of sent transactions to the HTML document
    transactionsFrom.forEach(item => {
      let linebreak = document.createElement('br');
      document.getElementById('sent').append('From: ' + blocks[j].transactions[item].from + ' To: ' + blocks[j].transactions[item].to + ' Amount: ' + blocks[j].transactions[item].value * (10**-18) + ' Ether ' + '| Gas fee:' + (blocks[j].transactions[item].gas * blocks[j].transactions[item].gasPrice)*10**-18 + ' Ether');
      document.getElementById('sent').append(linebreak);

    })

    // For each occurrence of addressSelected append descriptions and data of received to the HTML document
    transactionsTo.forEach(item => {
      let linebreak = document.createElement('br');
      document.getElementById('received').append('From: ' + blocks[j].transactions[item].from + ' To: ' + blocks[j].transactions[item].to + ' Amount: ' + blocks[j].transactions[item].value * (10**-18) + ' Ether ' + '| Gas fee:' + (blocks[j].transactions[item].gas * blocks[j].transactions[item].gasPrice)*10**-18 + ' Ether');
      document.getElementById('received').append(linebreak);

    })

    // Empty transaction index arrays for next block
    transactionsFrom = [];
    transactionsTo = [];
  }
})();

