export const isLoggedIn = (req, res, next) => {
  req.isAuthenticated() ? next() : res.sendStatus(401);
};

export const isAdminLoggedIn = (req, res, next) => {
  req.isAuthenticated() && req.user.isAdmin ? next() : res.sendStatus(401);
};
