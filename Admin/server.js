const fs = require('fs');
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

const itemsFilePath = path.join(process.cwd(), 'items.json');

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

let items = require(itemsFilePath);

// POST для добавления нового товара
app.post('/items', (req, res) => {
    const { name, description, price, categories } = req.body;

    // Конвертируем price в число, если оно передано как строка
    const priceNum = parseFloat(price);

    // Если цена некорректна (например, не число), можно вернуть ошибку
    if (isNaN(priceNum)) {
        return res.status(400).json({ message: 'Цена должна быть числом' });
    }

    const categoriesList = categories.split(',');

    const newItem = {
        id: items[items.length - 1].id + 1,
        name,
        description,
        price: priceNum,  // Используем число
        categoriesList
    };

    items.push(newItem);

    fs.writeFileSync(itemsFilePath, JSON.stringify(items, null, 2));

    res.status(201).json(newItem);
});

// PUT для обновления товара
app.put('/items/:id', (req, res) => {
    const itemId = parseInt(req.params.id);
    let itemsJ = JSON.parse(fs.readFileSync(itemsFilePath));
    const item = itemsJ.find(i => i.id === itemId);

    if (item) {
        const { name, description, price, categories } = req.body;

        // Преобразуем цену в число
        const priceNum = parseFloat(price);

        if (isNaN(priceNum)) {
            return res.status(400).json({ message: 'Цена должна быть числом' });
        }

        item.name = name;
        item.description = description;
        item.price = priceNum;
        item.categoriesList = categories.split(',');

        fs.writeFileSync(itemsFilePath, JSON.stringify(itemsJ, null, 2));

        res.json(item);
    } else {
        res.status(404).json({ message: 'Товар не найден' });
    }
});

// DELETE для удаления товара
app.delete('/items/:id', (req, res) => {
    const itemId = parseInt(req.params.id);
    let itemsJ = JSON.parse(fs.readFileSync(itemsFilePath));
    itemsJ = itemsJ.filter(i => i.id !== itemId);

    fs.writeFileSync(itemsFilePath, JSON.stringify(itemsJ, null, 2));

    res.status(204).send();
});

app.listen(PORT, () => {
    console.log("Server is running on http://localhost:", PORT);
});
