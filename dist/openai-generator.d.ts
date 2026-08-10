import type { GenerateTextRequest, TextGenerator } from "./types.js";
export declare class OpenAITextGenerator implements TextGenerator {
    #private;
    constructor(apiKey: string);
    generate(request: GenerateTextRequest): Promise<string>;
}
