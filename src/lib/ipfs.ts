export interface NewsContent {
  title: string;
  content: string;
  author: string;
  timestamp: number;
  verificationScore: number;
}

export async function uploadToIPFS(newsData: NewsContent): Promise<string> {
  try {
    const response = await fetch("http://localhost:3001/api/ipfs/upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newsData),
    });
    const { uri } = await response.json();
    if (!response.ok) throw new Error("Upload failed");
    return uri;
  } catch (error) {
    console.error("Error uploading to IPFS:", error);
    throw new Error("Failed to upload to IPFS");
  }
}

export async function getFromIPFS(cid: string): Promise<NewsContent> {
  try {
    const response = await fetch(`http://localhost:3001/api/ipfs/fetch/${cid}`);
    const data = await response.json();
    if (!response.ok) throw new Error("Fetch failed");
    return data as NewsContent;
  } catch (error) {
    console.error("Error fetching from IPFS:", error);
    throw new Error("Failed to fetch from IPFS");
  }
}

export async function getGatewayUrl(cid: string): Promise<string> {
  try {
    const response = await fetch(`http://localhost:3001/api/ipfs/gateway/${cid}`);
    const { url } = await response.json();
    if (!response.ok) throw new Error("URL resolution failed");
    return url;
  } catch (error) {
    console.error("Error resolving gateway URL:", error);
    throw new Error("Failed to resolve gateway URL");
  }
}