import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import GetChatsResponse, { ChatDto } from "./dto/response/get-chats-response.dto";
import GetChatRoomsResponse from "./dto/response/get-chatrooms-response.dto";
import { member } from "@prisma/client";
import { ChatRepository } from "./chat.repository";
import { ChatAnalysisResult, GetChatAnalysisListResponse, GetChatAnalysisResponse } from "./dto/response/get-chat-analysis-response.dto";
import { ChatAnalysisService } from "src/providers/analysis/chat-analysis.service";
import { CreateChatAnalysisResponse } from "./dto/response/create-chat-analysis-response.dto";

@Injectable()
export default class ChatService {
    constructor(
        private readonly chatRepository: ChatRepository,
        private readonly chatAnalysisService: ChatAnalysisService
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

    async getChatAnalysis(member: member, id: number): Promise<GetChatAnalysisListResponse> {
        const chatroom = await this.chatRepository.getChatRoomsByIdForMember(member.id, id);
        if (!chatroom) {
            throw new NotFoundException("채팅방을 찾을 수 없습니다.");
        }

        const anonymous_member = chatroom.matches.find((match) => 
            match.anonymousMembers.member_id === member.id
        )?.anonymousMembers;

        if (!anonymous_member) {
            throw new NotFoundException("익명 채팅 사용자를 찾을 수 없습니다.");
        }

        const { id: anonymous_member_id, nickname } = anonymous_member;

        // 채팅방에 해당하는 List 조회
        const anonymous_members_chat_analysis = await this.chatRepository.getAnonymousMembersChatAnalysis(anonymous_member_id);

        const chat_analysis: ChatAnalysisResult[] = anonymous_members_chat_analysis.map((analysis) => {
            if (!analysis.analysis_result || typeof analysis.analysis_result !== 'string') {
                throw new NotFoundException("분석 결과가 없거나 잘못된 형식입니다.");
            }
            const analysisResult = JSON.parse(analysis.analysis_result);
            console.log("analysisResult: ", analysisResult);
            
            return {
                created_at: analysis.created_at.toISOString(),
                updated_at: analysis.updated_at?.toISOString() ?? '',
                summary_tags: analysisResult.summary_tags.map((tag) => ({
                    category: tag.category,
                    content: tag.content
                })),
                contents: analysisResult.contents
            };
        });

        return {
            analysis_results: chat_analysis
        };
    }

    private validateAnalysisResult(analysisResult: any): void {
        // 기본 구조 검증
        if (!analysisResult.response || 
            !Array.isArray(analysisResult.response.summary_tags) || 
            !Array.isArray(analysisResult.response.contents)) {
            throw new BadRequestException("분석에 실패했습니다. 외부 서비스 오류입니다.");
        }

        // summary_tags 구조 검증
        const isValidSummaryTags = analysisResult.response.summary_tags.every((tag: any) => 
            tag && typeof tag === 'object' && 
            typeof tag.category === 'string' && 
            typeof tag.content === 'string'
        );

        // contents 구조 검증
        const isValidContents = analysisResult.response.contents.every((content: any) => 
            typeof content === 'string'
        );

        if (!isValidSummaryTags || !isValidContents) {
            throw new BadRequestException("분석에 실패했습니다. 외부 서비스 오류입니다.");
        }
    }

    async createChatAnalysis(member: member, id: number): Promise<CreateChatAnalysisResponse> {
        const chatroom = await this.chatRepository.getChatRoomsByIdForMember(member.id, id);
        if (!chatroom) {
            throw new NotFoundException("채팅방을 찾을 수 없습니다.");
        }
        const anonymous_member = chatroom.matches.find((match) => 
            match.anonymousMembers.member_id === member.id
        )?.anonymousMembers;
        if (!anonymous_member) {
            throw new NotFoundException("익명 채팅 사용자를 찾을 수 없습니다.");
        }

        const { id: anonymous_member_id, nickname } = anonymous_member;
        
        const chat_analysis = await this.chatAnalysisService.analyzeChat(nickname, chatroom.chats.map((chat) => `${chat.created_at.toISOString()} - ${chat.createdByAnonymousMember.nickname}: ${chat.content}`).join("\n"));
        console.log("chat_analysis: ", chat_analysis);

        // JSON 파싱
        const replaced_chat_analysis = chat_analysis.replace("```json", "").replace("```", "");
        
        console.log("replaced chat_analysis: ", replaced_chat_analysis);
        const analysisResult = JSON.parse(replaced_chat_analysis);

        // JSON 구조 검증
        this.validateAnalysisResult(analysisResult);

        const now = new Date();

        // DTO 구조에 맞게 변환
        const chatAnalysisResult = {
            created_at: now.toISOString(),
            updated_at: now.toISOString(),
            summary_tags: analysisResult.response.summary_tags.map((tag: any) => ({
                category: tag.category,
                content: tag.content
            })),
            contents: analysisResult.response.contents
        };

        // 데이터베이스에 저장
        const analysis = await this.chatRepository.createAnonymousMembersChatAnalysis(anonymous_member_id, chatAnalysisResult, now);

        return {
            id: analysis.id
        }
    }
}
