import { NextFunction, Request, Response } from "express";

const redisServer = require('./redisClient');

const getCatchedData = async (req: Request, res: Response, next: NextFunction) => {
    const { reqRoute } = req.query;

    const redisClient = await redisServer()

    await redisClient.get(reqRoute)
        .then((response: any) => {
            console.log({
                status: 'Success',
                message: "Catched data fetched successfully",
                data: response
            });
            return res.status(200).json({
                status: 'Success',
                message: "Catched data fetched successfully",
                data: response
            })
        })
        .catch((error: any) => {
            console.log({
                status: 'failed',
                message: "CatcFailed to fetched catched data",
                error: error
            });
            return res.status(403).json({
                status: 'failed',
                message: "Failed to fetched catched data",
                eessage: error
            })
        })
}

