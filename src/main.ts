import express from 'express';
import bodyParser from 'body-parser';
import { GraphQLList, GraphQLNonNull, GraphQLObjectType, GraphQLSchema, GraphQLString } from 'graphql';
import { PubSub } from 'graphql-subscriptions';
import { createServer } from 'http';
import { ApolloServer } from 'apollo-server-express';

const app = express();
const port = 4000;

interface Book {
    title: string,
    author: string
}

let books: Book[] = [
    {
        title: 'The Awakening',
        author: 'Kate Chopin',
    },
    {
        title: 'City of Glass',
        author: 'Paul Auster',
    },
];

const pubsub = new PubSub();

const bookType = new GraphQLObjectType({
    name: 'Book',
    fields: {
        title: { type: GraphQLString },
        author: { type: GraphQLString }
    }
})

const myGraphQLSchema = new GraphQLSchema({
    query: new GraphQLObjectType({
        name: 'Query',
        description: '...',
        fields: () => ({
            books: {
                type: new GraphQLList(bookType),
                resolve: () => books
            }
        })
    }),
    mutation: new GraphQLObjectType({
        name: 'Mutation',
        description: '...',
        fields: () => ({
            addBook: {
                type: bookType,
                args: {
                    title: { type: GraphQLNonNull(GraphQLString) },
                    author: { type: GraphQLNonNull(GraphQLString) },
                },
                resolve: async (src, {title, author}) => {
                    console.log('➕ Add book!', title, author);
                    const book = { title, author };
                    books.push(book)
                    pubsub.publish('NEW_BOOK', {book: book});
                    return book;
                }
            },
            removeBook: {
                type: GraphQLList(bookType),
                args: {
                    title: { type: GraphQLString },
                    author: { type: GraphQLString },
                },
                resolve: async (src, {title, author}) => {
                    console.log('➖ Delete book!', {title, author});
                    let booksDeleted: Book[] = [];
                    books = books.filter((b) => {
                        let isMatch = true;
                        if (title) {
                            isMatch = b.title === title
                        }
                        if (author) {
                            isMatch = b.author === author
                        }
                        if (isMatch) {
                            booksDeleted.push(b);
                        }
                        return !isMatch ? b : null;
                    })
                    return booksDeleted;
                }
            }
        }),
    }),
    subscription: new GraphQLObjectType({
        name: 'Subscription',
        description: '...',
        fields: () => ({
            book: {
                type: bookType,
                subscribe: () => pubsub.asyncIterator(['NEW_BOOK'])
            }
        })
    })
})

app.use('/graphql', bodyParser.json());

const apolloServer = new ApolloServer({
    schema: myGraphQLSchema,
    subscriptions: {
        path: '/subscriptions',
        onConnect: () => {
            console.log('✅ Client connected');
        },
        onDisconnect: () => {
            console.log('❎ Client disconnected')
        },
    }
});
apolloServer.applyMiddleware({
    app, cors: { origin: 'https://studio.apollographql.com' }
});

const httpServer = createServer(app);
apolloServer.installSubscriptionHandlers(httpServer);

httpServer.listen(port, () => {
    console.log(`🚀 Server ready at http://localhost:${port}${apolloServer.graphqlPath}`)
    console.log(`💥 Server ready at http://localhost:${port}${apolloServer.subscriptionsPath}`)
})

setInterval(() => {
    const book = {
        book: {
            author: Math.random().toString(36).substr(3),
            title: Math.random().toString(36).substr(3)
        }
    };
    pubsub.publish('NEW_BOOK', book);
}, 5000);

pubsub.subscribe('NEW_BOOK', (book) => console.log('📚 New Book!', book));