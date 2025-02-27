const fs = require('fs');
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const PORT = 5000;

const itemsFilePath = path.join(__dirname, '../items.json');

const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const swaggerOptions = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'Task Management API',
            version: '1.0.0',
            description: 'API для управления задачами',
        },
        servers: [
            {
                url: 'http://localhost:3000',
            },
        ],
    },
    apis: ['openapi.yaml'],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));


app.use(bodyParser.json());

app.use(express.static('public'));

const readItemsFromFile = () => {
    const data = fs.readFileSync(itemsFilePath, 'utf-8');
    return JSON.parse(data);
};

app.get('/items', (req, res) => {
    const items = readItemsFromFile();
    res.json(items);
});


app.listen(PORT, () => {
    console.log("Server is running on http://localhost:", PORT);
});