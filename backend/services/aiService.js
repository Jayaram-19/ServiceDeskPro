const { GoogleGenerativeAI } = require('@google/generative-ai');
const KnowledgeArticle = require('../models/KnowledgeArticle');

let genAI = null;

const getGenAI = () => {
  if (!genAI && process.env.GEMINI_API_KEY) {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }
  return genAI;
};

/**
 * Classify a ticket using Gemini AI.
 * Returns { category, priority, probableIssue, confidence }
 * Never throws — returns null on failure so ticket creation is never blocked.
 */
const classifyTicket = async (title, description, availableCategories = []) => {
  try {
    const client = getGenAI();
    if (!client) {
      console.warn('[AIService] Gemini API key not configured, skipping classification.');
      return null;
    }

    const model = client.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const categoryList = availableCategories.length > 0
      ? availableCategories.join(', ')
      : 'Hardware, Software, Network, Account/Access, Email, Printer, Other';

    const prompt = `You are an IT helpdesk ticket classifier. Analyze this IT support ticket and return a JSON response.

Ticket Title: "${title}"
Ticket Description: "${description}"

Available categories: ${categoryList}

Respond ONLY with valid JSON in this exact format:
{
  "category": "<one of the available categories>",
  "priority": "<Low|Medium|High|Critical>",
  "probableIssue": "<brief one-sentence description of the most likely root cause>",
  "confidence": <number between 0 and 1>
}

Rules:
- Critical: System down, security breach, affecting many users
- High: Major functionality broken, significant business impact
- Medium: Single user affected, workaround available
- Low: Minor issue, cosmetic, enhancement request

Respond ONLY with JSON, no markdown, no explanation.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();

    // Strip markdown code fences if present
    const jsonText = text.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim();
    const parsed = JSON.parse(jsonText);

    return {
      category: parsed.category || 'Other',
      priority: parsed.priority || 'Medium',
      probableIssue: parsed.probableIssue || 'Unable to determine',
      confidence: Math.min(Math.max(parsed.confidence || 0.5, 0), 1),
      classifiedAt: new Date(),
    };
  } catch (err) {
    console.error('[AIService] classifyTicket error:', err.message);
    return null;
  }
};

/**
 * Find relevant knowledge base articles for a ticket using text similarity.
 * Uses MongoDB full-text search + AI to rank relevance.
 * Returns array of article IDs.
 */
const recommendArticles = async (title, description, organizationId, limit = 5) => {
  try {
    const searchQuery = `${title} ${description}`;

    // Use MongoDB full-text search
    const articles = await KnowledgeArticle.find(
      {
        organization: organizationId,
        status: 'Published',
        $text: { $search: searchQuery },
      },
      { score: { $meta: 'textScore' } }
    )
      .sort({ score: { $meta: 'textScore' } })
      .limit(limit)
      .select('_id title problemDescription symptoms solution tags');

    if (articles.length === 0) return [];

    // If Gemini is available, re-rank using AI for better relevance
    const client = getGenAI();
    if (!client || articles.length <= 1) return articles;

    const model = client.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const articlesForPrompt = articles.map((a, i) => `${i}: ${a.title} — ${a.problemDescription?.substring(0, 100)}`).join('\n');

    const prompt = `Given this IT support ticket:
Title: "${title}"
Description: "${description}"

And these knowledge base articles (index: title — description):
${articlesForPrompt}

Return a JSON array of indices ordered by relevance (most relevant first). Only include articles that are genuinely relevant. Return ONLY a JSON array like [0, 2, 1] with no explanation.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim().replace(/^```json?\n?/, '').replace(/\n?```$/, '').trim();
    const indices = JSON.parse(text);

    if (!Array.isArray(indices)) return articles;
    return indices.filter(i => i >= 0 && i < articles.length).map(i => articles[i]);
  } catch (err) {
    console.error('[AIService] recommendArticles error:', err.message);
    return [];
  }
};

module.exports = { classifyTicket, recommendArticles };
