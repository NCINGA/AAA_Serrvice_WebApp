import { ApolloClient, createHttpLink, InMemoryCache, split, ApolloLink } from '@apollo/client';
import { getMainDefinition } from '@apollo/client/utilities';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { createClient } from 'graphql-ws';
// import { persistCache } from 'apollo-cache-persist';
// import localForage from 'localforage';
import { removeTypenameFromVariables } from '@apollo/client/link/remove-typename';

// Token for authorization
const token = "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1c2VyIiwiZXhwIjoxNzI0Mjk2MjYwLCJzY29wZSI6Im1lc3NhZ2U6cmVhZCJ9.WcUZOcyMjlQQO_VTXvLTlnM5bUuuXJNiVgNI1EjHHSs";


const httpLink = createHttpLink({
    uri: '/graphql',
});

// WebSocket link for subscriptions
const wsLink = new GraphQLWsLink(
    createClient({
        url: '/graphql', //
        connectionParams: {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        },
    })
);

// Split link to route between WebSocket and HTTP based on operation type
const splitLink = split(
    ({ query }) => {
        const definition = getMainDefinition(query);
        return (
            definition.kind === 'OperationDefinition' &&
            definition.operation === 'subscription'
        );
    },
    wsLink, // WebSocket for subscriptions
    httpLink // HTTP for queries and mutations
);


const removeTypenameLink = removeTypenameFromVariables();


const cache = new InMemoryCache();
// (async () => {
//     await persistCache({
//         cache,
//         storage: localForage,
//     });
// })();


const combinedLink = ApolloLink.from([removeTypenameLink, splitLink]);


const client = new ApolloClient({
    link: combinedLink,
    cache: cache,
    connectToDevTools: true, // Enable Apollo DevTools
});

export default client;
