import { Prisma } from "@prisma/client"

// 쿼리 타입 정의
export type ChatRoomWithRelationsForGetChatRooms = Prisma.chat_roomGetPayload<{
    include: {
        matches: {
            include: {
                anonymousMembers: true
            }
        }
        question: true
        chats: {
            include: {
                createdByAnonymousMember: true
            }
        }
    }
}>

export type ChatRoomWithRelationsForGetChatRoomsByIds = Prisma.chat_roomGetPayload<{
    include: {
        matches: true
    }
}>

export type ChatRoomWithRelationsForGetChatRoomsById = Prisma.chat_roomGetPayload<{
    include: {
        chats: {
            include: {
                createdByAnonymousMember: true
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
    }
}>

export type QuestionWithRelationsForGetQuestions = Prisma.questionGetPayload<{
    include: {
        answers: true
    }
}>

export type MatchWithRelationsForGetMatch = Prisma.matchGetPayload<{
    include: {
        anonymousMembers: true
    }
}>