import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_KEY
});


export async function POST(req) {
  try {
    const { prompt, model } = await req.json();

    const response = await openai.chat.completions.create({
      model: model || 'gpt-4.1', 
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
    });

    return NextResponse.json({ 
      content: response.choices[0].message.content 
    });
  } catch (error) {
    console.error('OpenAI API error:', error);
    
    return NextResponse.json({ 
      error: 'Failed to generate response. Please try again later.' 
    }, { status: 500 });
  }
} 