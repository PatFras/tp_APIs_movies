const paginate = require("express-paginate");
const createError = require("http-errors");
const {
  getAllMovies,
  getMovieById,
  storeMovie,
  updateMovie,
  deleteMovie,
} = require("../services/movies.services");

module.exports = {
  index: async (req, res) => {
    const { keyword } = req.query;
    try {
      const { movies, count } = await getAllMovies(
        req.query.limit,
        req.skip,
        keyword
      );
      const pagesCount = Math.ceil(count / req.query.limit);
      const currentPage = req.query.page;
      const pages = paginate.getArrayPages(req)(
        pagesCount,
        pagesCount,
        currentPage
      );

      return res.status(200).json({
        ok: true,
        meta: {
          pagesCount,
          currentPage,
          pages,
        },
        data: movies.map((movie) => {
          return {
            ...movie.dataValues,
            url: `${req.protocol}://${req.get("host")}/api/v1/movies/${
              movie.id
            }`,
          };
        }),
      });
    } catch (error) {
      console.log(error);
      return res.status(error.status || 500).json({
        ok: false,
        status: error.status || 500,
        error: error.message || "Ocurrió un error",
      });
    }
  },
  show: async (req, res) => {
    try {
      const movie = await getMovieById(req.params.id);
      return res.status(200).json({
        ok: true,
        data: movie,
      });
    } catch (error) {
      console.log(error);
      return res.status(error.status || 500).json({
        ok: false,
        status: error.status || 500,
        error: error.message || "Ocurrió un error",
      });
    }
  },
  store: async (req, res) => {
    try {
      const { title, rating, release_date, awards, length, genre_id, actors } =
        req.body;
      if ([title, rating, release_date, awards].includes("" || undefined)) {
        throw createError(400, "Todos los campos son obligatorios");
      }

      const movie = await storeMovie(req.body, actors);
      return res.status(200).json({
        ok: true,
        message: "Película agregada exitosamente",
        url: `${req.protocol}://${req.get("host")}/api/v1/movies/${movie.id}`,
        data: movie,
      });
    } catch (error) {
      console.log(error);
      return res.status(error.status || 500).json({
        ok: false,
        status: error.status || 500,
        error: error.message || "Ocurrió un error",
      });
    }
  },
  update: async (req, res) => {
    try {
      const movieUpdated = await updateMovie(req.params.id, req.body);
      return res.status(200).json({
        ok: true,
        message: "Película actualizada",
        data: movieUpdated,
      });
    } catch (error) {
      return res.status(error.status || 500).json({
        ok: false,
        status: error.status || 500,
        error: error.message || "Ocurrió un error",
      });
    }
  },
  delete: async (req, res) => {
    try {
      await deleteMovie(req.params.id);
      return res.status(200).json({
        ok: true,
        message: "Película eliminada ",
      });
    } catch (error) {
      console.log(error);
      return res.status(error.status || 500).json({
        ok: false,
        status: error.status || 500,
        error: error.message || "Ocurrió un error",
      });
    }
  },
};
