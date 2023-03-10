const express = require("express");
const path = require("path");
// Import the ApolloServer class
const { ApolloServer } = require("apollo-server-express");

// Import the two parts of a GraphQL schema
const { typeDefs, resolvers } = require("./schemas");
const { authMiddleWare } = require("./utils/auth");
const routes = require("./routes");

// db connection
const db = require("./config/connection");

// Express server
const app = express();
const PORT = process.env.PORT || 3001;

// Apollo server
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: authMiddleWare,
});

//apply apollo server with express app
server.applyMiddleware({ app });

//middleware parsing
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const _dirname = path.dirname("");
const buildPath = path.join(_dirname, "../client/build");
app.use(express.static(buildPath));
// if we're in production, serve client/build as static assets
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../client/build")));
}

app.use(routes);
//Get all
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/build/index.html"));
});

db.once("open", () => {
  app.listen(PORT, () => {
    console.log(`API server running on port ${PORT}!`);
    console.log(`Use GraphQL at http://localhost:${PORT}${server.graphqlPath}`);
  });
});
