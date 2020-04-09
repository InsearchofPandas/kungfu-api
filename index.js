const { ApolloServer, gql } = require("apollo-server");
const {GraphQLScalarType} = require("graphql")
const { Kind } = require("graphql/language")
const mongoose = require('mongoose');

require('dotenv').config()


mongoose.connect(`mongodb+srv://${process.env.DB_MONGO_USER}:${process.env.DB_MONGO_PASS}@cluster0-yjvum.mongodb.net/test?retryWrites=true&w=majority`, {useNewUrlParser: true});
var db = mongoose.connection;

// Mongoose Schemas////////////////

var movieSchema = new mongoose.Schema({
    title: String,
    releaseDate: Date,
    rating: Number,
    status: String,
    actors: [String]
  });

  var Movie = mongoose.model('Movie', movieSchema);


//  Apollo GQL  type definitions and setup ///////////////
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

    input ActorInput {
        id: ID
    }

    input MovieInput {
        id: ID
    title: String
    releaseDate: Date
    rating: Int
    status: Status
    actors: [ActorInput]
    }

    type Mutation {
        addMovie(movie: MovieInput):  [Movie]
    }
`

// Static Data
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

//  resolver functions

const resolvers = {
    Query: {
        movies: async  () => {
            try {
                const allMovies = await Movie.find()
                return allMovies;
            } catch (error) {
                console.log(error);
                return [];
                
            }
            
            
        },
        movie: (obj, {id} , context, info) => {
            try {
                const foundMovie = Movie.findById(id)
                 return foundMovie
             }               
             catch (error) {
                console.log(error)
                return {}
            }
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

    Mutation: {
         addMovie: async ( obj, {movie}) => {
             
          try { const newMovie =  await Movie.create({
               ...movie
           }) 
           const allMovies = await Movie.find();
            return allMovies;
        } catch(e) {
            []
            console.log(e)
        }
        }

    },

   
};


// connecting to the server 

const server = new ApolloServer({typeDefs, resolvers, introspection: true, playground: true});

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  // we're connected!
  console.log('Connected to the DB 🤙' );
  
  
  
  server.listen({
      port: process.env.PORT || 4000
    }).then(({ url }) => {
        console.log(`Server started at ${url}`)
    });
}); 