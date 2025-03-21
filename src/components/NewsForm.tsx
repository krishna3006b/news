import { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { uploadToIPFS } from "@/lib/ipfs";
import NewsContent from "@/lib/ipfs";
import { uploadNews } from "@/lib/ethereum";
import { verifyNewsContent } from "@/lib/openai";
import { toast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface NewsFormProps {
  onSuccess: () => void;
  walletAddress: string | null;
}

export function NewsForm({ onSuccess, walletAddress }: NewsFormProps) {
  const [title, setTitle] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!walletAddress) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet before submitting news",
        variant: "destructive",
      });
      return;
    }
    
    if (!title.trim() || !content.trim()) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      setCurrentStep("Preparing news content...");
      const newsData: NewsContent = {
        title: title.trim(),
        content: content.trim(),
        author: walletAddress,
        timestamp: Date.now(),
      };
      
      setCurrentStep("Verifying news content with AI...");
      const verificationScore = await verifyNewsContent(newsData);
      
      newsData.verificationScore = verificationScore;
      
      setCurrentStep("Uploading to IPFS...");
      const ipfsHash = await uploadToIPFS(newsData);
      
      setCurrentStep("Recording on blockchain...");
      await uploadNews(ipfsHash, title);
      
      toast({
        title: "News published successfully",
        description: "Your news has been verified and published to the blockchain",
      });
      
      setTitle("");
      setContent("");
      onSuccess();
      
    } catch (error) {
      console.error("Error submitting news:", error);
      toast({
        title: "Publication failed",
        description: error instanceof Error ? error.message : "Failed to publish news",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
      setCurrentStep("");
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Publish News</CardTitle>
        <CardDescription>
          Share news that will be verified by AI and stored immutably on the blockchain
        </CardDescription>
      </CardHeader>
      
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="Enter a descriptive title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isSubmitting}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              placeholder="Describe the news in detail..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[200px]"
              disabled={isSubmitting}
              required
            />
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-between items-center">
          {currentStep && (
            <p className="text-sm text-muted-foreground flex items-center">
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {currentStep}
            </p>
          )}
          
          <Button 
            type="submit" 
            disabled={isSubmitting || !walletAddress}
            className="ml-auto"
          >
            {isSubmitting ? "Publishing..." : "Publish News"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}