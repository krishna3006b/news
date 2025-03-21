import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { connectWallet } from "@/lib/ethereum";
import { truncateAddress } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { ethers } from "ethers";

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      on: (eventName: string, callback: (...args: any[]) => void) => void;
      removeListener: (eventName: string, callback: (...args: any[]) => void) => void;
      [key: string]: any;
    };
  }
}

export function WalletConnect() {
  const [account, setAccount] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    const checkConnection = async () => {
      if (window.ethereum) {
        try {
          const provider = new ethers.BrowserProvider(window.ethereum);
          const accounts = await provider.listAccounts();
          if (accounts.length > 0) {
            setAccount(accounts[0].address);
          }
        } catch (error) {
          console.error("Failed to check wallet connection:", error);
        }
      }
    };

    checkConnection();

    if (window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts: string[]) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          toast({
            title: "Wallet Connected",
            description: `Connected to ${truncateAddress(accounts[0])}`,
          });
        } else {
          setAccount(null);
          toast({
            title: "Wallet Disconnected",
            description: "Your wallet has been disconnected",
            variant: "destructive",
          });
        }
      });
    }
  }, []);

  const handleConnect = async () => {
    if (isConnecting) return;
    
    setIsConnecting(true);
    try {
      const address = await connectWallet();
      setAccount(address);
      toast({
        title: "Wallet Connected",
        description: `Connected to ${truncateAddress(address)}`,
      });
    } catch (error) {
      console.error("Failed to connect wallet:", error);
      toast({
        title: "Connection Failed",
        description: "Failed to connect wallet. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div>
      {account ? (
        <Button variant="outline" className="glass">
          {truncateAddress(account)}
        </Button>
      ) : (
        <Button onClick={handleConnect} disabled={isConnecting}>
          {isConnecting ? "Connecting..." : "Connect Wallet"}
        </Button>
      )}
    </div>
  );
}