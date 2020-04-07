const { ApolloServer, gql } = require("apollo-server");

const typeDefs = gql`

    enum Status {
        WATCHED
        INTERESTED
        NOT_INTERESTED
        UNKNOWN
    }


    type Actor {
        id: ID!
        name: String!
    }

    type Movie {
    id: ID!
    title: String!
    releaseDate: String
    rating: Int
    status: Status
    actor: [Actor]
    }

    type Query {
        movies: [Movie]
        movie(id: ID): Movie
    }
`

const movies = [
    {
        id: "289340njfksd92",
        title: "5 Deadly Venoms",
        releaserDate: "8-12-1978",
        rating: 5,
        actor: [{
            id: "hehrhjbeuie",
            name: "Sheng Chiang"
        }]
    },
    {
        id: '90342nfds9302fdm',
        title: "The 36th Chamber of Shaolin",
        releaserDate: "2-2-1978",
        rating: 5
    }
];

const resolvers = {
    Query: {
        movies: () => {
            return movies;
        },
        movie: (obj, {id} , context, info) => {
            const foundMovie = movies.find((movie) => {
               return  movie.id === id
            })
            return foundMovie
        }
    }
};

const server = new ApolloServer({typeDefs, resolvers, introspection: true, playground: true});

server.listen({
    port: process.env.Port || 4000
}).then(({ url }) => {
console.log(`Server started at ${url}`)
}); 