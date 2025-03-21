import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { NewsItem } from "@/lib/ethereum";
import { formatDate, truncateAddress } from "@/lib/utils";
import { VerificationBadge } from "./VerificationBadge";

interface NewsCardProps {
  news: NewsItem;
  index: number;
}

export function NewsCard({ news, index }: NewsCardProps) {
  return (
    <Link 
      to={`/article/${news.index}`}
      className="block transition-all duration-300 transform hover:-translate-y-1"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <Card className="h-full overflow-hidden border rounded-lg transition-all hover:shadow-md">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start gap-2">
            <h3 className="text-xl font-semibold line-clamp-2">{news.title}</h3>
            {news.verificationScore !== undefined && (
              <VerificationBadge score={news.verificationScore} size="sm" />
            )}
          </div>
        </CardHeader>
        
        <CardContent className="px-6">
          <p className="text-muted-foreground text-sm line-clamp-3">
            This article was uploaded to the blockchain and stored on IPFS, 
            ensuring its authenticity and immutability.
          </p>
        </CardContent>
        
        <CardFooter className="pt-2 pb-4 px-6 flex justify-between text-xs text-muted-foreground">
          <span>By {truncateAddress(news.author)}</span>
          <span>{formatDate(news.timestamp)}</span>
        </CardFooter>
      </Card>
    </Link>
  );
}