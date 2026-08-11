import type { GenerateTextRequest, TextGenerator } from "./types.js";
export interface ResponsesClient {
    responses: {
        create(request: {
            model: string;
            instructions: string;
            input: string;
            store: false;
        }): Promise<{
            output_text: string;
        }>;
    };
}
export declare class OpenAITextGenerator implements TextGenerator {
    #private;
    constructor(apiKey: string, client?: ResponsesClient);
    generate(request: GenerateTextRequest): Promise<string>;
}
