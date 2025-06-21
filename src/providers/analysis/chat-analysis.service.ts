import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import axios from 'axios';

@Injectable()
export class ChatAnalysisService {
    private readonly apiKey: string;

    constructor(
        private readonly configService: ConfigService,
    ) {
        this.apiKey = this.configService.get<string>('OPENROUTER_API_KEY') ?? '';
    }

    async analyzeChat(nickname: string, chat: string): Promise<string> {
        console.log("chat: ", chat);

        const prompt = `
        당신은 채팅 분석 AI Manager 입니다.
        내용은 크게 "당신을 위한 키워드", "상대와의 대화 AI 분석"으로 구분해서 대답합니다.

        사용자의 이름은 ${nickname}입니다.
        사용자가 나눈 대화를 기반으로 분석하고, 더 나은 대화를 할 수 있도록 조언해주세요.
        사용자 이름 대신 당신이라고 명명해주세요.

        결과로 나와야 하는 출력 형태는 JSON 형식입니다.

        JSON 구조와 예시는 다음과 같습니다.

        JSON 구조에서, summary_tags는 6개를 추천해주세요.
        tags에 카테고리는 고정할것이고, 카테고리는 다음과 같습니다.
        대화 방식, 커뮤니케이션 스타일, 감정 표현, 일 처리 태도, 관계 성향

        JSON 구조에서, contents는 3문장으로 작성해주세요.
        1,2번째 문장은 현재 대화를 분석해주세요.
        3번째 문장은 더 나은 대화를 할 수 있게 조언해주세요.

        [JSON구조]
        {
        "response": {
            "summary_tags": [
            {"category": "대화 방식", "content": "🗣️ 적극적 소통형"},
            {"category": "커뮤니케이션 스타일", "content": "💬 친근한 캐주얼형"},
            {"category": "감정 표현", "content": "😄 활기찬 긍정 표현형"},
            {"category": "일 처리 태도", "content": "🤝 유연한 협조형"},
            {"category": "관계 성향", "content": "💖 따뜻한 지지형"},
            {"category": "대화 방식", "content": "👂 공감적 경청형"}
            ],
            "contents": [
            "당신은 친근한 어투와 함께 긍정적인 반응을 보이며, 상대방의 말에 깊이 공감하고 상황을 빠르게 이해하는 편입니다.",
            "상황 변화에 유연하게 대처하며, 감사 표현이나 도움 제안을 통해 관계를 원만하게 이끌어가는 데 적극적인 모습을 보입니다.",
            "지금처럼 긍정적이고 배려 깊은 태도를 유지하면서, 중요한 순간에는 자신의 생각이나 기대를 명확히 전달하는 것이 더 나은 결과를 가져올 수 있습니다."
            ]
        }
        }

        [대화 내용]
        ${chat}
        `

        console.log("prompt: ", prompt);

        if (!this.apiKey) {
            throw new Error('OpenRouter API 키가 설정되지 않았습니다.');
        }

        try {
            const response = await axios.post(
                'https://openrouter.ai/api/v1/chat/completions',
                {
                    model: 'google/gemma-3n-e4b-it:free',
                    messages: [
                        {
                            role: 'user',
                            content: prompt
                        }
                    ]
                },
                {
                    headers: {
                        'Authorization': `Bearer ${this.apiKey}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            return response.data.choices[0].message.content;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                throw new Error(`OpenRouter API 요청 실패: ${error.response?.data?.error?.message || error.message}`);
            }
            throw error;
        }
    }
}

