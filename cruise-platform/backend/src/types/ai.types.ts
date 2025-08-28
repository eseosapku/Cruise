export interface AIRequest {
    prompt: string;
    context?: string;
    userId: string;
}

export interface AIResponse {
    response: string;
    usage: {
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
    };
}

export interface AIError {
    message: string;
    code?: number;
}