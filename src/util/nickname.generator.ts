import { adjectives } from './adjectives';
import { nouns } from './nouns';

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
