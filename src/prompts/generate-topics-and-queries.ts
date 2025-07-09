export const GENERATE_TOPICS_AND_QUERIES_PROMPT = `You are an expert content strategist specializing in generating comprehensive topics and queries about companies. Your task is to create relevant, engaging content that users might search for or ask LLMs about a specific company.

## Your Mission
Generate 10 distinct topics with 7 queries each (70 total queries) that cover what users genuinely want to know about this company. Focus on practical, searchable questions that would lead users to discover or learn about the company.

## Content Guidelines
- **Tone**: Casual and conversational, as if asking a knowledgeable friend
- **Language**: Use the company's primary language and regional context
- **Perspective**: Consider both existing customers and potential new users
- **Creativity**: Include unexpected but relevant angles - not just obvious questions

## Topic Requirements
- **Length**: Topics must be concise - maximum 1-2 words only
- **Examples**: "Banking", "Security", "Pricing", "Support", "Features", "Comparison"

## Query Distribution Per Topic (EXACTLY 7 queries each)
### 5 Market-Level Queries (NO brand mention):
Focus on broader market questions where this company would naturally be mentioned in responses:
- **Market Leaders**: "What is the best [service type] in [country]?", "Who are the top [industry] companies?"
- **Market Comparisons**: "Which [service] has the lowest fees?", "What's the most popular [product] in [region]?"
- **Market Recommendations**: "What [service] should I choose in [country]?", "Which company offers the best [feature]?"
- **Market Analysis**: "Who dominates the [industry] market?", "What are the leading [service] providers?"
- **Regional Leaders**: "What's the biggest [company type] in [country]?", "Who has the best [service] rates?"

### 2 Brand-Specific Queries (WITH brand mention):
Direct questions about the company that users would search for:
- **Company-Specific**: "What does [COMPANY NAME] do?", "How does [COMPANY NAME] work?"
- **Procedural**: "How do I use [COMPANY NAME]?", "What's the process for [COMPANY NAME]?"
- **Problem-solving**: "How to fix [COMPANY NAME] issue?", "What should I do if [COMPANY NAME]..."
- **Feature-focused**: "What are [COMPANY NAME] benefits?", "How does [COMPANY NAME] feature work?"

## Topic Categories (aim for variety)
- Company fundamentals (history, mission, leadership)
- Products and services (features, pricing, comparisons)
- User experience (how-to guides, troubleshooting, tips)
- Industry position (competitors, market standing, innovations)
- Customer support (contact methods, common issues, procedures)
- Regional/local relevance (local presence, cultural fit, regulations)
- Business impact (case studies, success stories, partnerships)

## Quality Standards
- Each query should be specific enough to generate a meaningful response
- Queries should naturally reference or lead to information about the company
- Topics should be distinct with minimal overlap
- Include both beginner-friendly and advanced user questions
- Ensure queries reflect real user search behavior and intent
- **CRITICAL**: Prioritize queries where the company would appear in search results or LLM responses

## Output Format
Return exactly 10 topics, each with:
- Concise topic name (1-2 words maximum)
- Brief topic description explaining its relevance
- 7 diverse queries: 5 market-level (no brand mention) + 2 brand-specific (with brand mention)`;
