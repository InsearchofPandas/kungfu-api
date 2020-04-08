const { ApolloServer, gql } = require("apollo-server");
const {GraphQLScalarType} = require("graphql")
const { Kind } = require("graphql/language")

const typeDefs = gql`
scalar Date

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
    releaseDate: Date
    rating: Int
    status: Status
    actors: [Actor]
    }

    type Query {
        movies: [Movie]
        movie(id: ID): Movie
    }
`
const actors = [
    {
        id: "sheng",
        name: "Sheng Chiang"
    },
    {
        id: "gordon",
        name: "Gordon Liu"
    },
    {
        id: "jackie",
        name: "Jackie Chan"
    },
    {
        id: "bruce",
        name: "Bruce Lee"
    }
]

const movies = [
    {
        id: "289340njfksd92",
        title: "5 Deadly Venoms",
        releaseDate: new Date("8-12-1978"),
        rating: 5,
        actors: [{
            id: "sheng"
        }, {id: "jackie"}]
    },
    {
        id: '90342nfds9302fdm',
        title: "The 36th Chamber of Shaolin",
        releaseDate: new Date("02-02-1978"),
        rating: 5,
        actors: [{id: "gordon"}]
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
    },
    Movie:  { 
      actors: (obj) => {
          // good time to call DB to filter
        const actorIds = obj.actors.map(actor => actor.id)
        const filteredActors = actors.filter(actor => {
            return actorIds.includes(actor.id)
        })
        return filteredActors;
      }
      
   
    },

    Date: new GraphQLScalarType({
        name: "Date",
        description: "the date the film was released",
        parseValue(value) {
            // value from the client
            return new Date(value);
        },
        serialize(value) {
            //value to client
           return value.getTime(); 
        },
        parseLiteral(ast) {
            console.log(ast)
            if(ast.kind === Kind.INT) {
                return new Date(ast.value)
            }
            return null
        }
    })
};

const server = new ApolloServer({typeDefs, resolvers, introspection: true, playground: true});

server.listen({
    port: process.env.PORT || 4000
}).then(({ url }) => {
console.log(`Server started at ${url}`)
}); 