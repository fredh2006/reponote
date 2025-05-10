import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.NEXT_PUBLIC_DEEPSEEK_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        "model": "deepseek/deepseek-r1-zero:free",
        "messages": [{
          "role": "user",
          "content": prompt,
          "temperature": 0.2
        }]
      })
    });

    if (!response.ok) {
      throw new Error('Summarization failed');
    }

    const data = await response.json();
    return NextResponse.json({ 
      content: data.choices[0].message.content.trim() 
    });
  } catch (error) {
    console.error('Summarization error:', error);
    return NextResponse.json({ 
      error: 'Failed to summarize content' 
    }, { status: 500 });
  }
} 