
import  {NewsContent}  from "@/lib/ipfs";

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY || "your-openai-api-key";

export async function verifyNewsContent(newsContent: NewsContent): Promise<number> {
  try {
    const prompt = `
      I need to assess the credibility of this news article.
      Title: "${newsContent.title}"
      Content: "${newsContent.content}"
      
      Based on the information provided, rate the credibility of this article from 0 to 1,
      where 0 means completely false and 1 means completely credible.
      
      Your response should be a single number between 0 and 1, representing the credibility score.
    `;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are an AI assistant that assesses the credibility of news articles. Your job is to return a single number between 0 and 1 that represents the credibility score."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.1
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error("OpenAI API error:", data);
      throw new Error("Failed to verify news content");
    }

    const result = data.choices[0].message.content.trim();
    const score = parseFloat(result);
    
    if (isNaN(score) || score < 0 || score > 1) {
      console.error("Invalid score from OpenAI:", result);
      return 0.5; 
    }

    return score;
  } catch (error) {
    console.error("Error verifying news content:", error);
    throw new Error("Failed to verify news content");
  }
}
