import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/modules/prisma/prisma.service";
import GetChatsResponse, { ChatDto } from "./dto/response/get-chats-response.dto";
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
                        anonymousMembers: {
                            member_id: member.id
                        }
                    }
                }
            },
            include: {
                matches: {
                    include: {
                        anonymousMembers: true
                    }
                },
                question: true,
                chats: {
                    include: {
                        createdByAnonymousMember: true
                    },
                    orderBy: {
                        created_at: 'desc'
                    },
                    take: 1
                }
            },
        });
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

    // chatroom 조회
    async getChats(member: member, id: number): Promise<GetChatsResponse> {

        const chatroom = await this.prisma.chat_room.findUnique({
            where: {
                id: id,
                matches: {
                    some: {
                        anonymousMembers: {
                            member_id: member.id
                        }
                    }
                }
            },
            include: {
                chats: {
                    include: {
                        createdByAnonymousMember: true
                    },
                    orderBy: {
                        created_at: "asc"
                    }
                },
                matches: {
                    include: {
                        anonymousMembers: {
                            include: {
                                member: true
                            }
                        }
                    }
                }
            },
        });

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
