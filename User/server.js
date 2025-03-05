const fs = require('fs');
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@apollo/server/express4');
const { gql } = require('graphql-tag');

const app = express();
const PORT = 4221;

const itemsFilePath = path.join(__dirname, '../items.json');

const readItemsFromFile = () => {
    const data = fs.readFileSync(itemsFilePath, 'utf-8');
    return JSON.parse(data);
};

const generateHTML = (item, fields) => {
    const parts = [];

    if (fields.includes('id')) parts.push(`<p><strong>ID:</strong> ${item.id}</p>`);
    if (fields.includes('name')) parts.push(`<h3>${item.name}</h3>`);
    if (fields.includes('description')) parts.push(`<p>${item.description}</p>`);
    if (fields.includes('price')) parts.push(`<p><strong>Цена:</strong> ${item.price} руб.</p>`);
    if (fields.includes('categoriesList')) {
        const categories = item.categoriesList.join(', ');
        parts.push(`<p><strong>Категории:</strong> ${categories}</p>`);
    }

    return `<div class="item-card">${parts.join('')}</div>`;
};

const typeDefs = gql`
    type Item {
        id: ID!
        name: String!
        description: String!
        price: Int!
        categoriesList: [String!]!
    }

    type ItemHTML {
        html: String!
    }

    type Query {
        items(fields: [String!]!): [ItemHTML!]!
    }
`;

const resolvers = {
    Query: {
        items: (_, {fields}) => {
            const items = readItemsFromFile();
            return items.map(item => ({
                html: generateHTML(item, fields)
            }));
        },
    },
};

const startServer = async () => {
    const apolloServer = new ApolloServer({ typeDefs, resolvers });
    await apolloServer.start();

    app.use(bodyParser.json());
    app.use(express.static('public'));

    app.use('/graphql', expressMiddleware(apolloServer));

    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}/graphql`);
    });
};

startServer();
