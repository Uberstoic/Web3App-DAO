# Web3 DAO Governance Portal

A decentralized autonomous organization (DAO) governance portal that allows token holders to participate in proposal voting and manage their token deposits. Built with React and Web3 technologies.

🌐 **Live Demo**: [https://web3-app-dao.vercel.app/](https://web3-app-dao.vercel.app/)

## Features

- 🦊 **MetaMask Integration**: Seamless wallet connection and network switching
- 🗳️ **Proposal Voting**: View and vote on active proposals
- 💰 **Token Management**: Deposit and withdraw governance tokens
- 📊 **Real-time Updates**: Live tracking of proposal status and vote counts
- 🎨 **Modern UI**: Clean and responsive design with Tailwind CSS
- ⛓️ **Sepolia Testnet**: Deployed and tested on Ethereum Sepolia testnet

## Technology Stack

- **Frontend Framework**: React.js
- **Web3 Integration**: 
  - Ethers.js for blockchain interaction
  - Web3-React for wallet connection
- **Styling**: Tailwind CSS
- **Build Tool**: CRACO (Create React App Configuration Override)
- **Deployment**: Vercel

## Smart Contract

The DAO is controlled by a smart contract deployed on Sepolia testnet at:
`0x64b2428983d5ab66ad0849b93d83113b980ccf32`

### Contract Features
- Token-based voting system
- Proposal creation and execution
- Token deposits and withdrawals
- Timelock mechanism for proposal voting

## Getting Started

### Prerequisites
- Node.js (v14+ recommended)
- MetaMask wallet
- Some Sepolia ETH for gas fees

### Local Development

1. Clone the repository:
```bash
git clone https://github.com/yourusername/Web3App-DAO.git
cd Web3App-DAO/dao-frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file:
```env
REACT_APP_ALCHEMY_KEY=your_alchemy_key
REACT_APP_CONTRACT_ADDRESS=0x64b2428983d5ab66ad0849b93d83113b980ccf32
```

4. Start the development server:
```bash
npm start
```

### Production Deployment

The project is configured for deployment on Vercel. To deploy:

1. Fork this repository
2. Import the project in Vercel
3. Configure environment variables in Vercel dashboard
4. Deploy!

## Usage Guide

1. **Connect Wallet**
   - Click "Connect MetaMask"
   - Approve the connection in MetaMask
   - Switch to Sepolia network if prompted

2. **Deposit Tokens**
   - Enter the amount you want to deposit
   - Approve the transaction in MetaMask
   - Wait for confirmation

3. **Vote on Proposals**
   - Browse active proposals
   - Enter your voting amount
   - Click "Vote Yes" or "Vote No"
   - Confirm the transaction

4. **Withdraw Tokens**
   - Click "Withdraw All" to withdraw your deposited tokens
   - Confirm the transaction in MetaMask

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Ethereum Foundation](https://ethereum.org/)
- [Web3-React](https://github.com/NoahZinsmeister/web3-react)
- [Ethers.js](https://docs.ethers.io/)