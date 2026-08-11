import OpenAI from "openai";

import type { GenerateTextRequest, TextGenerator } from "./types.js";

export interface ResponsesClient {
  responses: {
    create(request: {
      model: string;
      instructions: string;
      input: string;
      store: false;
    }): Promise<{ output_text: string }>;
  };
}

export class OpenAITextGenerator implements TextGenerator {
  readonly #client: ResponsesClient;

  constructor(apiKey: string, client?: ResponsesClient) {
    if (!apiKey.trim()) {
      throw new Error(
        "OPENAI_API_KEY is required. Pass it as an environment variable or action secret.",
      );
    }
    this.#client = client ?? new OpenAI({ apiKey });
  }

  async generate(request: GenerateTextRequest): Promise<string> {
    const response = await this.#client.responses.create({
      model: request.model,
      instructions: request.instructions,
      input: request.input,
      store: false,
    });

    const output = response.output_text.trim();
    if (!output) {
      throw new Error("OpenAI returned an empty response.");
    }
    return output;
  }
}
