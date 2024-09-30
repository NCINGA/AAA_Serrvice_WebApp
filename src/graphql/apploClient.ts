import {ApolloClient, createHttpLink, InMemoryCache, split} from '@apollo/client';
import {setContext} from '@apollo/client/link/context';
import {getMainDefinition} from '@apollo/client/utilities';
import {GraphQLWsLink} from "@apollo/client/link/subscriptions";
import {createClient} from "graphql-ws";

const token = "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1c2VyIiwiZXhwIjoxNzI0Mjk2MjYwLCJzY29wZSI6Im1lc3NhZ2U6cmVhZCJ9.WcUZOcyMjlQQO_VTXvLTlnM5bUuuXJNiVgNI1EjHHSs";

// const authLink = setContext(() => {
//     return {
//         headers: {
//             "Authorization": `Bearer ${token}`,
//             "content-type": "application/json"
//         }
//     };
// });

const httpLink = createHttpLink({
    uri: '/graphql',
});

const wsLink = new GraphQLWsLink(createClient({
    url: '/graphql'
}));

const splitLink = split(
    ({query}) => {
        const definition = getMainDefinition(query);
        return (
            definition.kind === 'OperationDefinition' &&
            definition.operation === 'subscription'
        );
    },
    wsLink,
   httpLink
);

const client = new ApolloClient({
    link: splitLink,
    cache: new InMemoryCache(),
    connectToDevTools: true
});

export default client;
