const {ApolloServer, gql } = require('apollo-server');
const db = require('./database.js');

const typeDefs = gql(`
  type Actor {
    id: String!
    name: String!
    appearsIn: [Movie!]!
  }

  type Movie {
    id: String!
    title: String!
    starring: [Actor!]!
  }

  type MoviesStarring {
    name: String!
    movies: [Movie]!
  }

  type Query {
    actors: [Actor]
    movies: [Movie]
    actor(id: String!): Actor
    movie(id: String!): Movie
    moviesStarring(name: String!): MoviesStarring
}

  type NewMovie {
    id: String!
    title: String!
    starring: [String!]!
  }

  type Mutation {
    createMovie(
      title: String!,
      starring: [String!]!
    ): NewMovieOrError
  }

  type Error {
  id: String!,
  message: String!
}

  union NewMovieOrError = NewMovie | Error



`);
const resolvers = {
  NewMovieOrError: {
    __resolveType(obj, context, info){
      if(obj.message){
        return 'Error';
      }
      if(obj.title){
        return 'NewMovie';
      }
    },
  },
  Query: {
    actors: () => Object.values(db.actors),
    movies: () => Object.values(db.movies),
    actor: (parent, { id }) => db.actors[id],
    movie: (parent, { id }) => db.movies[id],
    moviesStarring: (parent, { name }) => {
      const actor = Object.values(db.actors).find((actor) => actor.name.toLowerCase() === name.toLowerCase());
      return {
        name,
        movies: actor.appearsIn
      };
    }
  },
  Mutation: {
    createMovie: (parent, { title, starring }) => {
      // We could validate and update a database here
      if(!title.length){
        return{
          id: "err-01",
          message: "Title should not be blank."
        }
      }
      return {
        id: 'new-id',
        title,
        starring
      };
    }
  }
};


  const server = new ApolloServer({typeDefs, resolvers});

  server.listen().then(({url}) => {
    console.log(`Server ready at ${url}`)
  });
