import 'reflect-metadata';
import express, { NextFunction, Request, Response } from 'express';
import "express-async-errors";

import createConnection from './database';
import { router } from './routes';
import { AppError } from './errors/AppError';

createConnection();

const app = express();

app.use(express.json());

app.use(router);

app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
    return (err instanceof AppError)
        ? res.status(err.statusCode).json({message: err.message})
        : res.status(500).json({message: `Internal server error ${err.message}`});
});

export { app };