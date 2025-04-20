import { Injectable, NotFoundException } from "@nestjs/common";
import GetChatsResponse, { ChatDto } from "./dto/response/get-chats-response.dto";
import GetChatRoomsResponse from "./dto/response/get-chatrooms-response.dto";
import { member } from "@prisma/client";
import { ChatRepository } from "./chat.repository";

@Injectable()
export default class ChatService {
    constructor(
        private readonly chatRepository: ChatRepository
    ) { }


    async getChatRooms(member: member): Promise<GetChatRoomsResponse> {
        // memberId를 기반으로 채팅방 조회
        const chatrooms = await this.chatRepository.getChatRooms(member);
        const chatrooms_response: GetChatRoomsResponse = {
            chatrooms: chatrooms.map((chatroom) => {
                const lastChat = chatroom.chats[0];
                return {
                    id: chatroom.id,
                    question_title: chatroom.question.content,
                    content: lastChat ? lastChat.content : '',
                    created_at: chatroom.created_at.toISOString(),
                    updated_at: lastChat ? lastChat.created_at.toISOString() : null,
                    updated_by: lastChat ? lastChat.createdByAnonymousMember.nickname : '',
                    terminated_at: chatroom.terminated_at?.toISOString() ?? null,
                }
            })
        };

        return chatrooms_response;
    }

    async deleteChatRooms(member: member, ids: number[]): Promise<void> {
        const chatrooms = await this.chatRepository.getChatRoomsByIds(member.id, ids);

        if (chatrooms.length !== ids.length) {
            throw new NotFoundException("삭제하고자 하는 모든 채팅방을 찾을 수 없습니다");
        }

        const terminated_at = new Date();
        await this.chatRepository.deleteChatRooms(member.id, ids, terminated_at);

        return;
    }

    // chatroom 조회
    async getChats(member: member, id: number): Promise<GetChatsResponse> {

        const chatroom = await this.chatRepository.getChatRoomsByIdForMember(member.id, id);
        if (!chatroom) {
            throw new NotFoundException("채팅방을 찾을 수 없습니다.");
        }

        const chats_response: ChatDto[] = chatroom.chats.map((chat) => {
            return {
                id: chat.id,
                content: chat.content,
                created_at: chat.created_at.toISOString(),
                created_by: chat.createdByAnonymousMember.nickname,
            }
        });

        // matching_id 조회
        const matching = chatroom.matches.find((match) => {
            if (match.anonymousMembers.member_id === member.id) {
                return match;
            }
        });
        if (!matching) {
            throw new NotFoundException("사용자의 연결정보를 찾을 수 없습니다.");
        }

        return {
            chats: chats_response,
            matching_id: matching.id,
        };
    }
}
