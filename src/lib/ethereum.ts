
import { ethers } from "ethers";

const contractABI = [
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "string",
        "name": "ipfsHash",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "title",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "timestamp",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "author",
        "type": "address"
      }
    ],
    "name": "NewsUploaded",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_index",
        "type": "uint256"
      }
    ],
    "name": "getNews",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "newsCount",
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
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "newsItems",
    "outputs": [
      {
        "internalType": "string",
        "name": "ipfsHash",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "title",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "timestamp",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "author",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "_ipfsHash",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_title",
        "type": "string"
      }
    ],
    "name": "uploadNews",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

const contractAddress = "0x85dD1663091a31ACD2676BF975C172FC8aE8B659";

export interface NewsItem {
  ipfsHash: string;
  title: string;
  timestamp: number;
  author: string;
  index: number;
  verificationScore?: number;
}

export async function connectWallet(): Promise<string> {
  if (!window.ethereum) {
    throw new Error("Metamask not installed");
  }

  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const accounts = await provider.send("eth_requestAccounts", []);
    return accounts[0];
  } catch (error) {
    console.error("Error connecting wallet:", error);
    throw new Error("Failed to connect wallet");
  }
}

export async function uploadNews(ipfsHash: string, title: string): Promise<void> {
  if (!window.ethereum) {
    throw new Error("Metamask not installed");
  }

  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(contractAddress, contractABI, signer);
    
    const tx = await contract.uploadNews(ipfsHash, title);
    await tx.wait();
  } catch (error) {
    console.error("Error uploading news:", error);
    throw new Error("Failed to upload news to blockchain");
  }
}

export async function getNewsCount(): Promise<number> {
  if (!window.ethereum) {
    throw new Error("Metamask not installed");
  }

  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const contract = new ethers.Contract(contractAddress, contractABI, provider);
    
    const count = await contract.newsCount();
    return Number(count);
  } catch (error) {
    console.error("Error getting news count:", error);
    throw new Error("Failed to get news count");
  }
}

export async function getNewsItem(index: number): Promise<NewsItem> {
  if (!window.ethereum) {
    throw new Error("Metamask not installed");
  }

  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const contract = new ethers.Contract(contractAddress, contractABI, provider);
    
    const [ipfsHash, title, timestamp, author] = await contract.getNews(index);
    
    return {
      ipfsHash,
      title,
      timestamp: Number(timestamp) * 1000, 
      author,
      index
    };
  } catch (error) {
    console.error("Error getting news item:", error);
    throw new Error("Failed to get news item");
  }
}

export async function getAllNews(): Promise<NewsItem[]> {
  try {
    const count = await getNewsCount();
    const newsPromises = [];
    
    for (let i = 0; i < count; i++) {
      newsPromises.push(getNewsItem(i));
    }
    
    return await Promise.all(newsPromises);
  } catch (error) {
    console.error("Error getting all news:", error);
    throw new Error("Failed to get all news");
  }
}
