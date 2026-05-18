import { GenerateDeckRequest, PitchDeck, Slide, SlideType } from "../types";

type DeckPayload = Omit<PitchDeck, "id" | "createdAt">;
type Brief = Pick<GenerateDeckRequest, "idea" | "industry" | "audience" | "stage" | "templateId">;

const slideTypes: SlideType[] = ["cover", "problem", "solution", "market", "model", "competition", "strategy", "financials", "team", "ask"];

function titleCase(value: string) {
  return value
    .replace(/[^a-zA-Z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() + word.slice(1).toLowerCase())
    .join("");
}

function makeStartupName(idea: string, industry: string) {
  const ideaName = titleCase(idea);
  const industryName = titleCase(industry);
  return `${ideaName || industryName || "Venture"}Pilot`;
}

function makeImagePrompt(type: SlideType, title: string, brief: Brief) {
  const sceneByType: Record<SlideType, string> = {
    cover: `founder presenting ${brief.idea} on a premium startup stage`,
    problem: `customers facing a frustrating workflow in ${brief.industry}`,
    solution: `modern product dashboard solving the ${brief.industry} workflow`,
    market: `${brief.industry} market expansion with professional operators and digital tools`,
    model: `business team reviewing pricing, subscriptions, and revenue dashboards`,
    competition: `strategy room with competitor analysis and positioning boards`,
    strategy: `growth team planning acquisition channels and launch milestones`,
    financials: `finance dashboard with revenue projections and operating metrics`,
    team: `diverse founding team collaborating in a bright startup workspace`,
    ask: `founder pitching investors in a polished boardroom`,
  };

  return [
    "Photorealistic professional pitch deck image.",
    `Slide topic: ${title}.`,
    `Scene: ${sceneByType[type]}.`,
    `Industry: ${brief.industry}. Stage: ${brief.stage}. Audience: ${brief.audience}.`,
    "Modern lighting, realistic people or product environment, high detail, no text, no logos, no watermarks.",
  ].join(" ");
}

function script(title: string, startupName: string, brief: Brief) {
  return `This slide frames ${title.toLowerCase()} for ${startupName}. Open by tying the message back to the customer pain in ${brief.industry}, then explain why the timing is attractive for ${brief.stage} investors. Emphasize the specific advantage in the idea, show how it can become a repeatable business, and close with the progress an investor should expect after funding.`;
}

function slide(type: SlideType, title: string, subtitle: string, content: string[], brief: Brief, visualData?: Slide["visualData"]): Slide {
  return {
    type,
    title,
    subtitle,
    content,
    visualData,
    imagePrompt: makeImagePrompt(type, title, brief),
    speakerScript: script(title, makeStartupName(brief.idea, brief.industry), brief),
  };
}

export function buildLocalFallbackDeck(brief: Brief): DeckPayload {
  const startupName = makeStartupName(brief.idea, brief.industry);
  const audience = brief.audience || "early-stage investors";
  const industry = brief.industry || "startup";
  const stage = brief.stage || "Seed";

  const slides: Slide[] = [
    slide("cover", startupName, `${industry} venture built for ${audience}`, [
      `${startupName} turns the core idea, "${brief.idea}", into a focused investor story for the ${industry} market.`,
      `The company is positioned for ${stage} funding with a clear problem, scalable workflow, and practical path to early traction.`,
      `The deck highlights customer pain, product value, market size, revenue model, execution plan, and the funding ask.`,
    ], brief),
    slide("problem", "The Problem", "Customers are underserved by slow, manual, or fragmented workflows", [
      `Teams in ${industry} still rely on disconnected tools that create avoidable delays, repeated work, and inconsistent outcomes.`,
      "Decision makers need faster execution, clearer visibility, and lower operating cost without adding another complicated system.",
      "The pain is urgent because customers increasingly expect digital experiences that are personalized, measurable, and available on demand.",
      "Existing alternatives either solve only part of the workflow or require high setup effort, leaving room for a focused startup wedge.",
    ], brief),
    slide("solution", "The Solution", brief.idea, [
      `${startupName} packages the idea into a simple product experience that helps users complete the most painful workflow faster.`,
      "The product can combine automation, guided inputs, analytics, and repeatable templates to reduce manual work and improve quality.",
      "The first version should focus on one high-value customer segment, then expand into adjacent workflows once usage is validated.",
      "A strong onboarding loop and measurable customer outcomes create the foundation for retention and word-of-mouth growth.",
    ], brief),
    slide("market", "Market Opportunity", `${industry} adoption is moving toward intelligent, vertical software`, [
      `The initial serviceable market is a focused segment inside ${industry} where buyers feel the problem frequently and have budget authority.`,
      "Expansion potential comes from adjacent teams, premium workflows, and integrations that make the product harder to replace.",
      "A bottom-up motion can start with smaller customers while enterprise packaging creates larger contract opportunities over time.",
      "The wedge is attractive because a narrow use case can become a broader operating layer once customer data and habits compound.",
    ], brief, {
      chartType: "bar",
      data: [
        { name: "TAM", value: 120 },
        { name: "SAM", value: 54 },
        { name: "SOM", value: 14 },
        { name: "Year 1", value: 4 },
      ],
    }),
    slide("model", "Revenue Model", "Recurring revenue with expansion paths", [
      "The primary model is subscription pricing tied to seats, usage, or workflow volume so revenue scales with customer value.",
      "Premium analytics, team collaboration, integrations, and priority support can lift average contract value after initial adoption.",
      "Enterprise plans can bundle security, administration, service-level support, and custom onboarding for larger customers.",
      "Healthy unit economics depend on fast activation, low-touch onboarding, and product-led retention after the first workflow win.",
    ], brief, {
      chartType: "pie",
      data: [
        { name: "Subscriptions", value: 55 },
        { name: "Enterprise", value: 25 },
        { name: "Add-ons", value: 12 },
        { name: "Partners", value: 8 },
      ],
    }),
    slide("competition", "Competitive Position", "Focused execution beats broad, generic alternatives", [
      "Generic AI tools are flexible but require users to design prompts, structure outputs, and convert results into a business workflow.",
      "Traditional software platforms are familiar but often lack the intelligent automation and speed expected by modern operators.",
      "Consultants can deliver quality work, but cost, turnaround time, and repeatability limit their fit for everyday execution.",
      `${startupName} can win by combining a specific ${industry} workflow, strong user experience, and measurable business outcomes.`,
    ], brief, {
      chartType: "bar",
      data: [
        { name: "Speed", value: 88 },
        { name: "Focus", value: 84 },
        { name: "Cost", value: 72 },
        { name: "Quality", value: 91 },
      ],
    }),
    slide("strategy", "Go-To-Market", `Acquire early believers through ${audience}`, [
      "The first channel should target communities, founder networks, operators, and niche newsletters where the pain is already visible.",
      "A demo-led funnel can show the before-and-after workflow quickly, making the value proposition easier to understand and share.",
      "Partnerships with advisors, agencies, or ecosystem platforms can lower trust barriers and accelerate qualified introductions.",
      "The operating rhythm should measure activation rate, weekly retained usage, conversion, CAC payback, and expansion signals.",
    ], brief, {
      chartType: "line",
      data: [
        { name: "M1", value: 12 },
        { name: "M2", value: 28 },
        { name: "M3", value: 49 },
        { name: "M4", value: 77 },
        { name: "M5", value: 112 },
      ],
    }),
    slide("financials", "Financial Plan", "Disciplined spend tied to product and traction milestones", [
      "Year one should prioritize product development, customer discovery, and a narrow acquisition channel with measurable conversion.",
      "Gross margin can improve as automation handles more of the workflow and onboarding becomes repeatable.",
      "The target is to prove retention before scaling paid acquisition, protecting capital efficiency during the riskiest stage.",
      "Key metrics include monthly recurring revenue, activation, retention, gross margin, customer acquisition cost, and lifetime value.",
    ], brief, {
      chartType: "area",
      data: [
        { name: "Y1", value: 24 },
        { name: "Y2", value: 70 },
        { name: "Y3", value: 155 },
        { name: "Y4", value: 280 },
      ],
    }),
    slide("team", "Team", "A lean founding team built for speed and customer learning", [
      "The founding team should combine product judgment, technical execution, customer discovery, and commercial storytelling.",
      `Relevant ${industry} advisors can strengthen credibility, sharpen the roadmap, and open early customer conversations.`,
      "The early hiring plan should focus on engineering, design, and growth roles directly tied to activation and retention.",
      "A tight feedback loop between users and builders is the team advantage that turns early uncertainty into product clarity.",
    ], brief),
    slide("ask", "The Ask", `Funding to reach the next ${stage} milestone`, [
      "Capital will be used to ship the MVP, validate the highest-value customer segment, and prove repeatable acquisition.",
      "A practical allocation is product and engineering, customer acquisition experiments, founder-led sales, and operating runway.",
      "The next milestone is a reliable set of early customers with strong activation, clear retention, and evidence of willingness to pay.",
      `The investor fit is ${audience}: backers who understand early execution risk and can help ${startupName} reach its first scalable channel.`,
    ], brief),
  ];

  return {
    startupName,
    industry,
    templateId: brief.templateId,
    slides: slides.map((item, index) => ({ ...item, type: slideTypes[index] })),
    investorScore: {
      clarity: 84,
      scalability: 80,
      market: 82,
      innovation: 83,
      revenue: 78,
    },
    targetInvestors: audience
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean)
      .slice(0, 5),
    competitors: [
      {
        name: "Generic AI tools",
        differentiator: "Purpose-built pitch workflow and investor-ready structure",
        strength: "Flexible generation",
        weakness: "Requires manual structure and validation",
      },
      {
        name: "Traditional software suites",
        differentiator: "Faster setup and narrower workflow focus",
        strength: "Established customer trust",
        weakness: "Slower product experience",
      },
      {
        name: "Consultants and agencies",
        differentiator: "Lower cost, instant iteration, and repeatable output",
        strength: "Human expertise",
        weakness: "Expensive and difficult to scale",
      },
      {
        name: "Template marketplaces",
        differentiator: "Personalized business content instead of static layouts",
        strength: "Wide design selection",
        weakness: "No automated strategy or data generation",
      },
      {
        name: "Internal manual workflows",
        differentiator: "Automation and consistent output quality",
        strength: "Already familiar",
        weakness: "Time-consuming and inconsistent",
      },
    ],
  };
}
