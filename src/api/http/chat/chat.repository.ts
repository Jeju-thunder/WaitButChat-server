import { Injectable } from "@nestjs/common";
import { anonymous_members, chat_room, chat, match, member } from "@prisma/client";
import { PrismaService } from "src/providers/prisma/prisma.service";
import { ChatRoomWithRelationsForGetChatRooms, ChatRoomWithRelationsForGetChatRoomsById, ChatRoomWithRelationsForGetChatRoomsByIds, MatchWithRelationsForGetMatch } from "src/interface/query-type";
import { CreateChatDto } from "./dto/request/create-chat.dto";
import { generateRandomNickname } from "src/utils/nickname.generator";

@Injectable()
export class ChatRepository {
    constructor(private readonly prisma: PrismaService) { }

    async getChatRooms(member: member): Promise<ChatRoomWithRelationsForGetChatRooms[]> {
        // memberId를 기반으로 채팅방 조회
        const chatrooms = await this.prisma.chat_room.findMany({
            where: {
                matches: {
                    some: {
                        anonymousMembers: {
                            member_id: member.id
                        },
                        terminated_at: null
                    },
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

        return chatrooms;
    }

    async getChatRoomsByIds(memberId: number, ids: number[]): Promise<ChatRoomWithRelationsForGetChatRoomsByIds[]> {
        const chatrooms = await this.prisma.chat_room.findMany({
            where: {
                id: { in: ids },
                matches: {
                    some: {
                        anonymousMembers: {
                            member_id: memberId
                        },
                        terminated_at: null
                    },
                },
            },
            include: {
                matches: {
                    where: {
                        anonymousMembers: {
                            member_id: memberId
                        },
                        terminated_at: null
                    }
                }
            }
        });

        return chatrooms;
    }

    async getChatRoomsById(id: number): Promise<chat_room | null> {
        return await this.prisma.chat_room.findUnique({
            where: { id },
        });
    }

    async getChatRoomsByIdForMember(memberId: number, id: number): Promise<ChatRoomWithRelationsForGetChatRoomsById | null> {

        const chatroom = await this.prisma.chat_room.findUnique({
            where: {
                id: id,
                matches: {
                    some: {
                        anonymousMembers: {
                            member_id: memberId
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

        return chatroom;
    }

    async deleteChatRooms(memberId: number, ids: number[], terminated_at: Date = new Date()): Promise<void> {
        // transaction으로 chatroom과 matches를 함께 업데이트
        await this.prisma.$transaction(async (tx) => {
            // 채팅방 업데이트
            await tx.chat_room.updateMany({
                where: {
                    id: { in: ids }
                },
                data: {
                    terminated_at: terminated_at
                }
            });

            // matches 업데이트
            await tx.match.updateMany({
                where: {
                    chat_room_id: { in: ids },
                    anonymousMembers: {
                        member_id: memberId
                    },
                },
                data: {
                    terminated_at: terminated_at
                }
            });
        });
    }

    async getMatchIncludeAnonymousMember(matchingId: number): Promise<MatchWithRelationsForGetMatch | null> {
        return await this.prisma.match.findUnique({
            where: { id: matchingId },
            include: {
                anonymousMembers: true
            }
        });
    }

    async createChat(dto: CreateChatDto, anonymousMemberId: number, created_at: Date = new Date()): Promise<chat> {
        return await this.prisma.chat.create({
            data: {
                chat_room_id: dto.chat_room_id,
                content: dto.content,
                created_by_anonymous_member_id: anonymousMemberId,
                created_at,
            },
        });
    }

    async createChatRoomWithMatches(
        questionId: number,
        memberId: number,
        matchedMemberId: number,
        created_at: Date = new Date()
    ): Promise<{
        chatRoom: chat_room;
        anonymousMember: anonymous_members;
        anonymousMachedMember: anonymous_members;
        memberChatMatch: match;
        matchedMemberChatMatch: match;
    }> {
        return await this.prisma.$transaction(async (tx) => {
            // 채팅방 생성
            const chatRoom = await tx.chat_room.create({
                data: {
                    created_at,
                    updated_at: created_at,
                    question_id: questionId
                }
            });

            // 익명 사용자 생성
            const anonymousMember = await tx.anonymous_members.create({
                data: {
                    member_id: memberId,
                    nickname: generateRandomNickname(),
                    created_at,
                    updated_at: created_at
                }
            });

            const anonymousMachedMember = await tx.anonymous_members.create({
                data: {
                    member_id: matchedMemberId,
                    nickname: generateRandomNickname(),
                    created_at,
                    updated_at: created_at
                }
            });

            // 채팅방과 매칭정보 생성
            const memberChatMatch = await tx.match.create({
                data: {
                    chat_room_id: chatRoom.id,
                    anonymous_members_id: anonymousMember.id,
                    created_at,
                    updated_at: created_at
                }
            });

            const matchedMemberChatMatch = await tx.match.create({
                data: {
                    chat_room_id: chatRoom.id,
                    anonymous_members_id: anonymousMachedMember.id,
                    created_at,
                    updated_at: created_at
                }
            });

            return {
                chatRoom,
                anonymousMember,
                anonymousMachedMember,
                memberChatMatch,
                matchedMemberChatMatch
            };
        });
    }
}
