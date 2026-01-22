import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

interface FeedbackRequest {
  prompt_text: string;
  prompt_type: string;
  target_tone?: string;
  user_input: string;
}

interface Feedback {
  score: number;
  tone_label: string;
  rewrites: string[];
  mistakes: string[];
  explanation: string;
}

// Fallback feedback when OpenAI is not available
function generateFallbackFeedback(input: string, promptType: string, targetTone?: string): Feedback {
  const wordCount = input.split(/\s+/).filter(w => w.length > 0).length;
  const hasGreeting = /^(hi|hello|hey|dear)/i.test(input);
  const hasPoliteness = /(please|thank|kindly|appreciate|would you)/i.test(input);
  const hasUrgency = /(asap|urgent|immediately|now)/i.test(input);

  let score = 60;
  const mistakes: string[] = [];
  const rewrites: string[] = [];

  // Basic scoring
  if (wordCount < 5) {
    score -= 10;
    mistakes.push('Response is quite short. Consider adding more detail.');
  }
  if (wordCount > 100) {
    score -= 5;
    mistakes.push('Response is lengthy. Consider being more concise.');
  }
  if (hasPoliteness) {
    score += 10;
  } else {
    mistakes.push('Adding polite language like "please" or "thank you" can improve professionalism.');
  }
  if (hasUrgency && targetTone === 'polite') {
    score -= 10;
    mistakes.push('Urgent language may come across as demanding in a polite context.');
  }

  // Generate simple rewrites
  let rewrite = input;

  if (!hasGreeting && promptType === 'rewrite') {
    rewrite = 'Hi, ' + rewrite;
  }
  if (!hasPoliteness) {
    rewrite = rewrite.replace(/\.$/, '') + ', please.';
  }

  rewrites.push(rewrite);

  // Add alternative if response is decent
  if (score >= 60) {
    rewrites.push('Thank you for your time. ' + input);
  }

  score = Math.min(100, Math.max(0, score));

  let toneLabel = 'neutral';
  if (hasPoliteness && hasGreeting) toneLabel = 'polite';
  if (hasUrgency) toneLabel = 'direct';
  if (targetTone) toneLabel = targetTone;

  return {
    score,
    tone_label: toneLabel,
    rewrites,
    mistakes,
    explanation: 'This is automated feedback. For more detailed AI analysis, ensure OPENAI_API_KEY is configured.'
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: FeedbackRequest = await request.json();
    const { prompt_text, prompt_type, target_tone, user_input } = body;

    if (!user_input || !prompt_text) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const openaiKey = process.env.OPENAI_API_KEY;

    // If no OpenAI key, use fallback
    if (!openaiKey) {
      const feedback = generateFallbackFeedback(user_input, prompt_type, target_tone);
      return NextResponse.json(feedback);
    }

    // Use OpenAI for feedback
    const openai = new OpenAI({ apiKey: openaiKey });

    const systemPrompt = `You are an expert business communication coach helping non-native English speakers write more naturally and professionally at work.

Analyze the user's response to a writing prompt and provide feedback in JSON format with these fields:
- score: number 0-100 (be fair but constructive)
- tone_label: string (one of: polite, neutral, direct, confident, casual, formal)
- rewrites: array of 3-5 improved versions of their text
- mistakes: array of specific issues found (grammar, tone, clarity, professionalism)
- explanation: 1-2 sentence overall assessment

Be encouraging but honest. Focus on practical improvements for workplace communication.`;

    const userPrompt = `Prompt given to user:
${prompt_text}

${target_tone ? `Target tone: ${target_tone}` : ''}
Prompt type: ${prompt_type}

User's response:
${user_input}

Provide feedback in JSON format.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
      max_tokens: 1000
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from OpenAI');
    }

    const feedback = JSON.parse(content) as Feedback;

    // Ensure required fields exist
    return NextResponse.json({
      score: feedback.score ?? 50,
      tone_label: feedback.tone_label ?? 'neutral',
      rewrites: feedback.rewrites ?? [],
      mistakes: feedback.mistakes ?? [],
      explanation: feedback.explanation ?? 'Feedback generated successfully.'
    });

  } catch (error) {
    console.error('Feedback API error:', error);

    // Return fallback on any error
    return NextResponse.json({
      score: 50,
      tone_label: 'neutral',
      rewrites: ['Consider revising your response for clarity.'],
      mistakes: ['Unable to analyze in detail at this time.'],
      explanation: 'An error occurred during analysis. Please try again.'
    });
  }
}
