import express, { Request, Response } from 'express';
import cors from 'cors';
import { PrismaClient } from "@prisma/client";
import { generateToken } from './auth';

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

interface CreateTestRequest {
  name: string;
  description?: string;
  questions: {
    text: string;
    options: any;
    answer: string;
  }[];
}

app.post('/tests', async (req: Request, res: Response) => {
  try {
    const { name, description, questions }: CreateTestRequest = req.body;
    const test = await prisma.test.create({
      data: {
        name,
        description,
      },
    });

    const questionsWithTokens = await Promise.all(
      questions.map(async (question) => {
        const token = generateToken(test.id.toString());
        const createdQuestion = await prisma.question.create({
          data: {
            text: question.text,
            options: question.options,
            answer: question.answer,
            testId: test.id,
            token,
          },
        });
        return createdQuestion;
      })
    );

    res.json({
      test,
      questions: questionsWithTokens,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to create test and questions' });
  }
});

app.get('/tests', async (_req: Request, res: Response) => {
  try {
    const tests = await prisma.test.findMany({
      include: {
        questions: true, 
      },
    });
    res.json(tests);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch tests' });
  }
});

app.get('/', (_req: Request, res: Response) => {
  res.send('Welcome to the Test and Question API!');
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on http://localhost:${port}`));
