import { Request, Response } from 'express';
import { getCustomRepository } from 'typeorm';
import { resolve } from 'path';

import { SurveysRepository } from '../repositories/SurveysRepository';
import { SurveysUsersRepository } from '../repositories/SurveysUsersRespository';
import { UsersRepository } from '../repositories/UsersRepository';
import SendMailService from '../services/SendMailService';
import { AppError } from '../errors/AppError';

class SendMailController {

    async execute(req: Request, res: Response) {
        const { email, survey_id } = req.body;

        const usersRepository = getCustomRepository(UsersRepository);
        const surveysRepository = getCustomRepository(SurveysRepository);
        const surveysUsersRepository = getCustomRepository(SurveysUsersRepository);

        const userExists = await usersRepository.findOne({email});

        if(!userExists) throw new AppError("User does not exist");

        const surveyExists = await surveysRepository.findOne({ id: survey_id});

        if(!surveyExists) throw new AppError("Survey does not exist");

        const surveyUserExists = await surveysUsersRepository.findOne({
            where: {
                user_id: userExists.id, value: null,
                survey_id: surveyExists.id
            },
            // relations: ["user", "survey"]
        });

        const npsPath = resolve(__dirname, "..", "views", "emails", "npsMail.hbs");

        const variables = {
            link: process.env.URL_MAIL,
            name: userExists.name,
            title: surveyExists.title,
            description: surveyExists.description
        }

        if(surveyUserExists) {
            await SendMailService.execute(email, surveyExists.title, {...variables, id: surveyUserExists.id}, npsPath);

            return res.status(201).json(surveyUserExists);
        }

        const surveyUser = surveysUsersRepository.create({
            user_id: userExists.id,
            survey_id
        });

        await surveysUsersRepository.save(surveyUser);

        await SendMailService.execute(email, surveyExists.title, {...variables, id: surveyUser.id}, npsPath);

        return res.status(201).json(surveyUser);
    }
}

export { SendMailController }