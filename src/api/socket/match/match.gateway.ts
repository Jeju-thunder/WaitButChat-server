import { Server, Socket } from 'socket.io';
import { MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer, ConnectedSocket } from "@nestjs/websockets";
import { PrismaService } from 'src/providers/prisma/prisma.service';
import { generateRandomNickname } from 'src/utils/nickname.generator';

interface MemberSocket {
    memberId: string;
    socket: Socket;
}

@WebSocketGateway({
    namespace: '/socket/question/match',
    cors: {
        origin: '*',
    },
})
export class MatchGateway {
    @WebSocketServer()
    server: Server;

    private readonly MATCH_TIMEOUT = 3 * 60 * 1000;
    // private readonly MATCH_TIMEOUT = 10 * 1000;

    // 각 질문에 대한 memberId 목록을 저장함.
    private requestQuestionMemberIds = new Map<string, Set<string>>();

    // 각 memberId와 socket을 매핑
    private memberSockets = new Map<string, Socket>();

    // prisma 서비스
    private readonly prismaService: PrismaService;

    constructor(prismaService: PrismaService) {
        this.prismaService = prismaService;
    }

    @SubscribeMessage('match')
    async handleMatch(@MessageBody() data: any, @ConnectedSocket() client: Socket) {
        const questionId = data?.questionId;
        const memberId = data?.memberId;

        // 필수 파라미터 체크
        if (!questionId || !memberId) {
            client.emit('match', { message: 'questionId와 memberId가 필요합니다' });
            return;
        }

        // 소켓 저장
        this.memberSockets.set(memberId, client);

        // 질문 ID에 대한 Set이 없으면 생성
        if (!this.requestQuestionMemberIds.has(questionId)) {
            this.requestQuestionMemberIds.set(questionId, new Set());
        }

        const members = this.requestQuestionMemberIds.get(questionId)!; // 위에서 생성했으므로 존재 보장됨

        // 이미 대기 중인지 체크
        if (members.has(memberId)) {
            client.emit('match', { message: '이미 매칭 대기 중입니다' });
            return;
        }

        // 매칭 가능한 다른 사용자 찾기
        const matchedMemberId = Array.from(members).find(member => member !== memberId);

        if (matchedMemberId) {
            // 매칭된 사용자 소켓 찾기
            const matchedSocket = this.memberSockets.get(matchedMemberId);

            if (matchedSocket) {
                try {
                    // 트랜잭션 시작
                    const result = await this.prismaService.$transaction(async (prisma) => {
                        // 채팅방 생성
                        const chatRoom = await prisma.chat_room.create({
                            data: {
                                created_at: new Date(),
                                updated_at: new Date(),
                                question_id: Number(questionId)
                            }
                        });

                        // 익명 사용자 생성
                        const anonymousMember = await prisma.anonymous_members.create({
                            data: {
                                member_id: Number(memberId),
                                nickname: generateRandomNickname(),
                                created_at: new Date(),
                                updated_at: new Date()
                            }
                        });

                        const anonymousMachedMember = await prisma.anonymous_members.create({
                            data: {
                                member_id: Number(matchedMemberId),
                                nickname: generateRandomNickname(),
                                created_at: new Date(),
                                updated_at: new Date()
                            }
                        });

                        // 채팅방과 매칭정보 생성
                        const memberChatMatch = await prisma.match.create({
                            data: {
                                chat_room_id: chatRoom.id,
                                anonymous_members_id: anonymousMember.id,
                                created_at: new Date(),
                                updated_at: new Date()
                            }
                        });

                        const matchedMemberChatMatch = await prisma.match.create({
                            data: {
                                chat_room_id: chatRoom.id,
                                anonymous_members_id: anonymousMachedMember.id,
                                created_at: new Date(),
                                updated_at: new Date()
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

                    // 트랜잭션이 성공적으로 완료된 후에만 소켓 이벤트 전송
                    // 매칭된 사용자에게 알림
                    matchedSocket.emit('match', {
                        message: '성공적으로 매칭되었습니다.',
                        other_member_id: memberId,
                        chatroom_id: result.chatRoom.id,
                        match_id: result.matchedMemberChatMatch.id,
                    });

                    // 현재 사용자에게 알림
                    client.emit('match', {
                        message: '성공적으로 매칭되었습니다.',
                        other_member_id: matchedMemberId,
                        chatroom_id: result.chatRoom.id,
                        match_id: result.memberChatMatch.id,
                    });

                    // 매칭된 사용자 제거
                    members.delete(matchedMemberId);
                } catch (error) {
                    console.error('매칭 처리 중 오류 발생:', error);
                    // 에러 발생 시 양쪽 사용자 모두 대기열에서 제거
                    members.delete(memberId);
                    members.delete(matchedMemberId);

                    // 에러 메시지 전송
                    client.emit('match', {
                        message: '매칭 처리 중 오류가 발생했습니다. 다시 시도해주세요.',
                        error: true
                    });
                    matchedSocket.emit('match', {
                        message: '매칭 처리 중 오류가 발생했습니다. 다시 시도해주세요.',
                        error: true
                    });
                }
            } else {
                // 매칭된 사용자의 소켓이 없는 경우 (연결이 끊어진 경우)
                members.delete(matchedMemberId);

                // 현재 사용자를 대기열에 추가하고 계속 진행
                members.add(memberId);
                client.emit('match', { message: '매칭 대기 중', questionId });

                // 타임아웃 설정
                this.setMatchTimeout(memberId, questionId);
            }
            return;
        }

        // 매칭할 사용자가 없으면 대기열에 추가
        members.add(memberId);
        client.emit('match', { message: '매칭 대기 중', questionId });

        // 타임아웃 설정
        this.setMatchTimeout(memberId, questionId);
    }

    private setMatchTimeout(memberId: string, questionId: string) {
        setTimeout(() => {
            const members = this.requestQuestionMemberIds.get(questionId);
            if (members && members.has(memberId)) {
                members.delete(memberId);
                const socket = this.memberSockets.get(memberId);
                if (socket) {
                    socket.emit('match', { "message": "매칭 시간이 초과되었습니다." });
                }
            }
        }, this.MATCH_TIMEOUT);
    }

    @SubscribeMessage('cancel_match')
    handleCancelMatch(@MessageBody() data: any, @ConnectedSocket() client: Socket) {
        const questionId = data?.questionId;
        const memberId = data?.memberId;

        if (!questionId || !memberId) {
            client.emit('cancel_match', { message: 'questionId와 memberId가 필요합니다' });
            return;
        }

        // 대기열에서 제거 (질문 ID에 대한 Set이 존재하는 경우에만)
        this.requestQuestionMemberIds.get(questionId)?.delete(memberId);
        client.emit('cancel_match', { message: "매칭을 취소했습니다." });

    }

    // 소켓 연결이 끊어졌을 때 처리
    handleDisconnect(client: Socket) {
        // 해당 소켓의 memberId 찾기
        let disconnectedMemberId: string | undefined;

        for (const [memberId, socket] of this.memberSockets.entries()) {
            if (socket === client) {
                disconnectedMemberId = memberId;
                break;
            }
        }

        if (disconnectedMemberId) {
            // memberSockets에서 제거
            this.memberSockets.delete(disconnectedMemberId);

            // 모든 대기열에서 제거
            for (const [questionId, members] of this.requestQuestionMemberIds.entries()) {
                if (members.has(disconnectedMemberId)) {
                    members.delete(disconnectedMemberId);
                }
            }
        }
    }
}