module.exports = (err, req, res, next) => {
  req.log?.error(err);

  res.status(500).json({
    error: "Internal server error"
  });
};