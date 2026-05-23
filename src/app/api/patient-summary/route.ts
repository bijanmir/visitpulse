import Anthropic from "@anthropic-ai/sdk";
import { features } from "@/lib/features";
import { PRE_VISIT_SUMMARY_SYSTEM_PROMPT } from "@/lib/ai-summary-prompt";

export const runtime = "nodejs";

type RequestBody = {
  promptText: string;
};

function isValidBody(body: unknown): body is RequestBody {
  return (
    typeof body === "object" &&
    body !== null &&
    typeof (body as RequestBody).promptText === "string" &&
    (body as RequestBody).promptText.length > 0 &&
    (body as RequestBody).promptText.length < 20_000
  );
}

export async function POST(request: Request) {
  if (!features.aiSummary) {
    return Response.json(
      { error: "AI summary feature is disabled or ANTHROPIC_API_KEY is unset." },
      { status: 503 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (!isValidBody(body)) {
    return Response.json(
      { error: "Body must be { promptText: string } under 20K chars." },
      { status: 400 },
    );
  }

  const client = new Anthropic();

  try {
    // Prompt caching: the breakpoint sits on the system prompt block, so the
    // ~4K-token frozen system prompt caches across requests. The per-patient
    // user message is short and varies per request, so it stays uncached.
    // Render order is tools → system → messages; with no tools and a single
    // system block, the breakpoint covers the whole stable prefix.
    const response = await client.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 400,
      system: [
        {
          type: "text",
          text: PRE_VISIT_SUMMARY_SYSTEM_PROMPT,
          cache_control: { type: "ephemeral" },
        },
      ],
      messages: [{ role: "user", content: body.promptText }],
    });

    const textBlock = response.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      return Response.json(
        { error: "Model returned no text content." },
        { status: 502 },
      );
    }

    return Response.json({
      summary: textBlock.text.trim(),
      usage: {
        cacheReadTokens: response.usage.cache_read_input_tokens,
        cacheCreationTokens: response.usage.cache_creation_input_tokens,
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens,
      },
    });
  } catch (err) {
    if (err instanceof Anthropic.RateLimitError) {
      return Response.json(
        { error: "Rate limited by the model API. Try again in a moment." },
        { status: 429 },
      );
    }
    if (err instanceof Anthropic.APIError) {
      return Response.json(
        { error: `Model API error: ${err.message}` },
        { status: err.status ?? 502 },
      );
    }
    return Response.json(
      { error: err instanceof Error ? err.message : "Unknown error." },
      { status: 500 },
    );
  }
}
