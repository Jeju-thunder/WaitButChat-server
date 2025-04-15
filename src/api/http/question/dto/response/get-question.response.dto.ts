export default class GetQuestionsResponse {
    questions: {
        id: number;
        title: string;
        content: string;
    }[];
    participantCount: number;
}