# Vanity-Name-Registration-System

A vanity name registering system resistant against frontrunning.

The purpose of the name is outside the scope of this assignment and made reasonable assumptions on the size, encoding, etc of the name.

An unregistered name can be registered for a certain amount of time by locking a certain balance of an account.

After the registration expires, the account loses ownership of the name and his balance is unlocked.

The registration can be renewed by making an on-chain call to keep the name registered and balance locked.

Assumed reasonable defaults for the locking amount and period.

The fee to register the name depends directly on the size of the name.

Also, a malicious node/validator is not able to front-run the process by censoring transactions of an honest user and registering its name in its own account.

# Front Running
Front running is the act of placing a transaction in a queue with the knowledge of a future transaction. Front running on a blockchain platform normally happens when a miner, who has access to information on pending transactions, places an order that would earn him a profit based on a pending trade.

In order to make the system anti-front running we need to broadcast transactions to specified nodes through their specific RPC-URLs

We can do this by adding RPC-URLs in Metamask if we are dealing with non-custodial wallets. All the transactions then will go to mempool through this new RPC URL

One of the solutions for this use below connection details for custom Metamask blockchain network: <br />
Network Name: bloXroute Private TX <br />
New RPC URL: https://metamask-rpc.blxrbdn.com/ <br />
Chain ID: 1 <br />
Currency Symbol: ETH (for Ethereum network) <br />

Commands:

`truffle compile` => to compile the contracts

`truffle test` => to run the test scripts on the contracts

`truffle deploy` => to deploy the contracts to the networks configured in the truffle-config file. <br />

# NOTE
Please add .secret file with mnenomics in the main folder to run the project.
