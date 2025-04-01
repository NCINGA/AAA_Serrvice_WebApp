import { ApolloClient, createHttpLink, InMemoryCache, split, ApolloLink } from '@apollo/client';
import { getMainDefinition } from '@apollo/client/utilities';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { createClient } from 'graphql-ws';
import { onError } from '@apollo/client/link/error';
import { removeTypenameFromVariables } from '@apollo/client/link/remove-typename';
import { Messages } from 'primereact/messages';
import React from 'react';

const toast = React.createRef<Messages>();

export function createApolloClient() {
    const token = localStorage.getItem("jwtToken");

    console.log("Creating Apollo client with token:", token);

    // Create an auth link instead of setting headers directly in httpLink
    const authLink = new ApolloLink((operation, forward) => {
        const token = localStorage.getItem("jwtToken");
        
        operation.setContext({
            headers: {
                Authorization: token ? `Bearer ${token}` : ''
            }
        });

        return forward(operation);
    });

    // HTTP link with current token
    const httpLink = createHttpLink({
        uri: '/graphql',
        
    });

    // WebSocket link for subscriptions with current token
    const wsLink = new GraphQLWsLink(
        createClient({
            url: '/graphql',
            connectionParams: {
                headers: {
                    Authorization: token ? `Bearer ${token}` : '',
                },
            },
        })
    );

    // Error handling link
    const errorLink = onError(({ graphQLErrors, networkError }) => {
        if (graphQLErrors) {
            graphQLErrors.forEach(({ message, extensions }) => {
                if (extensions?.code === 'UNAUTHENTICATED') {
                    window.location.href = "/login";
                    console.log(message);
                }
            });
        }

        if (networkError) {
            console.error(`[Network error]: ${networkError}`);
            //alert("Your session has expired!");
            toast.current?.show({
                severity: 'error',
                summary: 'Session Expired',
                detail: 'Your session has expired!',
                sticky: true,
                
            });
            setTimeout(() => {
                localStorage.removeItem('jwtToken');
                window.location.href = "/login";
              }, 2000);
            
        }
    });

    // Split link to route between WebSocket and HTTP based on operation type
    const splitLink = split(
        ({ query }) => {
            const definition = getMainDefinition(query);
            return (
                definition.kind === 'OperationDefinition' &&
                definition.operation === 'subscription'
            );
        },
        wsLink,    // WebSocket for subscriptions
        httpLink   // HTTP for queries and mutations
    );

    // Remove __typename from variables
    const removeTypenameLink = removeTypenameFromVariables();

    // Combine all links
    const combinedLink = ApolloLink.from([
        authLink,
        errorLink,
        removeTypenameLink,
        splitLink
    ]);

    // Create and return the client
    return new ApolloClient({
        link: combinedLink,
        cache: new InMemoryCache(),
        connectToDevTools: true,
    });
}

// Export a default client instance
export default createApolloClient();