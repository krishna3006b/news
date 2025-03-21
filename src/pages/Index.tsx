import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { NewsCard } from "@/components/NewsCard";
import { NewsForm } from "@/components/NewsForm";
import { getAllNews, NewsItem } from "@/lib/ethereum";
import { getFromIPFS } from "@/lib/ipfs";
import { toast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {ethers} from "ethers";

const Index = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  
  useEffect(() => {
    fetchNews();
    
    const checkWallet = async () => {
      if (window.ethereum) {
        try {
          const provider = new ethers.BrowserProvider(window.ethereum);
          const accounts = await provider.listAccounts();
          if (accounts.length > 0) {
            setWalletAddress(accounts[0].address);
          }
        } catch (error) {
          console.error("Failed to check wallet:", error);
        }
      }
    };
    
    checkWallet();
    
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts: string[]) => {
        if (accounts.length > 0) {
          setWalletAddress(accounts[0]);
        } else {
          setWalletAddress(null);
        }
      });
    }
  }, []);
  
  const fetchNews = async () => {
    setLoading(true);
    try {
      const newsItems = await getAllNews();
      
      const newsWithScores = await Promise.all(
        newsItems.map(async (item) => {
          try {
            const ipfsData = await getFromIPFS(item.ipfsHash);
            return {
              ...item,
              verificationScore: ipfsData.verificationScore || 0.5,
            };
          } catch (error) {
            console.error("Error fetching IPFS data:", error);
            return {
              ...item,
              verificationScore: 0.5,
            };
          }
        })
      );
      
      const sortedNews = newsWithScores.sort((a, b) => b.timestamp - a.timestamp);
      setNews(sortedNews);
    } catch (error) {
      console.error("Error fetching news:", error);
      toast({
        title: "Failed to load news",
        description: "There was an error loading the latest news",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handlePublishSuccess = () => {
    setShowForm(false);
    fetchNews();
  };

  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="pt-24 pb-16">
        <section className="container-content">
          <div className="text-center mb-12 space-y-4 animate-in fadeIn" style={{ "--index": 0 } as React.CSSProperties}>
            <h1 className="font-bold">Uncover the Truth</h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              A decentralized news platform where truth is verified by AI and preserved immutably on the blockchain
            </p>
            
            <div className="flex justify-center mt-6">
              <Button 
                size="lg" 
                onClick={() => setShowForm(!showForm)}
                className="animate-in slideUp"
                style={{ "--index": 1 } as React.CSSProperties}
              >
                {showForm ? "Cancel" : "Publish News"}
              </Button>
            </div>
          </div>
          
          {showForm && (
            <div className="max-w-3xl mx-auto mb-12 animate-in slideUp">
              <NewsForm onSuccess={handlePublishSuccess} walletAddress={walletAddress} />
            </div>
          )}
          
          <Tabs defaultValue="all" className="w-full animate-in fadeIn" style={{ "--index": 2 } as React.CSSProperties}>
            <div className="flex justify-center mb-8">
              <TabsList>
                <TabsTrigger value="all">All News</TabsTrigger>
                <TabsTrigger value="verified">Verified</TabsTrigger>
                <TabsTrigger value="questionable">Questionable</TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="all" className="mt-0">
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div 
                      key={i} 
                      className="h-64 rounded-lg bg-muted/30 animate-pulse"
                    />
                  ))}
                </div>
              ) : news.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {news.map((item, index) => (
                    <NewsCard 
                      key={item.ipfsHash} 
                      news={item}
                      index={index}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No news published yet. Be the first to share!</p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="verified" className="mt-0">
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3].map((i) => (
                    <div 
                      key={i} 
                      className="h-64 rounded-lg bg-muted/30 animate-pulse"
                    />
                  ))}
                </div>
              ) : news.filter(item => item.verificationScore && item.verificationScore >= 0.7).length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {news
                    .filter(item => item.verificationScore && item.verificationScore >= 0.7)
                    .map((item, index) => (
                      <NewsCard 
                        key={item.ipfsHash} 
                        news={item}
                        index={index} 
                      />
                    ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No verified news available yet.</p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="questionable" className="mt-0">
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3].map((i) => (
                    <div 
                      key={i} 
                      className="h-64 rounded-lg bg-muted/30 animate-pulse"
                    />
                  ))}
                </div>
              ) : news.filter(item => item.verificationScore && item.verificationScore < 0.7).length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {news
                    .filter(item => item.verificationScore && item.verificationScore < 0.7)
                    .map((item, index) => (
                      <NewsCard 
                        key={item.ipfsHash} 
                        news={item}
                        index={index}
                      />
                    ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No questionable news found.</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </section>
      </main>
      
      <footer className="py-6 border-t">
        <div className="container text-center text-sm text-muted-foreground">
          <p>NewsWave — News, verified and preserved on the blockchain</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
