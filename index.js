const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()

app.use(cors())
app.use(express.static('public'))

// Header parser
app.use(express.urlencoded({ extended: false }));

// Mongoose connection
const mongoose = require("mongoose");
mongoose.set("strictQuery", false);

main().catch((err) => console.log(err));
async function main() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB")
}

// Routers
const usersRouter = require('./routes/users');

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.use('/api/users', usersRouter);

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
