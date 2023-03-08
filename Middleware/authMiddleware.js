export const isLoggedIn = (req, res, next) => {
  req.user ? next() : res.sendStatus(401);
};

export const isAdminLoggedIn = (req, res, next) => {
  req.user.isAdmin ? next() : res.sendStatus(401);
};
