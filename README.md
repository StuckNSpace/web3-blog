
# Web3 Blog DApp with Smart Contract Integration

This project is a **decentralized blog** where users can post content via a **web3 interface** that interacts with a smart contract deployed on the **Base chain**. The application allows users to write posts, hide them, permanently delete them, and view posts containing interactive JavaScript, HTML, and even Three.js content. Posts are stored on-chain through a Solidity smart contract.

## Features

- **Web3 Wallet Integration**: Connect MetaMask or any other Ethereum-based wallet to interact with the app.
- **Post Content On-Chain**: Users can create new posts that are stored on a smart contract.
- **Hide/Unhide Posts**: Posts can be hidden and later shown using the app's interface.
- **Permanent Deletion**: Hidden posts can be permanently deleted.
- **JavaScript & Three.js Support**: Posts containing JavaScript and Three.js can be rendered and displayed in the browser.
- **ESC to Exit Posts**: Users can close post windows using the `ESC` key, ensuring smooth UX.

## Project Structure

The project consists of two primary components:
1. **Frontend**: A React-based web page that interacts with the smart contract.
2. **Smart Contract**: A Solidity contract that manages blog post creation, retrieval, and counting.

### Technologies Used

- **React.js**: For building the interactive frontend.
- **Ethers.js**: To interact with the smart contract and Ethereum wallet.
- **Three.js**: For rendering interactive 3D content in posts.
- **Solidity**: For the smart contract that stores and manages posts.
- **Base Chain**: The smart contract is deployed on the Base chain, a Layer 2 solution.

## Setup Instructions

### Prerequisites

Make sure you have the following installed:

- **Node.js**: [Node.js Download](https://nodejs.org/)
- **MetaMask**: [MetaMask Download](https://metamask.io/)
- **Base Chain**: Access to Base or any EVM-compatible chain.

### Frontend Installation

1. **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/web3-blog.git
    cd web3-blog
    ```

2. **Install dependencies:**
    ```bash
    npm install
    ```

3. **Configure the Smart Contract Address:**
   Open `Blog.js` and set your deployed smart contract address here:

   ```js
   const contractAddress = 'YOUR_SMART_CONTRACT_ADDRESS_ON_BASE';
   ```

4. **Run the frontend:**
    ```bash
    npm start
    ```

5. **Connect MetaMask:**
   - Open the web app in your browser.
   - Connect MetaMask by clicking the "Connect MetaMask" button.
   - Ensure that MetaMask is configured to the correct Base chain network.

### Smart Contract Setup

1. **Compile the contract:**
   - You can use Remix or Truffle to compile and deploy the contract.
   
2. **Deploy the smart contract:**
   Deploy the contract to the Base chain using Remix, Hardhat, or Truffle.

   The Solidity contract structure is as follows:

   ```solidity
   pragma solidity ^0.8.0;

   contract Blog {
       event NewPost(address indexed author, string content);

       struct Post {
           address author;
           string content;
       }

       Post[] public posts;

       function createPost(string memory content) public {
           posts.push(Post(msg.sender, content));
           emit NewPost(msg.sender, content);
       }

       function getPost(uint256 index) public view returns (address, string memory) {
           Post memory post = posts[index];
           return (post.author, post.content);
       }

       function getPostCount() public view returns (uint256) {
           return posts.length;
       }
   }
   ```

3. **Update Contract ABI:**
   The ABI (Application Binary Interface) file for the smart contract should be stored in the `src/abis/` folder as `BlogABI.json`.

   If you modify the contract, ensure to update the ABI after deployment.

## Interacting with the DApp

### Creating a New Post

1. **Connect Wallet**: Connect your wallet using MetaMask by clicking the "Connect MetaMask" button on the homepage.
2. **Submit a Post**:
   - Write your content in the textarea provided.
   - You can include HTML, JavaScript, or Three.js code inside the post.
   - Click "Submit Post" to push the post to the blockchain.

### Viewing Posts

1. **View Post**: Click "View Post" to view a post. If the post contains HTML or JavaScript, it will be executed within the post window.
2. **Close Post**: Press the `ESC` key to close the post.
   
### Hiding and Deleting Posts

1. **Hide Post**: You can hide any post by clicking the "Hide Post" button. The post will no longer be visible in the list.
2. **Show Hidden Posts**: Click "Show Hidden Posts" at the bottom-left of the page to reveal hidden posts.
3. **Delete Post**: Once hidden posts are shown, you can permanently delete a post by clicking "Delete Post."

## Known Issues and Limitations

- **Gas Costs**: Since all posts are stored on-chain, gas costs may vary depending on network congestion.
- **Post Length**: Posts are limited in size due to transaction data limits. Large posts may require splitting.
- **JavaScript Execution**: Posts containing complex JavaScript (like Three.js) may take time to load or execute.

## Future Enhancements

- **Pagination**: Add pagination to load posts in smaller batches.
- **Improved Three.js Integration**: Provide support for more complex Three.js scenes, including textures and models.
- **Post Editing**: Allow users to edit posts stored on-chain.
- **Decentralized Storage**: Integrate with decentralized storage solutions like IPFS to store larger posts.

## Conclusion

This project demonstrates how you can create a decentralized blogging platform using **React** for the frontend and a **Solidity smart contract** for on-chain data storage. The project showcases how **web3** technologies like **ethers.js**, **MetaMask**, and **smart contracts** can be used to create interactive and persistent applications.

Feel free to fork this repository, make improvements, or contribute!
