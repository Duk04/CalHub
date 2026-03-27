import OpenAI from 'openai'
import { getMongolianFoodContext } from './mongolian-foods'
import type { NutritionData } from '@/types'

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const SYSTEM_PROMPT = `You are a nutrition analysis AI with deep expertise in Mongolian cuisine and international foods.

${getMongolianFoodContext()}

When analyzing food images:
1. Identify the dish name in both English and Mongolian (if it is a Mongolian dish)
2. Estimate the portion size visible in the image
3. For Mongolian dishes (бууз, хуушуур, цуйван, банш, хуурга, тавагтай хоол, боодог, хорхог, бантан, пиражок, ааруул, өрөм, гамбир, боорцог, etc.), use the Mongolian food nutrition database above for accurate estimates
4. For countable items (бууз, хуушуур, банш), estimate the count and multiply per-piece values
5. If multiple food items are visible, list each separately in the array
6. Rate your confidence from 0 to 1

Return ONLY a valid JSON array, no markdown, no explanation:
[{
  "foodName": "string (English name)",
  "mongolianName": "string (Mongolian name, if applicable)",
  "servingSize": "string (e.g., '3 ширхэг', '1 bowl', '200g')",
  "quantity": number,
  "calories": number,
  "protein": number,
  "fat": number,
  "carbs": number,
  "fiber": number,
  "confidence": number
}]`

export async function analyzeFood(imageBase64: string, mimeType: string): Promise<NutritionData[]> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    max_tokens: 1000,
    messages: [
      {
        role: 'system',
        content: SYSTEM_PROMPT,
      },
      {
        role: 'user',
        content: [
          {
            type: 'image_url',
            image_url: {
              url: `data:${mimeType};base64,${imageBase64}`,
              detail: 'high',
            },
          },
          {
            type: 'text',
            text: 'Analyze this food image and return the nutrition data as a JSON array.',
          },
        ],
      },
    ],
  })

  const content = response.choices[0]?.message?.content
  if (!content) throw new Error('No response from OpenAI')

  // Strip markdown code blocks if present
  const cleaned = content.replace(/^```(?:json)?\s*/m, '').replace(/\s*```\s*$/m, '').trim()
  const parsed = JSON.parse(cleaned) as NutritionData[]
  return Array.isArray(parsed) ? parsed : [parsed]
}
