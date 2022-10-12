import express from 'express'
import {PrismaClient} from '@prisma/client'
import { convertHourStringToMinutes } from './utils/convert-hour-string'
import cors from 'cors'
import { convertMinutesToHourString } from './utils/convert-minutes-to-hour'

const app = express()
const prisma = new PrismaClient()

app.use(express.json())
app.use(cors())
// HTTP methods / API RESTful / HTTP Codes
// GET, POST, PT, PATCH, DELETE

app.get('/games', async (request, response) => {
    const games = await prisma.game.findMany({
        include: {
            _count:{
                select:{
                    ads: true,
                }
            }
        }
    })
    
    return response.json(games);
})

app.post('/games/:id/ads', async (request, response) => {
    const gameID:any =  request.params.id
    const body:any = request.body;

    
    const ad = await prisma.ad.create({
        data: {
            gameID,
            name: body.name,
            yearsPlaying: body.yearsPlaying,
            discord: body.discord,
            weekDays: body.weekDays.join(','),
            hourStart:convertHourStringToMinutes(body.hourStart) ,
            hourEnd:convertHourStringToMinutes(body.hourEnd) ,
            usaVoiceChannel: body.usaVoiceChannel,
        }
    })
    return response.status(201).json([ad]);
})

app.get('/games/:id/ads', async (request, response) =>{
    const gameID = request.params.id;

    const ads = await prisma.ad.findMany({
        select:{
            id: true,
            name: true,
            weekDays: true,
            usaVoiceChannel: true,
            yearsPlaying: true,
            hourStart: true,
            hourEnd: true,
            createdAt: true,
        },
        where:{
            gameID,
        },
        orderBy:{
            createdAt: 'desc'
        }
    })

    return response.json(ads.map(ad => {
        return{
            ...ad,
            weekDays: ad.weekDays.split(','),
            hourStart: convertMinutesToHourString(ad.hourStart),
            hourEnd: convertMinutesToHourString(ad.hourEnd)
        }
    }))
})

app.get('/ads/:id/discord', async (request, response) =>{
    const adID = request.params.id;

    const ad = await prisma.ad.findUniqueOrThrow({
        select: {
            discord: true,
        },
        where: {
            id: adID
        }
    })

    return response.json({
        discord: ad.discord,
    });
})

// listen a aplicação fica ouvindo novas requisições
app.listen(3333)
