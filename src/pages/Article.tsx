import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Header } from "@/components/Header";
import { VerificationBadge } from "@/components/VerificationBadge";
import { getNewsItem } from "@/lib/ethereum";
import { getFromIPFS, NewsContent } from "@/lib/ipfs";
import { formatDate, truncateAddress } from "@/lib/utils";
import { ArrowLeft, ExternalLink, Share2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const Article = () => {
  const { id } = useParams<{ id: string }>();
  const [article, setArticle] = useState<NewsContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [ipfsHash, setIpfsHash] = useState<string>("");
  
  useEffect(() => {
    if (!id) return;
    
    const fetchArticle = async () => {
      setLoading(true);
      try {
        const specificIpfsHash = "QmSFYcPBRfVewbtPsToA8An8gwfB3HXHumZ33EGoccp19W";
        setIpfsHash(specificIpfsHash);
        
        const content = await fetch(`https://ipfs.io/ipfs/${specificIpfsHash}/0`);
        const data = await content.json();
        
        setArticle({
          title: data.title,
          content: data.content,
          author: data.author,
          timestamp: data.timestamp,
          verificationScore: data.verificationScore
        });
      } catch (error) {
        console.error("Error fetching article:", error);
        toast({
          title: "Failed to load article",
          description: "There was an error loading the article",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchArticle();
  }, [id]);
  
  const shareArticle = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: article?.title || "NewsWave Article",
        text: "Check out this verified news article on NewsWave",
        url: url,
      }).catch(err => console.error("Error sharing:", err));
    } else {
      navigator.clipboard.writeText(url).then(() => {
        toast({
          title: "Link copied",
          description: "Article link copied to clipboard",
        });
      });
    }
  };

  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="pt-24 pb-16">
        <div className="container-content">
          <Link 
            to="/" 
            className="inline-flex items-center text-sm mb-8 hover:text-primary transition-colors animate-in fadeIn"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to all news
          </Link>
          
          {loading ? (
            <div className="space-y-4">
              <div className="h-8 w-2/3 bg-muted/30 rounded animate-pulse" />
              <div className="h-4 w-1/4 bg-muted/30 rounded animate-pulse" />
              <div className="h-64 bg-muted/30 rounded-lg animate-pulse mt-6" />
            </div>
          ) : article ? (
            <div className="animate-in fadeIn">
              <div className="flex flex-col gap-4 mb-8">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight">
                  {article.title}
                </h1>
                
                <div className="flex flex-wrap items-center gap-4">
                  <div className="text-muted-foreground">
                    By {truncateAddress(article.author)}
                  </div>
                  
                  <div className="text-muted-foreground">
                    {formatDate(article.timestamp)}
                  </div>
                  
                  {article.verificationScore !== undefined && (
                    <VerificationBadge score={article.verificationScore} />
                  )}
                </div>
              </div>
              
              <Card className="p-6 mb-8 prose prose-neutral dark:prose-invert max-w-none">
                <div className="whitespace-pre-line">
                  {article.content}
                </div>
              </Card>
              
              <div className="rounded-lg border p-6 bg-card">
                <h3 className="text-lg font-semibold mb-4">Verification Details</h3>
                
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium mb-1">Content Hash (IPFS)</p>
                    <div className="flex items-center gap-2">
                      <code className="bg-muted px-2 py-1 rounded text-sm font-mono break-all">
                        {ipfsHash}
                      </code>
                      <a 
                        href={`https://ipfs.io/ipfs/${ipfsHash}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:text-primary/80"
                        title="View on IPFS"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium mb-1">Verification Score</p>
                    <p>
                      {article.verificationScore !== undefined ? (
                        <VerificationBadge 
                          score={article.verificationScore} 
                          size="lg"
                        />
                      ) : (
                        "Not verified"
                      )}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium mb-1">Timestamp</p>
                    <p>{formatDate(article.timestamp)}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium mb-1">Author Address</p>
                    <code className="bg-muted px-2 py-1 rounded text-sm font-mono">
                      {article.author}
                    </code>
                  </div>
                </div>
                
                <Separator className="my-6" />
                
                <div className="flex flex-wrap gap-2">
                  <Button onClick={shareArticle} variant="outline" size="sm" className="flex items-center gap-2">
                    <Share2 className="w-4 h-4" />
                    Share
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold mb-2">Article Not Found</h2>
              <p className="text-muted-foreground mb-6">The article you're looking for doesn't exist or couldn't be loaded.</p>
              <Button asChild>
                <Link to="/">Return to Home</Link>
              </Button>
            </div>
          )}
        </div>
      </main>
      
      <footer className="py-6 border-t">
        <div className="container text-center text-sm text-muted-foreground">
          <p>VerifyVault — Truth, verified and preserved on the blockchain</p>
        </div>
      </footer>
    </div>
  );
};

export default Article;