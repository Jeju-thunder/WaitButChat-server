export class GetChatAnalysisListResponse {
    analysis_results: ChatAnalysisResult[];
}

export class GetChatAnalysisResponse {
    analysis_result: ChatAnalysisResult;
}

export class ChatAnalysisResult {
    created_at: string;
    updated_at: string;
    summary_tags: SummaryTag[];
    contents: string[];
}

export class SummaryTag {
    category: string;
    content: string;
}