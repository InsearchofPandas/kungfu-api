const { ApolloServer, gql } = require("apollo-server");
const {GraphQLScalarType} = require("graphql")
const { Kind } = require("graphql/language")
const mongoose = require('mongoose');

require('dotenv').config()


mongoose.connect(`mongodb+srv://${process.env.DB_MONGO_USER}:${process.env.DB_MONGO_PASS}@cluster0-yjvum.mongodb.net/test?retryWrites=true&w=majority`, {useNewUrlParser: true, useUnifiedTopology: true });
var db = mongoose.connection;

// Mongoose Schemas////////////////

const movieSchema = new mongoose.Schema({
    title: String,
    releaseDate: Date,
    rank: Number,
    actors: [String],
    director: [String]
  });

  const Movie = mongoose.model('Movie', movieSchema);

  const actorSchema = new mongoose.Schema({
    name: String,
    role: String, 
    secondaryRole: String,
    tertiaryRole: String,
    movies: [String],
    dateBorn: Date,
    locationBorn: String,
    nationality: String 
});

const Actor = mongoose.model('Actor', actorSchema);
 

const directorSchema = new mongoose.Schema({
    name: String,
    role: String, 
    secondaryRole: String,
    tertiaryRole: String,
    movies: [String],
    dateBorn: Date,
    locationBorn: String,
    nationality: String 
});

const Director = mongoose.model('Director', directorSchema);
 


//  Apollo GQL  type definitions and setup ///////////////
const typeDefs = gql`
scalar Date
    enum  role {
        DIRECTOR
        PRODUCER 
        WRITER
        ACTOR
        STUNT_ARTIST
        MARTIAL_ARTIST
        NA
    }

    enum  secondaryRole {
        DIRECTOR
        PRODUCER 
        WRITER
        ACTOR
        STUNT_ARTIST
        MARTIAL_ARTIST
        NA
    }

    enum  tertiaryRole {
        DIRECTOR
        PRODUCER 
        WRITER
        ACTOR
        STUNT_ARTIST
        MARTIAL_ARTIST
        NA
    }


    type Actor {
        id: ID!
        name: String!
        role: role 
        secondaryRole: secondaryRole
        tertiaryRole: tertiaryRole
        movies: [Movie]
        dateBorn: Date
        locationBorn: String
        nationality: String 

    }

    type Director {
        id: ID!
        name: String!
        role: role 
        secondaryRole: secondaryRole
        tertiaryRole: tertiaryRole
        movies: [Movie]
        dateBorn: Date
        locationBorn: String
        nationality: String   
    }


    type Movie {
    id: ID!
    title: String!
    releaseDate: Date
    rank: Int
    director: [Director]
    actors: [Actor]
    }

    type Query {
        movies: [Movie]
        movie(id: ID): Movie
        actors: [Actor]
        actor(id: ID): Actor
        directors: [Director]
        director(id: ID): Director
    }

   

    input DirectorInput {
        id: ID
        name: String!
        role: role 
        secondaryRole: secondaryRole
        tertiaryRole: tertiaryRole
        dateBorn: Date
        locationBorn: String
        nationality: String 
        movies: [ID]
    }

    input DirectorUpdate {
        id: ID!
        name: String
        role: role 
        secondaryRole: secondaryRole
        tertiaryRole: tertiaryRole
        dateBorn: Date
        locationBorn: String
        nationality: String 
        movies: [ID]
    }
    

    input ActorInput {
        id: ID
        name: String!
        role: role 
        secondaryRole: secondaryRole
        tertiaryRole: tertiaryRole
        dateBorn: Date
        locationBorn: String
        nationality: String 
        movies: [ID]
    }

    input ActorUpdate {
        id: ID!
        name: String
        role: role 
        secondaryRole: secondaryRole
        tertiaryRole: tertiaryRole
        dateBorn: Date
        locationBorn: String
        nationality: String 
        movies: [ID]
    }

    input MovieUpdate {
        id: ID!
        title: String
        releaseDate: Date
        rank: Int
        actors: [ID]
        director: [ID] 
    }

    input MovieInput {
        id: ID
        title: String!
        releaseDate: Date
        rank: Int
        actors: [ID]
        director: [ID] 
    }

    type Mutation {
        addMovie(movie: MovieInput):  [Movie]
        updateMovie(movie: MovieUpdate): [Movie]
        addActor(actor: ActorInput): [Actor]
        updateActor(actor: ActorUpdate): [Actor]
        addDirector(director: DirectorInput): [Director]
        updateDirector(director: DirectorUpdate): [Director]
    }
`




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
        movie: async (obj, {id} , context, info) => {
            try {
                const foundMovie = Movie.findById(id)
                 return foundMovie
             }               
             catch (error) {
                console.log(error)
                return {}
            }
        },
        actors:  async () => {
            try {
                const allActors = await Actor.find()
                return allActors
            } catch (error) {
                console.log(error)
                return []
            }
        },
        actor: async (obj, {id} , context, info) => {
            try {
                const foundActor = Actor.findById(id)
                 return foundActor
             }               
             catch (error) {
                console.log(error)
                return {}
            }
        },
        directors: async () => {
            try {
                const allDirectors = await Director.find()
                return allDirectors
            } catch (error) {
                console.log(error)
                return []
            }
        },
        director: async (obj, {id} , context, info) => {
            try {
                const foundDirector = Director.findById(id)
                 return foundDirector
             }               
             catch (error) {
                console.log(error)
                return {}
            }
        },
          
    },
    Movie:  { 
      actors: (obj) => {
        //   console.log(obj)
        const filteredActors  = obj.actors.map(id => {
            return Actor.findById(id)
        })
        // console.log(filteredActors);
        return filteredActors;
      },
      director: (obj) => {
        //   console.log(obj)
        const filteredDirector  = obj.director.map(id => {
            return Director.findById(id)
        })
        // console.log(filteredActors);
        return filteredDirector;
      }
    },
    Actor: {
        movies: (obj) => {
            const filteredMovies = obj.movies.map(id => {
                return Movie.findById(id)
            })
            return filteredMovies
        } 
    },
    Director: {
        movies: (obj) => {
            const filteredMovies = obj.movies.map(id => {
                return Movie.findById(id)
            })
            return filteredMovies
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
        },
        updateMovie: async ( obj, {movie}) => {
            try { 
                const newMovie =  await Movie.updateOne(
                    { _id: movie.id},
                    {$set: {...movie}}
                    );

             const allMovies = await Movie.find();
              return allMovies;
          } catch(e) {
              []
              console.log(e)
          }
          },
        addActor: async ( obj, {actor}) => {
            try { const newActor =  await Actor.create({
                 ...actor
             }) 
             const allActors = await Actor.find();
              return allActors;
          } catch(e) {
              []
              console.log(e)
          }
          },
          updateActor: async ( obj, {actor}) => {
            try { 
                const newActor =  await Actor.updateOne(
                    { _id: actor.id},
                    {$set: {...actor}}
                    );

             const allActors = await Actor.find();
              return allActors;
          } catch(e) {
              []
              console.log(e)
          }
          },
          addDirector: async ( obj, {director}) => {
            try { const newDirector =  await Director.create({
                 ...director
             }) 
             const allDirectors = await Director.find();
              return allDirectors;
          } catch(e) {
              []
              console.log(e)
          }
          },
          updateDirector: async ( obj, {director}) => {
            try { 
                const newDirector =  await Director.updateOne(
                    { _id: director.id},
                    {$set: {...director}}
                    );

             const allDirectors = await Director.find();
              return allDirectors;
          } catch(e) {
              []
              console.log(e)
          }
          },

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