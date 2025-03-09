const express = require("express");
const {
  getAllUsers,
  createUser,
  getUser,
  updateUser,
  deleteUser,
} = require("./../controller/userController");

const router = express.Router();
router.param("id", (req, res, next) => {
  console.log(`Tour id is: ${id}`);
  next();
});
router.param("id", (req, res, next) => {
  console.log(`Tour id is: ${id}`);
  next();
});

router.route("/").get(getAllUsers).post(createUser);

router.route("/:id").get(getUser).patch(updateUser).delete(deleteUser);

module.exports = router;
