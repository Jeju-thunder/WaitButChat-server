export default class GetChatRoomsResponse {
    chatrooms: ChatRoomDto[];
}

export class ChatRoomDto {
    id: number;
    question_title: string;
    content: string;
    created_at: string;
    updated_at: string | null;
    created_by: string;
    terminated_at: string | null;
}