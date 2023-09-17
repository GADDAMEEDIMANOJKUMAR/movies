const express = require("express");
const app = express();
app.use(express.json());

const path = require("path");
const dbPath = path.join(__dirname, "moviesData.db");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

let db = null;

const initializeMoviesData = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
initializeMoviesData();

const convertMoviesObjectToResponseObject = (dbObject) => {
  return {
    moviesId: dbObject.movies_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  };
};

const convertDirectorObjectToResponseObject = (dbObject) => {
  return {
    directorId: dbObject.director_id,
    directorName: dbObject.director_name,
  };
};

app.get("/movies/", async (request, response) => {
  const getMovieQuery = `
    SELECT
      movie_name
    FROM
      movie;`;
  const movie = await db.all(getMovieQuery);
  response.send(movie.map((each) => convertMoviesObjectToResponseObject(each)));
});

app.post("/movies/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const updateQuery = `
    INSERT INTO 
     movies (directorId,movieName,leadActor)
     VALUES (
         ${directorId},
         ${movieName},
         ${leadActor},
     );`;
  await db.run(updateQuery);
  response.send("Movie Successfully Added");
});

app.get("/movies/:movieId/", async (request, response) => {
  const { moviesId } = request.params;
  const getMovieDetailsQuery = `
    SELECT *
    FROM movie
    WHERE movie_id = ${movieId};`;
  const movie = await db.get(getMovieDetailsQuery);
  console.log(movieId);
  response.send(convertMoviesObjectToResponseObject(movie));
});

app.put("/movies/:movieId/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const { moviesId } = request.params;
  const updateMovieQuery = `
    UPDATE movie
    SET director_id = ${directorId},
    movie_name = '${movieName}',
    lead_actor = '${leadActor}',
     WHERE movie_id = ${movieId};`;
  await db.run(updateMovieQuery);
  response.send("Movie Details Updated");
});

app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteQuery = `DELETE FROM movie
    WHERE movie_id = ${movieId};`;
  await db.run(deleteQuery);
  response.send("Movie Removed");
});

app.get("/directors/", async (request, response) => {
  const directorDetailsQuery = `SELECT *
     FROM director
     WHERE director_id = ${directorId}, director_name = ${directorName};`;
  const directors = await db.all(directorDetailsQuery);
  response.send(directors);
});

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getSpecificDirector = `SELECT *
    FROM movie
    WHERE movie_name = ${movieName};`;
  const directorList = await db.all(getSpecificDirector);
  response.send(directorList);
});

module.exports = app;
