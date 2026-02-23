import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { foodDescription } = await request.json();

        if (!foodDescription || foodDescription.trim().length === 0) {
            return NextResponse.json({ error: 'Please provide a food description' }, { status: 400 });
        }

        const apiKey = process.env.OPENROUTER_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: 'AI service not configured' }, { status: 500 });
        }

        const systemPrompt = `You are a Bangladeshi food nutrition expert. Given a food item name (with optional quantity/weight), estimate its nutritional values. Focus on Bangladeshi/South Asian cuisine — you know the typical ingredients of dishes like biriyani, khichuri, polao, bhuna khichuri, dal, shak, vorta, bhaji, pitha, fuchka, chotpoti, singara, samosa, roshogolla, etc.

IMPORTANT RULES:
- If a quantity is given (e.g. "biriyani 300g" or "2 roti"), calculate for that specific amount.
- If no quantity is given, assume a standard single serving.
- For mixed dishes (like biriyani), estimate the TOTAL average nutrition including all ingredients (rice, meat, oil, spices, etc).
- Always respond with ONLY a valid JSON object, no explanations, no markdown, no extra text.
- Round all numbers to the nearest integer.

Response format (JSON only):
{"foodName":"<clean food name>","calories":<number>,"protein":<number>,"carbs":<number>,"fat":<number>,"servingSize":"<description>"}`;

        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': process.env.NEXTAUTH_URL || 'http://localhost:3000',
                'X-Title': 'FitPulse Fitness Tracker',
            },
            body: JSON.stringify({
                model: 'openai/gpt-oss-120b:free',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: foodDescription },
                ],
                temperature: 0.3,
                max_tokens: 300,
            }),
        });

        if (!response.ok) {
            const errorData = await response.text();
            console.error('OpenRouter error:', errorData);
            return NextResponse.json({ error: 'AI service error. Please try again.' }, { status: 502 });
        }

        const data = await response.json();
        const aiMessage = data.choices?.[0]?.message?.content?.trim();

        if (!aiMessage) {
            return NextResponse.json({ error: 'No response from AI' }, { status: 502 });
        }

        // Parse the JSON response — handle potential markdown wrapping
        let nutrition;
        try {
            // Strip markdown code block if present
            let cleanJson = aiMessage;
            if (cleanJson.startsWith('```')) {
                cleanJson = cleanJson.replace(/```json?\n?/g, '').replace(/```/g, '').trim();
            }
            nutrition = JSON.parse(cleanJson);
        } catch {
            console.error('Failed to parse AI response:', aiMessage);
            return NextResponse.json({ error: 'Could not parse nutrition data. Try being more specific.' }, { status: 422 });
        }

        // Validate the response has required fields
        if (!nutrition.calories && nutrition.calories !== 0) {
            return NextResponse.json({ error: 'Invalid nutrition data returned' }, { status: 422 });
        }

        return NextResponse.json({
            foodName: nutrition.foodName || foodDescription,
            calories: Math.round(Number(nutrition.calories) || 0),
            protein: Math.round(Number(nutrition.protein) || 0),
            carbs: Math.round(Number(nutrition.carbs) || 0),
            fat: Math.round(Number(nutrition.fat) || 0),
            servingSize: nutrition.servingSize || 'Standard serving',
        });
    } catch (error: unknown) {
        console.error('AI nutrition error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
