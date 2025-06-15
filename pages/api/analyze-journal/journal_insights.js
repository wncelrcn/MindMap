// pages/api/analyze-journal/journal_insights.js
import { createClient } from '@/utils/supabase/server-props';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId, journalId, journalType, forceRegenerate = false } = req.body;

    if (!userId || !journalId || !journalType) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    // Create Supabase client
    const supabase = createClient({ req, res });

    // First, check if insights already exist
    const { data: existingInsights, error: fetchError } = await supabase
      .from('insights')
      .select('*')  // Select all fields instead of just insight_id
      .eq('journal_id', journalId)
      .eq('journal_type', journalType)
      .single();

    // If insights exist and we're not forcing regeneration, return them
    if (existingInsights && !forceRegenerate) {
      console.log('Found existing insights, returning...');
      return res.status(200).json({ insights: existingInsights });
    }

    // If we get here, either there are no existing insights or we're forcing regeneration
    // Fetch journal entry content
    let journalContent = '';
    let journalMetadata = {};

    if (journalType === 'freeform') {
      const { data: freeformEntry, error: freeformError } = await supabase
          .from('freeform_journaling_table')
          .select('*')
          .eq('journal_id', journalId)
          .single();

      if (freeformError) {
          console.error('Error fetching freeform journal:', freeformError);
          return res.status(500).json({ error: 'Failed to fetch journal entry' });
      }

      // Update this part to match your database structure
      journalContent = freeformEntry.journal_entry?.default || freeformEntry.journal_entry;
      journalMetadata = {
          created_at: freeformEntry.date_created,
          mood: freeformEntry.mood,
          tags: freeformEntry.tags || []
      };
      } else if (journalType === 'guided') {
      const { data: guidedEntry, error: guidedError } = await supabase
          .from('guided_journaling_table')
          .select('*')
          .eq('journal_id', journalId)
          .single();

      if (guidedError) {
          console.error('Error fetching guided journal:', guidedError);
          return res.status(500).json({ error: 'Failed to fetch journal entry' });
      }

      // Update guided journal content extraction
      const entries = Array.isArray(guidedEntry.journal_entry) 
          ? guidedEntry.journal_entry 
          : [];
          
      journalContent = entries
          .map(entry => `${entry.question}\n${entry.answer}`)
          .join('\n\n');
      
      journalMetadata = {
          created_at: guidedEntry.date_created,
          prompts_answered: entries.length,
          session_type: 'guided'
      };
      }

    if (!journalContent) {
      return res.status(400).json({ error: 'No journal content found' });
    }

    // Generate insights using OpenRouter API
    const insights = await generateInsights(journalContent, journalType, journalMetadata);

    // Store insights in database
    const insightsData = {
      journal_id: journalId,
      journal_type: journalType,
      user_id: userId,
      header_insights: insights.header_insights,
      wellbeing_insights: insights.wellbeing_insights,
      coping_strategies: insights.coping_strategies,
      goals: insights.goals,
      emotional_data: insights.emotional_data,
      journal_metadata: journalMetadata
    };

    let result;
    try {
      if (existingInsights) {
        // Update existing record
        const { data, error: updateError } = await supabase
          .from('insights')
          .update(insightsData)
          .eq('journal_id', journalId)
          .eq('journal_type', journalType)
          .select()
          .single();

        if (updateError) throw updateError;
        result = data;
      } else {
        // Insert new record
        const { data, error: insertError } = await supabase
          .from('insights')
          .insert(insightsData)
          .select()
          .single();

        if (insertError) {
          // If insert fails due to concurrent insert, try fetching existing record
          if (insertError.code === '23505') {
            const { data: existingData } = await supabase
              .from('insights')
              .select('*')
              .eq('journal_id', journalId)
              .eq('journal_type', journalType)
              .single();
            
            result = existingData;
          } else {
            throw insertError;
          }
        } else {
          result = data;
        }
      }

      return res.status(200).json({ insights: result });

    } catch (dbError) {
      console.error('Database operation error:', dbError);
      throw new Error('Failed to save or retrieve insights');
    }

  } catch (error) {
    console.error('Error in journal insights API:', error);
    return res.status(500).json({ 
      error: error.message || 'Internal server error',
      details: error.details || null
    });
  }
}

async function generateInsights(journalContent, journalType, metadata) {
  const prompt = `You are a thoughtful and empathetic therapist assisting users with emotional reflection through AI-assisted journaling. Your task is to analyze journal entries and generate meaningful insights that encourage self-awareness, personal growth, and well-being.

The journal is about ${journalType}.

Journal Entry:
${journalContent}

Journal Type: ${journalType}
Entry Date: ${metadata.created_at}
${journalType === 'freeform' ? `Mood: ${metadata.mood || 'Not specified'}` : `Session Type: ${metadata.session_type}`}

Please analyze the journal entry and provide supportive insights based on the following focus areas:
1. Emotional patterns and moments of resilience
2. Signs of personal growth or values alignment
3. Coping strategies used or needed
4. Opportunities for meaningful goal setting
5. Overall emotional well-being snapshot

If the journal entry is brief or lacks emotional detail, **still offer thoughtful insights** without labeling it as lacking. Instead, gently focus on possibilities, strengths, or questions to reflect on. Avoid judgmental or evaluative tone.

Maintain these important stylistic and ethical guidelines:
- Use second-person point of view ("you", "your")
- Begin with “The journal is about…” in your analysis
- Do not use “the user”, “they”, “their”, “I”, “me”, “mine”, or similar terms
- Make all insights sound empathetic, encouraging, and human-centered
- Always provide helpful feedback, even when content is vague
- Keep “growth_indicator” to just **1-2 meaningful words**

Now generate a complete response in the exact JSON format below:

{
  "header_insights": {
    "resilience_insight": "A personalized insight about your resilience or gratitude moments (100-150 words)",
    "primary_motivation": "A single key motivational word or short phrase",
    "growth_indicator": "A short phrase or 1-2 words highlighting a personal growth theme",
    "emotional_tone": "A personalized observation about your emotional patterns (100-150 words)"
  },
  "wellbeing_insights": {
    "main_observation": "Main insight about your current emotional well-being (150-200 words)",
    "actionable_advice": [
      {
        "title": "Advice Title 1",
        "description": "Personalized, actionable advice to support your well-being (80-120 words)"
      },
      {
        "title": "Advice Title 2",
        "description": "Another useful, encouraging suggestion tailored to your reflections (80-120 words)"
      }
    ]
  },
  "coping_strategies": {
    "main_observation": "An insight into how you're coping or could better cope (150-200 words)",
    "recommended_strategies": [
      {
        "title": "Strategy Title 1",
        "description": "Empathetic suggestion of a practical coping method (80-120 words)"
      },
      {
        "title": "Strategy Title 2",
        "description": "Another strategy to support your emotional resilience (80-120 words)"
      }
    ]
  },
  "goals": {
    "main_observation": "What goals might support your well-being based on your reflections (150-200 words)",
    "suggested_goals": [
      {
        "title": "Goal Title 1",
        "description": "A practical and supportive goal to encourage progress (80-120 words)"
      },
      {
        "title": "Goal Title 2",
        "description": "Another relevant and gentle goal suggestion (80-120 words)"
      }
    ]
  },
  "emotional_data": {
    "dominant_emotions": ["emotion1", "emotion2", "emotion3"],
    "emotional_intensity": "low/medium/high",
    "growth_areas": ["area1", "area2"],
    "strengths": ["strength1", "strength2"]
  }
}

Ensure that the response is empathetic, self-reflective, and empowering. Do not be overly clinical. Support emotional exploration and personal insight in a caring and accessible tone.`;


  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'X-Title': 'Journal Insights App'
      },
      body: JSON.stringify({
        model: "meta-llama/llama-3.3-8b-instruct:free",
        messages: [
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      })
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.status}`);
    }

    const data = await response.json();
    const insightsText = data.choices[0].message.content;

    // Clean and parse the response
    try {
      // First attempt: direct parse
      const cleanedText = insightsText.trim();
      const parsedInsights = JSON.parse(cleanedText);
      
      // Validate the required structure
      if (!parsedInsights.header_insights || !parsedInsights.wellbeing_insights) {
        console.error('Invalid insights structure:', parsedInsights);
        throw new Error('Invalid insights structure');
      }
      
      return parsedInsights;

    } catch (parseError) {
      console.error('Initial parse error:', parseError);
      console.log('Raw insights text:', insightsText);
      
      // Second attempt: try to extract JSON if wrapped in other text
      const jsonMatch = insightsText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const extractedJson = JSON.parse(jsonMatch[0]);
        if (extractedJson.header_insights && extractedJson.wellbeing_insights) {
          return extractedJson;
        }
      }
      
      throw parseError;
    }

  } catch (error) {
    console.error('Error in insights generation:', error);
    return getFallbackInsights();
  }
}

function getFallbackInsights() {
  return {
    header_insights: {
      resilience_insight: "Your journal entries show a thoughtful approach to processing experiences and emotions, demonstrating your commitment to personal growth and self-reflection.",
      primary_motivation: "self-improvement",
      growth_indicator: "mindful reflection",
      emotional_tone: "Your writing reveals a balanced emotional perspective, with awareness of both challenges and positive moments in your daily life."
    },
    wellbeing_insights: {
      main_observation: "Based on your journal entry, you demonstrate good emotional awareness and a proactive approach to managing your daily experiences. This mindful approach to journaling itself shows a commitment to your mental well-being.",
      actionable_advice: [
        {
          title: "Continue Regular Reflection",
          description: "Your practice of regular journaling is valuable for emotional processing. Consider setting aside a specific time each day for this reflective practice to maintain consistency."
        },
        {
          title: "Celebrate Small Wins",
          description: "Make sure to acknowledge and celebrate small positive moments and achievements in your daily life, as these contribute significantly to overall well-being."
        }
      ]
    },
    coping_strategies: {
      main_observation: "Your journal writing demonstrates that you're actively working through your experiences and emotions, which is a healthy coping mechanism in itself.",
      recommended_strategies: [
        {
          title: "Mindful Breathing",
          description: "When facing challenging moments, try incorporating brief mindful breathing exercises to help center yourself and gain clarity before responding to situations."
        },
        {
          title: "Gratitude Practice",
          description: "Consider ending each journal entry with three things you're grateful for, no matter how small, to help maintain a balanced perspective during difficult times."
        }
      ]
    },
    goals: {
      main_observation: "Your commitment to journaling shows a desire for personal growth and self-understanding, which forms a strong foundation for setting and achieving meaningful goals.",
      suggested_goals: [
        {
          title: "Emotional Awareness",
          description: "Continue developing your ability to identify and name your emotions as they arise, which will help you respond more thoughtfully to various situations."
        },
        {
          title: "Consistent Self-Care",
          description: "Establish a regular self-care routine that includes activities that bring you joy and help you recharge, making this as important as other daily responsibilities."
        }
      ]
    },
    emotional_data: {
      dominant_emotions: ["reflective", "hopeful", "thoughtful"],
      emotional_intensity: "medium",
      growth_areas: ["self-compassion", "stress management"],
      strengths: ["self-awareness", "commitment to growth"]
    }
  };
}