import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/modules/prisma/prisma.service";
import GetChatsResponse from "./dto/response/get-chats-response.dto";
import GetChatRoomsResponse from "./dto/response/get-chatrooms-response.dto";
import { member } from "@prisma/client";
@Injectable()
export default class ChatService {
    constructor(private readonly prisma: PrismaService) { }


    async getChatRooms(member: member): Promise<GetChatRoomsResponse> {

        // memberId를 기반으로 채팅방 조회
        const chatrooms = await this.prisma.chat_room.findMany({
            where: {
                matches: {
                    some: {
                        anonymous_members_id: member.id
                    }
                }
            }
        });

        // FIXME: 채팅방 연결 API가 없어서 우선 제외
        const dummyChatRooms = [
            {
                id: 1,
                question_title: "20대 직장인 일상대화",
                content: "퇴근 후 취미생활이나 주말 계획에 대해 이야기해요",
                created_at: "2023-11-15T09:23:45Z",
                updated_at: "2023-11-15T14:30:12Z",
                updated_by: "친절한돌고래#112",
                terminated_at: null
            },
            {
                id: 2,
                question_title: "영화 추천 랜덤 채팅방",
                content: "최근에 본 영화나 좋아하는 장르에 대해 대화해요",
                created_at: "2023-12-05T18:45:22Z",
                updated_at: "2023-12-06T10:15:33Z",
                updated_by: "안친절한돌고래#113",
                terminated_at: "2023-12-10T22:30:00Z"
            },
            {
                id: 3,
                question_title: "익명으로 고민 상담",
                content: "서로 얼굴 모르고 편하게 고민을 나눌 수 있는 익명 채팅방",
                created_at: "2024-01-20T08:12:37Z",
                updated_at: "2024-01-20T15:45:19Z",
                updated_by: "기묘한토끼#112",
                terminated_at: null
            }
        ]

        return {
            chatrooms: dummyChatRooms,
        };
    }

    // chatroom 조회
    async getChats(member: member, id: number): Promise<GetChatsResponse> {

        const chatroom = await this.prisma.chat_room.findUnique({
            where: {
                id: id,
            },
        });

        const chats = await this.prisma.chat.findMany({
            where: {
                chat_room_id: id,
            },
        });

        // FIXME: 챗 API가 없어서 우선 제외
        const dummyChats = [
            {
                id: 1,
                content: "HI 나는 친절한 돌고래야.",
                created_by: "친절한돌고래#112",
                created_at: "2025-03-22 12:00:00",
            },
            {
                id: 2,
                content: "안녕 나는 안친절한 돌고래야.",
                created_by: "안친절한돌고래#112",
                created_at: "2025-03-21 12:00:00",
            },
        ];

        return {
            chats: dummyChats,
            matching_id: 1,
        };
    }
}
