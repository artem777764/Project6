const fs = require('fs');
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

const itemsFilePath = path.join(__dirname, '../items.json');

const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

// Swagger документация
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
    apis: ['openapi.yaml'], // укажите путь к файлам с аннотациями
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));


// Middleware для парсинга JSON
app.use(bodyParser.json());

app.use(express.static('public'));

// Массив для хранения задач
let items = require(itemsFilePath);


app.post('/items', (req, res) => {
    const { name, description, price, categories } = req.body;

    const categoriesList = categories.split(',');

    const newItem = {
        id: items[items.length - 1].id + 1,
        name,
        description,
        price,
        categoriesList
    };

    items.push(newItem);

    fs.writeFileSync(itemsFilePath, JSON.stringify(items, null, 2));
    
    res.status(201).json(newItem);
});

app.put('/items/:id', (req, res) => {
    const itemId = parseInt(req.params.id);
    let itemsJ = JSON.parse(fs.readFileSync(itemsFilePath));
    const item = itemsJ.find(i => i.id === itemId);

    if (item) {
        const { name, description, price, categories } = req.body;

        item.name = name;
        item.description = description;
        item.price = price;
        item.categoriesList = categories.split(',');

        fs.writeFileSync(itemsFilePath, JSON.stringify(itemsJ, null, 2));

        res.json(item);
    } else {
        res.status(404).json({ message: 'Task not found' });
    }
});

app.delete('/items/:id', (req, res) => {
    const itemId = parseInt(req.params.id);
    let itemsJ = JSON.parse(fs.readFileSync(itemsFilePath));
    itemsJ = itemsJ.filter(i => i.id !== itemId)

    fs.writeFileSync(itemsFilePath, JSON.stringify(itemsJ, null, 2));

    res.status(204).send();
});

// Запуск сервера
app.listen(PORT, () => {
    console.log("Server is running on http://localhost:", PORT);
});