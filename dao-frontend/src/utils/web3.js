import { InjectedConnector } from '@web3-react/injected-connector';
import { WalletConnectConnector } from '@web3-react/walletconnect-connector';
import { ethers } from 'ethers';

const SEPOLIA_CHAIN_ID = 11155111;
const RPC_URL = `https://eth-sepolia.g.alchemy.com/v2/${process.env.REACT_APP_ALCHEMY_KEY}`;

export const injected = new InjectedConnector({
  supportedChainIds: [SEPOLIA_CHAIN_ID]
});

const createWalletConnectConnector = () => {
  return new WalletConnectConnector({
    rpc: { [SEPOLIA_CHAIN_ID]: RPC_URL },
    bridge: 'https://bridge.walletconnect.org',
    qrcode: true,
    supportedChainIds: [SEPOLIA_CHAIN_ID],
    chainId: SEPOLIA_CHAIN_ID,
    pollingInterval: 12000
  });
};

export const getWalletConnectConnector = () => {
  return createWalletConnectConnector();
};

export const getContract = (provider) => {
  if (!provider) {
    console.error('No provider available');
    return null;
  }

  const contractAddress = '0x64b2428983d5ab66ad0849b93d83113b980ccf32';
  const abi = [
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_votingToken",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "_votingDuration",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "_chairman",
          "type": "address"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "inputs": [],
      "name": "getProposalsCount",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "proposalId",
          "type": "uint256"
        }
      ],
      "name": "getProposal",
      "outputs": [
        {
          "internalType": "bytes",
          "name": "callData",
          "type": "bytes"
        },
        {
          "internalType": "address",
          "name": "targetContract",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "startTime",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "endTime",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "yesVotes",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "noVotes",
          "type": "uint256"
        },
        {
          "internalType": "bool",
          "name": "executed",
          "type": "bool"
        },
        {
          "internalType": "bool",
          "name": "finished",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "user",
          "type": "address"
        }
      ],
      "name": "userInfo",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "depositedAmount",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "deposit",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "proposalId",
          "type": "uint256"
        },
        {
          "internalType": "bool",
          "name": "support",
          "type": "bool"
        },
        {
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "vote",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "user",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "Deposited",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "previousOwner",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "newOwner",
          "type": "address"
        }
      ],
      "name": "OwnershipTransferred",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "proposalId",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "address",
          "name": "targetContract",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "bytes",
          "name": "callData",
          "type": "bytes"
        }
      ],
      "name": "ProposalCreated",
      "type": "event"
    }
  ];

  try {
    return new ethers.Contract(contractAddress, abi, provider);
  } catch (error) {
    console.error('Error creating contract instance:', error);
    return null;
  }
};
