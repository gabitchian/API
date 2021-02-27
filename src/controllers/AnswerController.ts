import { Request, Response } from "express";
import { getCustomRepository } from "typeorm";
import { AppError } from "../errors/AppError";
import { SurveysUsersRepository } from "../repositories/SurveysUsersRespository";

class AnswerController {
    async execute(req: Request, res: Response) {
       const { value } = req.params;
       const { u } = req.query;

       const surveysUsersRepository = getCustomRepository(SurveysUsersRepository);

       const surveyUser = await surveysUsersRepository.findOne({
           id: String(u)
       });

       if(!surveyUser) throw new AppError("Survey User does not exist");

       await surveysUsersRepository.save({...surveyUser, value: Number(value)});

       return res.status(200).json({...surveyUser, value: Number(value)});
    }
}

export { AnswerController };