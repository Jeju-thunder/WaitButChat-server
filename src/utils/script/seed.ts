import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import { seedQuestion1 } from './seed_data/seed_question';

const prisma = new PrismaClient();

async function main() {

    // Read the JSON file
    const questionData = seedQuestion1;

    // Map the questions to match the schema
    const questions = questionData.questions.map((q) => ({
        title: q.title,
        content: q.content,
        created_at: new Date(),
        updated_at: new Date(),
    }));

    // Insert the questions
    await prisma.question.createMany({
        data: questions,
    });

    console.log('✅ Seed data inserted successfully!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
