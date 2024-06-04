const asyncHandler = require("express-async-handler");
const { body, param, query, validationResult } = require("express-validator");
const validator = require("validator");

// models required
const User = require("../models/user");
const Exercise = require("../models/exercise")

// Display list of users.
exports.user_get = asyncHandler(async (req, res, next) => {
    const allUsers = await User.find({}, "_id username").exec();
    res.json(allUsers);
});

// Create new user
exports.user_create_post = [

    // validate that username has been entered.
    body("username", "Please specify a username")
        .isLength({ min: 1}),

    asyncHandler(async (req, res, next)=> {
        const result = validationResult(req);

        // create new user
        const user = new User({
            username: req.body.username,
        });

        // if no errors in validation
        if (!result.isEmpty()){
            // there are errors.
            return res.send(result.array());
         } else {
            // username is valid. Save to db.
            await user.save();
            res.json({
                username: user.username,
                _id: user._id,
            });
         }

})];

// Show logs by user
exports.user_log_get =
    asyncHandler(async (req, res, next) => {
    /* Set Filters */

    // create filter object to pass into "Exercise.find()"
    const filter = {
        user: req.params.id,
    }

    const dateFilter = {};
    // validate "from" and add to filter if valid.
    // this is in a try catch block as isDate throwing error for 4 digit strings.
    try {
        if(validator.isDate(req.query.from)){
            dateFilter.$gte = req.query.from;
        }
    } catch (error) {
        console.error(`${req.query.from} is not valid date string`);
    }

    // validate "to" and add to filter if valid
    // this is in a try catch block as isDate throwing error for 4 digit strings.
    try {
        if(validator.isDate(req.query.to)){
            dateFilter.$lte = req.query.to;
        }
    } catch (error) {
        console.error(`${req.query.to} is not valid date string`);
    }

    // If either date filters ar valid and present, add to filter object
    if(Object.keys(dateFilter).length > 0) {
        filter.date = dateFilter;
    }

    /* Find User and Exercises */

    let user;

    // ensure that :id relates to valid user.
    try {
        user = await User.findById(req.params.id).exec();
    } catch {
        // if no user found, send message
        res.send("User not found.")
    }
    
    // find user exercises by id, and include filter object created above
    const userExercises = await Exercise.find(filter).limit(req.query.limit).exec();
    // count number of user exercises
    const userExerciseCount = await Exercise.countDocuments( { user: req.params.id }).exec();

    // create exercuse log
    let exerciseLog = [];
    for (const exercise of userExercises){
        const logEntry = {
            description: exercise.description,
            duration: exercise.duration,
            date: exercise.date.toDateString(),
        }

        exerciseLog.push(logEntry);
    }

    // Response object
    const userWithLogs = {
        username: user.username,
        _id: user._id,
        count: userExerciseCount,
        log: exerciseLog,
    }

    res.send(userWithLogs);
});


// Create new exercise
exports.exercise_create_post = [
    // Validation
    param("id")
        .custom(async value => {
            const user = await User.findById(value);
            if (!user){
                throw new Error();
            }
        })
        .withMessage("Please enter a valid User ID"),
    body("description", "Please enter a description")
        .isLength({ min: 1 }),
        // .escape(), // Consider XSS attacks when doing something "proper" - this is just a training exercise.
    body("duration", "Please enter a number")
        .isNumeric(),
    body("date", "Must enter valid date")
        .optional({ values: "falsy" })
        .isDate()
        .toDate(),

    asyncHandler(async (req, res, next) => {
        const result = validationResult(req);

        // create new exercise
        const exercise = new Exercise ({
            user: req.params.id,
            description: req.body.description,
            duration: req.body.duration,
            date: req.body.date || Date.now(),
        });

        if(!result.isEmpty()){
            // there are errors
            return res.send(result.array());
        } else {
            // save exercise in db
            await exercise.save();
            // find user details for saved exercise
            const user = await User.findById(exercise.user, "username").exec();
            res.json({
                username: user.username,
                description: exercise.description,
                duration: exercise.duration,
                date: exercise.date.toDateString(),
                _id: user._id,
            });
        }
    }),
]