import { Request, Response } from 'express';
import knex from '../database/connection';

class PointsController {
    async index(req: Request, res: Response) {
        const { city, uf, items } = req.query;

        const parsedItems = String(items)
            .split(',').map(item => Number(item.trim()));
        
        const points = await knex('points')
            .join('point_items', 'points.id', '=', 'point_items.point_id')
            .whereIn('point_items.item_id', parsedItems)
            .where('city', String(city))
            .where('uf', String(uf))
            .distinct().select('points.*');

        return res.json(points);
    }

    async show(req: Request, res: Response) {
        const { id } = req.params;

        const point = await knex('points').where('id', id).first();

        if(!point) {
            return res.status(400).json({ message: 'Ponto não achado' });
        }

        const items = await knex('items')
            .join('point_items', 'items.id', '=', 'point_items.item_id')
            .where('point_items.point_id', id)
            .select('items.title');

        return res.json({ point, items });
    }

    async create(req: Request, res: Response) {
        const {
            name,
            email,
            whatsapp,
            latitude,
            longitude,
            city,
            uf,
            items
        } = req.body;
        
        const trx = await knex.transaction();

        const point = {
            image: 'https://web.whatsapp.com/pp?e=https%3A%2F%2Fpps.whatsapp.net%2Fv%2Ft61.24694-24%2F71177214_212598030013488_1665040851114768966_n.jpg%3Foe%3D5EDA7E5E%26oh%3D23bdfb47ac1f46d638a0a7de3db4d7c2&t=l&u=553189225531%40c.us&i=1585113408&n=aWjbVXD%2B2munq6Snq2pT8SluXTzc04ds1W%2FGkf%2FGmEI%3D',
            name,
            email,
            whatsapp,
            latitude,
            longitude,
            city,
            uf
        };
        
        const insertedIds = await trx('points').insert(point);
        
        const point_id = insertedIds[0];
        
        const pointItems = items.map((item_id: number) => {
            return {
                item_id,
                point_id,
            }
        });
        
        await trx('point_items').insert(pointItems);
        
        await trx.commit();
        
        return res.json({
            id: point_id,
            ...point,
        })
    }
}

export default PointsController;