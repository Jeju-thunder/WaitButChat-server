export default class GetChatsResponse {
    chats: ChatDto[];
    matching_id: number;
}

export class ChatDto {
    id: number;
    content: string;
    created_at: string;
    created_by: string;
}
