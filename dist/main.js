"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var body_parser_1 = __importDefault(require("body-parser"));
var graphql_1 = require("graphql");
var graphql_subscriptions_1 = require("graphql-subscriptions");
var http_1 = require("http");
var apollo_server_express_1 = require("apollo-server-express");
var app = express_1.default();
var port = 4000;
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
var pubsub = new graphql_subscriptions_1.PubSub();
var bookType = new graphql_1.GraphQLObjectType({
    name: 'Book',
    fields: {
        title: { type: graphql_1.GraphQLString },
        author: { type: graphql_1.GraphQLString }
    }
});
var myGraphQLSchema = new graphql_1.GraphQLSchema({
    query: new graphql_1.GraphQLObjectType({
        name: 'Query',
        description: '...',
        fields: function () { return ({
            books: {
                type: new graphql_1.GraphQLList(bookType),
                resolve: function () { return books; }
            }
        }); }
    }),
    mutation: new graphql_1.GraphQLObjectType({
        name: 'Mutation',
        description: '...',
        fields: function () { return ({
            addBook: {
                type: bookType,
                args: {
                    title: { type: graphql_1.GraphQLNonNull(graphql_1.GraphQLString) },
                    author: { type: graphql_1.GraphQLNonNull(graphql_1.GraphQLString) },
                },
                resolve: function (src, _a) {
                    var title = _a.title, author = _a.author;
                    return __awaiter(void 0, void 0, void 0, function () {
                        var book;
                        return __generator(this, function (_b) {
                            console.log('➕ Add book!', title, author);
                            book = { title: title, author: author };
                            books.push(book);
                            pubsub.publish('NEW_BOOK', { book: book });
                            return [2 /*return*/, book];
                        });
                    });
                }
            },
            removeBook: {
                type: graphql_1.GraphQLList(bookType),
                args: {
                    title: { type: graphql_1.GraphQLString },
                    author: { type: graphql_1.GraphQLString },
                },
                resolve: function (src, _a) {
                    var title = _a.title, author = _a.author;
                    return __awaiter(void 0, void 0, void 0, function () {
                        var booksDeleted;
                        return __generator(this, function (_b) {
                            console.log('➖ Delete book!', { title: title, author: author });
                            booksDeleted = [];
                            books = books.filter(function (b) {
                                var isMatch = true;
                                if (title) {
                                    isMatch = b.title === title;
                                }
                                if (author) {
                                    isMatch = b.author === author;
                                }
                                if (isMatch) {
                                    booksDeleted.push(b);
                                }
                                return !isMatch ? b : null;
                            });
                            return [2 /*return*/, booksDeleted];
                        });
                    });
                }
            }
        }); },
    }),
    subscription: new graphql_1.GraphQLObjectType({
        name: 'Subscription',
        description: '...',
        fields: function () { return ({
            book: {
                type: bookType,
                subscribe: function () { return pubsub.asyncIterator(['NEW_BOOK']); }
            }
        }); }
    })
});
app.use('/graphql', body_parser_1.default.json());
var apolloServer = new apollo_server_express_1.ApolloServer({
    schema: myGraphQLSchema,
    subscriptions: {
        path: '/subscriptions',
        onConnect: function () {
            console.log('✅ Client connected');
        },
        onDisconnect: function () {
            console.log('❎ Client disconnected');
        },
    }
});
apolloServer.applyMiddleware({
    app: app,
    cors: { origin: 'https://studio.apollographql.com' }
});
var httpServer = http_1.createServer(app);
apolloServer.installSubscriptionHandlers(httpServer);
httpServer.listen(port, function () {
    console.log("\uD83D\uDE80 Server ready at http://localhost:" + port + apolloServer.graphqlPath);
    console.log("\uD83D\uDCA5 Server ready at http://localhost:" + port + apolloServer.subscriptionsPath);
});
setInterval(function () {
    var book = {
        book: {
            author: Math.random().toString(36).substr(3),
            title: Math.random().toString(36).substr(3)
        }
    };
    pubsub.publish('NEW_BOOK', book);
}, 5000);
pubsub.subscribe('NEW_BOOK', function (book) { return console.log('📚 New Book!', book); });
