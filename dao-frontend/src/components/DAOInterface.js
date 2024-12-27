import React, { useEffect, useState, useCallback } from 'react';
import { useWeb3React } from '@web3-react/core';
import { ethers } from 'ethers';
import { injected, getWalletConnectConnector, getContract } from '../utils/web3';
import './DAOInterface.css';

const DAOInterface = () => {
  const { active, account, library, activate, deactivate } = useWeb3React();
  const [proposals, setProposals] = useState([]);
  const [userDeposit, setUserDeposit] = useState('0');
  const [depositAmount, setDepositAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [transactionPending, setTransactionPending] = useState(false);
  const [voteAmounts, setVoteAmounts] = useState({});
  const [walletError, setWalletError] = useState('');

  useEffect(() => {
    // Check if we're already connected
    if (window.ethereum) {
      window.ethereum.request({ method: 'eth_accounts' })
        .then(accounts => {
          if (accounts.length > 0) {
            connectMetaMask();
          }
        })
        .catch(console.error);
    }
  }, []);

  // Load user deposit information
  const loadUserDeposit = useCallback(async () => {
    if (library && account) {
      try {
        const signer = library.getSigner(account);
        const contract = getContract(signer);
        const userInfo = await contract.userInfo(account);
        setUserDeposit(ethers.utils.formatEther(userInfo.depositedAmount));
      } catch (error) {
        console.error('Error loading user deposit:', error);
      }
    }
  }, [library, account]);

  // Load proposals
  const loadProposals = useCallback(async () => {
    if (library && account) {
      try {
        setLoading(true);
        const signer = library.getSigner(account);
        const contract = getContract(signer);
        
        const count = await contract.getProposalsCount();
        const proposalPromises = [];
        
        for (let i = 0; i < count.toNumber(); i++) {
          proposalPromises.push(contract.getProposal(i));
        }
        
        const proposalResults = await Promise.all(proposalPromises);
        const formattedProposals = proposalResults.map((proposal, index) => ({
          id: index,
          targetContract: proposal.targetContract,
          startTime: new Date(proposal.startTime.toNumber() * 1000),
          endTime: new Date(proposal.endTime.toNumber() * 1000),
          yesVotes: ethers.utils.formatEther(proposal.yesVotes),
          noVotes: ethers.utils.formatEther(proposal.noVotes),
          executed: proposal.executed,
          finished: proposal.finished
        }));
        
        setProposals(formattedProposals);
      } catch (error) {
        console.error('Error loading proposals:', error);
      } finally {
        setLoading(false);
      }
    }
  }, [library, account]);

  // Connect wallet handlers
  const connectMetaMask = async () => {
    console.log('Connecting to MetaMask...');
    if (!window.ethereum) {
      setWalletError('MetaMask is not installed. Please install MetaMask first.');
      return;
    }

    try {
      setWalletError('');
      setLoading(true);

      // First activate Web3React
      await activate(injected);

      // Then request accounts and check network
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      const targetNetworkId = '0xaa36a7'; // Sepolia
      const currentNetwork = await window.ethereum.request({ method: 'eth_chainId' });
      
      if (currentNetwork !== targetNetworkId) {
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: targetNetworkId }],
          });
        } catch (switchError) {
          if (switchError.code === 4902) {
            try {
              await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [{
                  chainId: targetNetworkId,
                  chainName: 'Sepolia',
                  nativeCurrency: {
                    name: 'Sepolia ETH',
                    symbol: 'SEP',
                    decimals: 18
                  },
                  rpcUrls: ['https://sepolia.infura.io/v3/'],
                  blockExplorerUrls: ['https://sepolia.etherscan.io']
                }]
              });
            } catch (addError) {
              setWalletError('Could not add Sepolia network to MetaMask.');
              setLoading(false);
              return;
            }
          } else {
            setWalletError('Please switch to the Sepolia network in your wallet.');
            setLoading(false);
            return;
          }
        }
      }

      setLoading(false);
    } catch (error) {
      console.error('MetaMask connection error:', error);
      setWalletError(
        error.message === 'Already processing eth_requestAccounts. Please wait.'
          ? 'Please check MetaMask popup and approve the connection.'
          : 'Error connecting to MetaMask. Please try again.'
      );
      setLoading(false);
    }
  };

  const connectWalletConnect = async () => {
    console.log('Connecting to WalletConnect...');
    try {
      setWalletError('');
      setLoading(true);
      const connector = getWalletConnectConnector();
      await activate(connector);
      setLoading(false);
    } catch (error) {
      console.error('WalletConnect error:', error);
      setWalletError('Error connecting with WalletConnect. Please try again.');
      setLoading(false);
    }
  };

  const disconnectWallet = async () => {
    try {
      deactivate();
    } catch (error) {
      console.error('Disconnect error:', error);
    }
  };

  useEffect(() => {
    console.log('Active status:', active);
    console.log('Connected account:', account);
  }, [active, account]);

  useEffect(() => {
    if (active && library && account) {
      loadProposals();
      loadUserDeposit();
    }
  }, [active, library, account, loadProposals, loadUserDeposit]);

  const handleDeposit = async () => {
    if (!depositAmount || !library || !account) return;
    
    try {
      setTransactionPending(true);
      const signer = library.getSigner(account);
      const contract = getContract(signer);
      
      const tx = await contract.deposit(ethers.utils.parseEther(depositAmount));
      await tx.wait();
      
      setDepositAmount('');
      loadProposals();
    } catch (error) {
      console.error('Error depositing:', error);
      alert('Failed to deposit. Please check your balance and try again.');
    } finally {
      setTransactionPending(false);
    }
  };

  const handleVoteAmountChange = (proposalId, amount) => {
    setVoteAmounts(prev => ({
      ...prev,
      [proposalId]: amount
    }));
  };

  const handleVote = async (proposalId, support) => {
    if (!library || !account) return;
    
    const amount = voteAmounts[proposalId];
    if (!amount) {
      alert('Please enter an amount to vote with');
      return;
    }

    try {
      setLoading(true);
      const signer = library.getSigner(account);
      const contract = getContract(signer);
      
      const tx = await contract.vote(
        proposalId,
        support,
        ethers.utils.parseEther(amount.toString())
      );
      
      await tx.wait();
      
      // Refresh proposals after voting
      loadProposals();
      
      // Clear the vote amount
      setVoteAmounts(prev => ({
        ...prev,
        [proposalId]: ''
      }));
    } catch (error) {
      console.error('Error voting:', error);
      alert('Failed to vote. Please check your balance and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!library || !account) return;
    
    try {
      setLoading(true);
      const signer = library.getSigner(account);
      const contract = getContract(signer);
      const tx = await contract.withdraw();
      await tx.wait();
      
      await loadProposals(); // Refresh data
    } catch (error) {
      console.error('Error withdrawing:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dao-interface">
      {!active ? (
        <div className="wallet-connection">
          <h2>Connect Your Wallet</h2>
          {walletError && <p className="error-message">{walletError}</p>}
          <div className="wallet-buttons">
            <button 
              onClick={connectMetaMask} 
              className="wallet-button"
              disabled={loading}
            >
              <img src="../../public/metamask-logo.svg" alt="MetaMask" />
              {loading ? 'Connecting...' : 'Connect MetaMask'}
            </button>
            <button 
              onClick={connectWalletConnect} 
              className="wallet-button"
              disabled={loading}
            >
              <img src="../../public/walletconnect-logo.svg" alt="WalletConnect" />
              {loading ? 'Connecting...' : 'Connect WalletConnect'}
            </button>
          </div>
        </div>
      ) : (
        <div className="dao-content">
          <div className="wallet-status">
            <p>Connected: {account ? `${account.slice(0, 6)}...${account.slice(-4)}` : ''}</p>
            <button onClick={disconnectWallet} className="disconnect-button">
              Disconnect
            </button>
          </div>
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Connected Account</h3>
                <p className="text-sm text-gray-500">{account}</p>
              </div>
              <button
                onClick={disconnectWallet}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Disconnect
              </button>
            </div>
            <div className="border-t border-gray-200 pt-4">
              <p className="text-sm font-medium text-gray-500">Your Deposit</p>
              <p className="mt-1 text-2xl font-semibold text-gray-900">{userDeposit} Tokens</p>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Deposit Tokens</h3>
            <div className="flex gap-4">
              <input
                type="number"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                placeholder="Amount to deposit"
                className="flex-1 min-w-0 block w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                disabled={transactionPending}
              />
              <button
                onClick={handleDeposit}
                disabled={transactionPending}
                className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                  transactionPending 
                    ? 'bg-indigo-400 cursor-not-allowed' 
                    : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                }`}
              >
                {transactionPending ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                    </svg>
                    Processing...
                  </>
                ) : 'Deposit'}
              </button>
              <button
                onClick={handleWithdraw}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Withdraw All
              </button>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">DAO Proposals</h3>
            {loading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
              </div>
            ) : proposals.length === 0 ? (
              <p className="text-center text-gray-500 py-4">No proposals available</p>
            ) : (
              <div className="space-y-6">
                {proposals.map((proposal, index) => (
                  <div key={proposal.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-4">
                      <h4 className="text-lg font-medium text-gray-900">Proposal #{index}</h4>
                      <span className={`px-2 py-1 text-sm rounded-full ${
                        new Date() < proposal.endTime && !proposal.finished 
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {new Date() < proposal.endTime && !proposal.finished ? 'Active' : 'Ended'}
                      </span>
                    </div>
                    
                    <div className="space-y-2 text-sm text-gray-500">
                      <p><span className="font-medium">Target Contract:</span> {proposal.targetContract}</p>
                      <p><span className="font-medium">Start Time:</span> {proposal.startTime.toLocaleString()}</p>
                      <p><span className="font-medium">End Time:</span> {proposal.endTime.toLocaleString()}</p>
                      
                      <div className="mt-4 bg-gray-50 rounded-lg p-4">
                        <div className="flex justify-between mb-2">
                          <span className="font-medium">Yes Votes: {Number(proposal.yesVotes).toFixed(2)}</span>
                          <span className="font-medium">No Votes: {Number(proposal.noVotes).toFixed(2)}</span>
                        </div>
                        <div className="relative pt-1">
                          <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200">
                            <div
                              style={{ 
                                width: `${
                                  Number(proposal.yesVotes) + Number(proposal.noVotes) === 0 
                                    ? 0 
                                    : (Number(proposal.yesVotes) / (Number(proposal.yesVotes) + Number(proposal.noVotes))) * 100
                                }%` 
                              }}
                              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-500"
                            />
                          </div>
                        </div>
                      </div>

                      {new Date() < proposal.endTime && !proposal.finished && (
                        <div className="mt-4 flex gap-4">
                          <input
                            type="number"
                            placeholder="Amount to vote"
                            value={voteAmounts[index] || ''}
                            className="flex-1 min-w-0 block w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            onChange={(e) => handleVoteAmountChange(index, e.target.value)}
                          />
                          <button
                            onClick={() => handleVote(index, true)}
                            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                          >
                            Vote Yes
                          </button>
                          <button
                            onClick={() => handleVote(index, false)}
                            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                          >
                            Vote No
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DAOInterface;
