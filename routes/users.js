const express = require("express");
const router = express.Router();

const userController = require("../controllers/userController");

// USER routes

// GET /api/users
router.get("/", userController.user_get);

// POST /api/users
router.post("/", userController.user_create_post);

// GET /api/users/:id/logs
router.get("/:id/logs", userController.user_log_get);

// POST /api/users/:_id/exercises
router.post("/:id/exercises", userController.exercise_create_post);

module.exports = router;