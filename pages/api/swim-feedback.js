/**
 * Proxies OpenAI chat for personalised swim coach feedback.
 * API key is sent from the client (user-owned key) and never stored server-side.
 */

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const {
    apiKey,
    language,
    profile,
    session,
    recentSessions,
    combined,
    localInsights,
    badges,
  } = req.body || {};

  if (!apiKey || typeof apiKey !== 'string') {
    return res.status(400).json({ error: 'API key required' });
  }

  if (!session?.metrics) {
    return res.status(400).json({ error: 'Session data required' });
  }

  const systemPrompt = `You are a warm, encouraging swim coach in a personal training app called Aap-SC.
Write in ${language || 'English'}. Be concise, human, and motivating — like a coach who knows the swimmer personally.
Avoid bullet lists. Use 2 short paragraphs max: one personal analysis, one motivational closing.
Reference specific numbers from the data. Do not invent metrics not provided.`;

  const userPrompt = `Swimmer profile: ${profile?.sex || 'unknown'}, age ${profile?.age || 'unknown'}.

Latest session (${session.date}):
- Distance: ${session.metrics.distanceM} m
- Duration: ${session.metrics.durationSec} sec
- Pace: ${session.metrics.paceSecPer100m} sec/100m
- Heart rate: ${session.metrics.avgHeartRate} bpm
- Active calories: ${session.metrics.activeKcal}
- Goal: ${session.metrics.goalM || 'none'} m
- Laps: ${session.metrics.laps}

Recent sessions: ${JSON.stringify(recentSessions || [])}
All-time combined: ${JSON.stringify(combined || {})}
On-device insights already shown: ${JSON.stringify(localInsights || [])}
Badges earned: ${JSON.stringify(badges || [])}

Give personalised coach feedback and motivation.`;

  try {
    const openAiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        max_tokens: 350,
        temperature: 0.8,
      }),
    });

    if (!openAiRes.ok) {
      const errBody = await openAiRes.json().catch(() => ({}));
      const msg = errBody.error?.message || `OpenAI error ${openAiRes.status}`;
      return res.status(502).json({ error: msg });
    }

    const data = await openAiRes.json();
    const content = data.choices?.[0]?.message?.content?.trim();

    if (!content) {
      return res.status(502).json({ error: 'Empty AI response' });
    }

    const parts = content.split(/\n\n+/);
    return res.status(200).json({
      coachMessage: parts[0] || content,
      motivation: parts[1] || '',
      aiEnhanced: true,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'AI request failed' });
  }
}
