import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const HOST = "0.0.0.0";
const AI_TIMEOUT_MS = 45000;
const isProduction =
  process.env.NODE_ENV === "production" ||
  process.argv[1]?.includes(`${path.sep}dist${path.sep}`);
const shouldRetryPort = !process.env.PORT;

app.use(express.json());

// Shared Gemini client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

interface DeckContext {
  idea: string;
  industry: string;
  audience: string;
  stage: string;
  templateId?: string;
}

// API Routes
app.post("/api/generate-deck", async (req, res) => {
  const { idea, industry, audience, stage, templateId } = req.body;

  try {
    if (!idea || !industry || !audience || !stage) {
      return res.status(400).json({ error: "Please fill all required fields." });
    }

    const prompt = `Generate a high-impact, professional, and data-driven 10-slide pitch deck for:
    Idea: ${idea}
    Industry: ${industry}
    Stage: ${stage}
    Target Investors: ${audience}
    Visual Style: ${getTemplateGuidance(templateId)}

    Include following slides:
    1. Cover: Striking title and value proposition.
    2. Problem: 3-4 core pain points with quantitative context.
    3. Solution: Detailed product features (3-4 points) and unique value add.
    4. Market: TAM/SAM/SOM calculation details and growth trends (include visualData for a chart).
    5. Revenue Model: Specific revenue streams and pricing strategy.
    6. Competition: Detailed comparison points against top 3 competitors.
    7. Go-to-Market: Multi-channel strategy with specific tactics.
    8. Financials: 3-year growth projections and key metrics (CAC, LTV, Margin).
    9. Team: Founding team profiles (invented) with relevant achievements.
    10. The Ask: Specific funding amount, use of funds breakdown, and milestones.

    For each slide:
    - Provide 6-8 extremely detailed, professional, and data-driven bullet points in "content". Each point should be a substantial sentence or two that provides deep insight.
    - At least 5 slides MUST include "visualData" with a chartType (pie, bar, area, line) and 5-6 realistic data points.
    - Provide a high-quality "imagePrompt" for a photorealistic professional image.
    - Provide a "speakerScript" (5-6 sentences of persuasive, high-impact narrative specifically designed for a jury presentation).
    - Invent a creative "startupName" if not provided.
    - Provide realistic data for the "investorScore" and exactly 5 "competitors".
    - Identify 5 specific "targetInvestors" profiles or actual firms.`;

    const response = await withTimeout(
      ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              startupName: { type: Type.STRING },
              slides: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    type: { type: Type.STRING },
                    title: { type: Type.STRING },
                    subtitle: { type: Type.STRING },
                    content: { type: Type.ARRAY, items: { type: Type.STRING } },
                    speakerScript: { type: Type.STRING, description: "A detailed presentation script for the jury" },
                    visualData: { 
                      type: Type.OBJECT,
                      properties: {
                        chartType: { type: Type.STRING, description: "e.g., pie, bar, line" },
                        data: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, value: { type: Type.NUMBER } } } }
                      }
                    },
                    imagePrompt: { type: Type.STRING, description: "A high-quality image prompt for AI generation" }
                  },
                  required: ["type", "title", "subtitle", "content", "imagePrompt", "speakerScript"]
                }
              },
              investorScore: {
                type: Type.OBJECT,
                properties: {
                  clarity: { type: Type.NUMBER },
                  scalability: { type: Type.NUMBER },
                  market: { type: Type.NUMBER },
                  innovation: { type: Type.NUMBER },
                  revenue: { type: Type.NUMBER }
                }
              },
              targetInvestors: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "A list of 3-4 specific investor types or actual firm examples appropriate for this startup"
              },
              competitors: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    differentiator: { type: Type.STRING },
                    strength: { type: Type.STRING },
                    weakness: { type: Type.STRING }
                  }
                }
              }
            },
            required: ["startupName", "slides", "investorScore", "targetInvestors", "competitors"]
          }
        }
      }),
      AI_TIMEOUT_MS
    );

    const text = response.text;
    if (!text) {
      throw new Error("AI returned an empty response.");
    }

    res.json(enhanceDeck(JSON.parse(text), { idea, industry, audience, stage, templateId }));
  } catch (error) {
    console.error("AI Generation Error:", error);
    res.json(enhanceDeck(buildFallbackDeck({ idea, industry, audience, stage }), { idea, industry, audience, stage, templateId }));
  }
});

function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error(`AI generation timed out after ${Math.round(timeoutMs / 1000)} seconds.`));
    }, timeoutMs);

    promise
      .then(resolve)
      .catch(reject)
      .finally(() => clearTimeout(timeout));
  });
}

function enhanceDeck(deck: any, context: DeckContext) {
  const slides = Array.isArray(deck.slides) ? deck.slides : [];
  const chartTypes = ["bar", "line", "pie", "area", "bar"];
  const chartSlideTypes = new Set(["market", "model", "competition", "strategy", "financials"]);

  return {
    ...deck,
    slides: slides.map((slide: any, index: number) => {
      const normalizedType = normalizeSlideType(slide.type, index);
      const shouldHaveChart = chartSlideTypes.has(normalizedType) || (index >= 3 && index <= 7);

      return {
        ...slide,
        type: normalizedType,
        imagePrompt: makeImagePrompt(slide, context, index),
        visualData: shouldHaveChart
          ? makeVisualData(normalizedType, chartTypes[(index - 3 + chartTypes.length) % chartTypes.length], context)
          : undefined,
      };
    }),
  };
}

function getSlideTypeByIndex(index: number) {
  return ["cover", "problem", "solution", "market", "model", "competition", "strategy", "financials", "team", "ask"][index] || "cover";
}

function normalizeSlideType(type: string | undefined, index: number) {
  const value = String(type || getSlideTypeByIndex(index)).toLowerCase();

  if (value.includes("cover") || value.includes("summary")) return "cover";
  if (value.includes("problem")) return "problem";
  if (value.includes("solution") || value.includes("product")) return "solution";
  if (value.includes("market") || value.includes("tam")) return "market";
  if (value.includes("model") || value.includes("revenue")) return "model";
  if (value.includes("compet")) return "competition";
  if (value.includes("go-to") || value.includes("strategy") || value.includes("launch")) return "strategy";
  if (value.includes("financial") || value.includes("projection")) return "financials";
  if (value.includes("team")) return "team";
  if (value.includes("ask") || value.includes("fund")) return "ask";

  return getSlideTypeByIndex(index);
}

function getTemplateGuidance(templateId?: string) {
  const guidance: Record<string, string> = {
    aurora: "cinematic dark investor deck, teal highlights, premium startup studio lighting",
    minimal: "clean white modern consulting deck, spacious layouts, restrained blue and green accents",
    venture: "bold high-contrast startup pitch, energetic orange and rose accents, confident founder tone",
    editorial: "editorial magazine-inspired pitch, warm paper tones, black typography, sharp red accents",
    midnight: "premium AI/data product deck, deep navy, cyan glow, technical dashboard aesthetic",
    summit: "calm sustainability and impact deck, fresh greens, natural light, executive clarity",
  };

  return guidance[templateId || "aurora"] || guidance.aurora;
}

function makeImagePrompt(slide: any, context: DeckContext, index: number) {
  const type = normalizeSlideType(slide.type, index);
  const title = slide.title || getSlideTypeByIndex(index);
  const visualSubjects: Record<string, string> = {
    cover: `confident startup founder presenting ${context.idea} on a modern stage`,
    problem: `real customers experiencing the main pain point in ${context.industry}`,
    solution: `clean product dashboard showing the ${context.idea} solution in use`,
    market: `${context.industry} market growth shown through a busy professional ecosystem`,
    model: `business team reviewing subscription revenue and pricing strategy`,
    competition: `strategy room with competitor analysis boards and product positioning`,
    strategy: `startup growth team planning launch channels and customer acquisition`,
    financials: `finance dashboard with revenue projections and growth metrics`,
    team: `diverse founding team collaborating in a modern startup workspace`,
    ask: `founder pitching to investors in a polished meeting room`,
  };

  return [
    `Photorealistic professional image for a startup pitch deck slide.`,
    `Slide topic: ${title}.`,
    `Scene: ${visualSubjects[type] || `${context.industry} startup team working on ${context.idea}`}.`,
    `Industry: ${context.industry}. Stage: ${context.stage}. Audience: ${context.audience}.`,
    `Visual treatment: ${getTemplateGuidance(context.templateId)}.`,
    `Modern cinematic lighting, realistic people or product environment, high detail, no text, no logos, no watermarks, no charts.`,
  ].join(" ");
}

function makeVisualData(type: string, chartType: string, context: { industry: string }) {
  const chartBySlide: Record<string, any> = {
    market: {
      chartType: "bar",
      data: [
        { name: "TAM", value: 120 },
        { name: "SAM", value: 58 },
        { name: "SOM", value: 16 },
        { name: "Initial", value: 5 },
      ],
    },
    model: {
      chartType: "pie",
      data: [
        { name: "Subscriptions", value: 52 },
        { name: "Enterprise", value: 28 },
        { name: "Services", value: 12 },
        { name: "Partners", value: 8 },
      ],
    },
    competition: {
      chartType: "bar",
      data: [
        { name: "Speed", value: 88 },
        { name: "Cost", value: 74 },
        { name: "UX", value: 91 },
        { name: "AI", value: 96 },
      ],
    },
    strategy: {
      chartType: "line",
      data: [
        { name: "M1", value: 12 },
        { name: "M2", value: 29 },
        { name: "M3", value: 48 },
        { name: "M4", value: 73 },
        { name: "M5", value: 105 },
      ],
    },
    financials: {
      chartType: "area",
      data: [
        { name: "Y1", value: 24 },
        { name: "Y2", value: 68 },
        { name: "Y3", value: 145 },
        { name: "Y4", value: 260 },
      ],
    },
  };

  return chartBySlide[type] || {
    chartType,
    data: [
      { name: context.industry.slice(0, 4), value: 35 },
      { name: "Growth", value: 62 },
      { name: "Users", value: 84 },
      { name: "Revenue", value: 108 },
    ],
  };
}

function buildFallbackDeck({
  idea,
  industry,
  audience,
  stage,
}: {
  idea: string;
  industry: string;
  audience: string;
  stage: string;
}) {
  const startupName = makeStartupName(idea, industry);
  const baseImagePrompt = `Professional ${industry} startup team presenting ${idea}`;
  const slides = [
    {
      type: "cover",
      title: startupName,
      subtitle: `${industry} startup built for ${audience}`,
      content: [
        `${startupName} is focused on solving a clear problem in the ${industry} space.`,
        `The company is currently at the ${stage} stage and is preparing for investor conversations.`,
        `The solution is designed to be simple, scalable, and useful for a focused customer segment.`,
      ],
    },
    {
      type: "problem",
      title: "Problem",
      subtitle: "Customers need a faster and smarter solution",
      content: [
        `Current solutions in ${industry} are often slow, expensive, or difficult to use.`,
        "Users need better automation, clearer insights, and a smoother workflow.",
        "This creates an opportunity for a focused startup with a better product experience.",
      ],
    },
    {
      type: "solution",
      title: "Solution",
      subtitle: idea,
      content: [
        `${startupName} provides a practical solution based on the user idea: ${idea}.`,
        "The product reduces manual effort and helps users complete important work faster.",
        "The platform can improve over time using feedback, data, and automation.",
      ],
    },
    {
      type: "market",
      title: "Market Opportunity",
      subtitle: `${industry} has strong digital adoption potential`,
      content: [
        `The ${industry} market is growing as more customers adopt digital tools.`,
        "The initial focus is a reachable niche where early users can be acquired quickly.",
        "After validation, the same solution can expand into adjacent customer segments.",
      ],
      visualData: {
        chartType: "bar",
        data: [
          { name: "2026", value: 35 },
          { name: "2027", value: 50 },
          { name: "2028", value: 72 },
          { name: "2029", value: 95 },
        ],
      },
    },
    {
      type: "model",
      title: "Business Model",
      subtitle: "Simple revenue streams with room to scale",
      content: [
        "The primary revenue model can be subscription-based pricing for regular users.",
        "Additional revenue can come from premium features, analytics, and enterprise plans.",
        "This model supports recurring revenue and predictable growth.",
      ],
      visualData: {
        chartType: "pie",
        data: [
          { name: "Subscriptions", value: 55 },
          { name: "Premium", value: 25 },
          { name: "Enterprise", value: 20 },
        ],
      },
    },
    {
      type: "competition",
      title: "Competition",
      subtitle: "Differentiation through speed, focus, and usability",
      content: [
        "Existing competitors may offer broad solutions, but many lack focus for this specific user need.",
        `${startupName} can compete by offering a cleaner experience and faster results.`,
        "The strongest advantage is combining practical workflows with AI-assisted output.",
      ],
    },
    {
      type: "strategy",
      title: "Go-To-Market",
      subtitle: `Targeting ${audience}`,
      content: [
        "The first users can be reached through startup communities, online campaigns, and partnerships.",
        "Early feedback will be used to improve product-market fit and messaging.",
        "The launch strategy focuses on small, measurable experiments before scaling.",
      ],
      visualData: {
        chartType: "line",
        data: [
          { name: "M1", value: 10 },
          { name: "M2", value: 25 },
          { name: "M3", value: 45 },
          { name: "M4", value: 70 },
        ],
      },
    },
    {
      type: "financials",
      title: "Financial Plan",
      subtitle: "Focused spending with growth-oriented milestones",
      content: [
        "Initial spending will focus on product development, customer acquisition, and operations.",
        "Revenue is expected to grow as user adoption and retention improve.",
        "Key metrics include customer acquisition cost, monthly recurring revenue, and retention.",
      ],
      visualData: {
        chartType: "area",
        data: [
          { name: "Y1", value: 20 },
          { name: "Y2", value: 55 },
          { name: "Y3", value: 120 },
        ],
      },
    },
    {
      type: "team",
      title: "Team",
      subtitle: "A focused founding team can execute quickly",
      content: [
        "The team should combine product, technology, marketing, and customer discovery skills.",
        "Advisors from the startup and industry ecosystem can improve credibility.",
        "Execution speed and user understanding will be the biggest early strengths.",
      ],
    },
    {
      type: "ask",
      title: "The Ask",
      subtitle: `Seeking support from ${audience}`,
      content: [
        "Funding will be used to build the product, acquire early customers, and validate the business model.",
        "The next milestone is to launch an MVP and measure user traction.",
        "The goal is to convert investor support into a scalable, market-ready company.",
      ],
    },
  ];

  return {
    startupName,
    industry,
    stage,
    slides: slides.map((slide) => ({
      ...slide,
      imagePrompt: baseImagePrompt,
      speakerScript: `This slide explains ${slide.title.toLowerCase()} for ${startupName}. The key message is to show why the idea is useful, why the timing is right, and how the startup can grow. Present this clearly and connect it back to the user problem and investor opportunity.`,
    })),
    investorScore: {
      clarity: 82,
      scalability: 78,
      market: 80,
      innovation: 84,
      revenue: 76,
    },
    targetInvestors: audience
      .split(",")
      .map((item: string) => item.trim())
      .filter(Boolean)
      .slice(0, 5),
    competitors: [
      {
        name: "Existing manual tools",
        differentiator: "PitchPilot-style automation and faster deck creation",
        strength: "Familiar to users",
        weakness: "Requires more manual effort",
      },
      {
        name: "Generic AI tools",
        differentiator: "Startup pitch deck structure and investor-focused output",
        strength: "Flexible content generation",
        weakness: "Less specialized for pitch decks",
      },
      {
        name: "Design platforms",
        differentiator: "Combines content, charts, scripts, and scoring",
        strength: "Strong visual templates",
        weakness: "Needs manual business content",
      },
      {
        name: "Consultants",
        differentiator: "Lower cost and instant generation",
        strength: "Expert guidance",
        weakness: "Expensive and slower",
      },
      {
        name: "Template marketplaces",
        differentiator: "Personalized deck based on startup inputs",
        strength: "Many design choices",
        weakness: "Static and not AI-generated",
      },
    ],
  };
}

function makeStartupName(idea: string, industry: string) {
  const word = idea
    .replace(/[^a-zA-Z\s]/g, " ")
    .split(/\s+/)
    .find((part) => part.length > 3);

  const base = word ? word[0].toUpperCase() + word.slice(1).toLowerCase() : industry;
  return `${base}Pilot`;
}

// Vite middleware for development
async function setupVite() {
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(process.cwd(), "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(process.cwd(), "dist", "index.html"));
    });
  }
}

setupVite().then(() => {
  startServer(PORT);
});

function startServer(port: number, attempts = 0) {
  const server = app.listen(port, HOST, () => {
    console.log(`Server running on http://localhost:${port}`);
  });

  server.on("error", (error: NodeJS.ErrnoException) => {
    if (error.code === "EADDRINUSE" && shouldRetryPort && attempts < 10) {
      const nextPort = port + 1;
      console.warn(`Port ${port} is in use, trying ${nextPort}...`);
      startServer(nextPort, attempts + 1);
      return;
    }

    console.error("Unable to start server:", error);
    process.exit(1);
  });
}
