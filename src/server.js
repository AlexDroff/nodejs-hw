import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { errors } from 'celebrate';
import { connectMongoDB } from './db/connectMongoDB.js';
import { logger } from './middleware/logger.js';
import { notFoundHandler } from './middleware/notFoundHandler.js';
import { errorHandler } from './middleware/errorHandler.js';
import notesRoutes from './routes/notesRoutes.js';

const app = express();
const PORT = process.env.PORT ?? 3000;

// Глобальні middleware
app.use(logger);
app.use(express.json());
app.use(cors());

// Тестовий маршрут для Render
app.get('/', (req, res) => {
  res.send('API is running');
});

// Основні маршрути
app.use(notesRoutes);

// 404 — якщо маршрут не знайдено
app.use(notFoundHandler);

// Обробка помилок валідації celebrate
app.use(errors());

// Глобальна обробка помилок
app.use(errorHandler);

// Підключення до MongoDB
await connectMongoDB();

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
