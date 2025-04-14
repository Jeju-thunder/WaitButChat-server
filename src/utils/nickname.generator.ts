
export const nouns = [
    "고양이",
    "강아지",
    "호랑이",
    "판다",
    "토끼",
    "거북이",
    "사자",
    "코끼리",
    "원숭이",
    "기린",
    "여우",
    "늑대",
    "곰",
    "오리",
    "펭귄",
    "코알라",
    "다람쥐",
    "햄스터",
    "하마",
    "물개"
];

export const adjectives = [
    "행복한",
    "즐거운",
    "신나는",
    "귀여운",
    "멋진",
    "화려한",
    "따뜻한",
    "차가운",
    "부드러운",
    "날카로운",
    "반짝이는",
    "웃긴",
    "예쁜",
    "똑똑한",
    "용감한",
    "느긋한",
    "활발한",
    "재미있는",
    "친절한",
    "작은"
];

/**
 * Generate a random nickname with format: adjective + noun
 * @returns string - Random nickname
 */
export function generateRandomNickname(): string {
    // Generate random indices for adjective and noun
    const randomAdjectiveIndex = Math.floor(Math.random() * adjectives.length);
    const randomNounIndex = Math.floor(Math.random() * nouns.length);

    // Select random adjective and noun
    const adjective = adjectives[randomAdjectiveIndex];
    const noun = nouns[randomNounIndex];

    // Combine them to create a nickname
    return `${adjective} ${noun}`;
}
