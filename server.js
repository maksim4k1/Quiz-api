const express = require('express')
const app = express()
const port = 1717
const defaultData = require('./db/defaultData')
const cors = require('cors')
const db = require('./db')

const auth = require('./routes/auth')
const quizzes = require('./routes/quizzes')
const rating = require('./routes/rating')
const myquizzes = require('./routes/myquizzes')

app.use(cors())
db.defaults(defaultData).write()

app.use(express.json()) 

// auth
app.get('/me', auth.me)
app.post('/login', auth.login)
app.post('/signin', auth.signin)
app.put('/me/edit', auth.edit)
app.put('/me/score', auth.score)

// quizzes
app.get('/categories', quizzes.getCategories)
app.get('/category/:categoryId', quizzes.getQuizzes)
app.get('/quiz/:id', quizzes.getQuiz)

// rating
app.get('/rating', rating.top)
app.get('/profile/:username', rating.userProfile)

// myquizzes
app.post('/myquizzes', myquizzes.quizzes)
app.post('/myquiz', myquizzes.quiz)
app.post('/myquiz/create', myquizzes.createQuiz)
app.delete('/myquiz/delete/:id', myquizzes.deleteQuiz)

app.listen(port, () => console.log(`App listening at http://localhost:${port}`))