const isLoggedIn = (req, res, next) => {
  req.user ? next() : res.sendStatus(401);
};

export default isLoggedIn;
