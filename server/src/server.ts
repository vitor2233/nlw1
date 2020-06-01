import express from 'express';

const app = express();

app.get('/users', (req, res) => {
    res.json([
        'Vitor',
        'Gabriel'
    ]);
});

app.listen(3333);