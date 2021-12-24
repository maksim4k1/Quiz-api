const db = require('../db')
const shortid = require('shortid')
const error = (res, status, text) => res.status(status).json(text).end()

const login = (req, res) => {
  const { username, password } = req.body
  if (!username) return error(res, 400, 'Username attribute is required')
  if (!password) return error(res, 400, 'Password attribute is required')

  const user = db.get('users').find({ auth: { username, password } }).value()
  
  if (!user) return error(res, 403, 'incorrect login data')
  res.send({ token: user.token, data: user.data })
}

const signin = (req, res) => {
  const { username, password, name } = req.body
  if (!username) return error(res, 400, 'Username attribute is required')
  if (!password) return error(res, 400, 'Password attribute is required')

  const existed = db.get('users').find({ data: { username } }).value()
  if (existed) return error(res, 400, 'User with this username already exists')

  const user = { 
    auth: { username, password },
    data: { username, name, score: 0, description: "", image: "", myQuizzes: [] },
    token: `token_${shortid.generate()}` 
  }

  db.get('users').push(user).write()
  res.send({ token: user.token, data: user.data })
}

const me = (req, res) => {
  const token = req.get('X-Auth')
  const user = db.get('users').find({ token }).value()
  if (!user) return error(res, 403, 'Access is denied')

  res.send(user.data)
}

const edit = (req, res) => {
  const {username, image, name, description} = req.body

  if (!name) return error(res, 400, 'name attribute is required')
  
  const user = db.get('users').find({ data: { username } }).value()
  if (!user) return error(res, 403, 'Access is denied')
  else{
    const newUser = {
      ...user,
      data: {
        ...user.data,
        name,
        description,
        image
      }
    }

    db.get('users').chain().find({ data: { username } }).assign(newUser).write();
  }

  res.send(user.data)
}

const score = (req, res) => {
  const {username, score, quizId} = req.body

  if(!username || !quizId) return error(res, 403, 'Неверный запрос')
  
  const user = db.get('users').find((userData) => userData.data.username === username).value()
  if (!user) return error(res, 403, 'Access is denied')
  else{
    const quiz = db.get('quiz').find({ id: quizId }).value()

    if (!quiz) return error(res, 403, 'Access is denied')
    else {
      const userResult = quiz.results.find((user) => user.username === username)

      let newResults;
      if(userResult){
        newResults = quiz.results.map((result) => {
          if(result.username === username){
            return {...result, result: userResult.result < score ? (score > quiz.questions.length) ? quiz.questions.length : score : userResult.result}
          }
          return result
        })
      } else{
        quiz.results.push({username, result: score})
        newResults = quiz.results
      }

      const newQuiz = {
        ...quiz,
        results: [
          ...newResults
        ]
      }

      const newUser = {
        ...user,
        data: {
          ...user.data,
          score: user.data.score + (userResult ? (userResult.result < score ? score - userResult.result : 0) : score)
        }
      }

      db.get('quiz').chain().find({ id: quizId }).assign(newQuiz).write();

      db.get('users').chain().find((userData) => userData.data.username === username).assign(newUser).write();
    }
  }

  res.send(user.data)
}

module.exports = {
  login,
  signin,
  me,
  edit,
  score
}