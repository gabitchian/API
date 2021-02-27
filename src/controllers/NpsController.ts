import { Request, Response } from "express";
import { getCustomRepository, Not, IsNull } from "typeorm";
import { SurveysUsersRepository } from "../repositories/SurveysUsersRespository";

class NpsController {

    async execute(req: Request, res: Response) {
        const { survey_id } = req.params;
        const surveysUsersRepository = getCustomRepository(SurveysUsersRepository);

        const surveysUsersResponses = await surveysUsersRepository.find({survey_id, value: Not(IsNull())});

        const detractors = surveysUsersResponses.filter((survey) => survey.value >= 0 && survey.value <= 6).length;
        const passives = surveysUsersResponses.filter((survey) => survey.value == 7 || survey.value == 8).length;
        const promoters = surveysUsersResponses.filter((survey) => survey.value == 9 || survey.value == 10).length;
        const totalAnswers = surveysUsersResponses.length;
        const calculate = Number((((promoters - detractors) / totalAnswers) * 100).toFixed(2));

        return res.status(200).json({
            detractors,
            passives,
            promoters,
            totalAnswers,
            nps: calculate
        });
    }
}

export { NpsController };