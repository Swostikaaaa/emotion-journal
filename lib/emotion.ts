// Keyword-based emotion detection (no external API needed)
// Works for common journaling expressions

type EmotionRule = {
  keywords: string[]
  emotion: string
  weight: number
}

const emotionRules: EmotionRule[] = [
  { keywords: ['happy', 'joy', 'delighted', 'pleased', 'wonderful', 'amazing', 'great day', 'excited', 'thrilled', 'overjoyed'], emotion: 'joy', weight: 2 },
  { keywords: ['sad', 'unhappy', 'down', 'depressed', 'lonely', 'miserable', 'heartbroken', 'gloomy', 'sorrow', 'crying'], emotion: 'sadness', weight: 2 },
  { keywords: ['angry', 'mad', 'furious', 'annoyed', 'irritated', 'frustrated', 'rage', 'upset', 'hate'], emotion: 'anger', weight: 2 },
  { keywords: ['scared', 'afraid', 'fear', 'terrified', 'anxious', 'nervous', 'worried', 'panic', 'dread'], emotion: 'fear', weight: 2 },
  { keywords: ['love', 'adore', 'cherish', 'care', 'affection', 'warm', 'grateful', 'thankful'], emotion: 'love', weight: 2 },
  { keywords: ['surprised', 'shocked', 'astonished', 'amazed', 'unexpected', 'wow', 'oh my'], emotion: 'surprise', weight: 1.5 },
  { keywords: ['good', 'nice', 'fine', 'okay', 'alright', 'not bad', 'decent'], emotion: 'neutral', weight: 0.5 },
]

// Fallback simple polarity using common positive/negative words
const positiveWords = ['good', 'great', 'excellent', 'fantastic', 'awesome', 'love', 'happy', 'joy', 'wonderful', 'amazing', 'pleased', 'excited', 'thrilled', 'grateful']
const negativeWords = ['bad', 'terrible', 'awful', 'horrible', 'sad', 'angry', 'mad', 'frustrated', 'anxious', 'worried', 'scared', 'fear', 'hate', 'lonely', 'miserable']

export async function detectEmotion(text: string): Promise<string> {
  if (!text || text.trim().length < 10) return 'neutral'
  
  const lowerText = text.toLowerCase()
  let scores: Record<string, number> = { joy: 0, sadness: 0, anger: 0, fear: 0, love: 0, surprise: 0, neutral: 0 }
  
  // Apply keyword rules
  for (const rule of emotionRules) {
    for (const keyword of rule.keywords) {
      if (lowerText.includes(keyword)) {
        scores[rule.emotion] += rule.weight
      }
    }
  }
  
  // If no keywords matched, use simple polarity
  if (Object.values(scores).every(v => v === 0)) {
    let positiveCount = 0
    let negativeCount = 0
    for (const word of positiveWords) {
      if (lowerText.includes(word)) positiveCount++
    }
    for (const word of negativeWords) {
      if (lowerText.includes(word)) negativeCount++
    }
    if (positiveCount > negativeCount) return 'joy'
    if (negativeCount > positiveCount) return 'sadness'
    return 'neutral'
  }
  
  // Find the emotion with highest score
  let topEmotion = 'neutral'
  let topScore = 0
  for (const [emotion, score] of Object.entries(scores)) {
    if (score > topScore) {
      topScore = score
      topEmotion = emotion
    }
  }
  return topEmotion
}