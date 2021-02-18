"use strict";
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var apollo_server_express_1 = require("apollo-server-express");
var app = express_1.default();
var port = 4000;
app.get('/', function (req, res) {
    res.send('Hello World!');
});
// A schema is a collection of type definitions (hence "typeDefs")
// that together define the "shape" of queries that are executed against
// your data.
var typeDefs = apollo_server_express_1.gql(templateObject_1 || (templateObject_1 = __makeTemplateObject(["\ntype Book {\n    title: String\n    author: String\n}\n"], ["\ntype Book {\n    title: String\n    author: String\n}\n"])));
var books = [
    {
        title: 'The Awakening',
        author: 'Kate Chopin',
    },
    {
        title: 'City of Glass',
        author: 'Paul Auster',
    },
];
var resolvers = {
    Query: {
        books: function () { return books; },
    },
};
var server = new apollo_server_express_1.ApolloServer({ typeDefs: typeDefs, resolvers: resolvers });
server.applyMiddleware({ app: app });
app.listen(port, function () {
    console.log("\uD83D\uDE80 Server ready at http://localhost:" + port + server.graphqlPath);
});
var templateObject_1;
