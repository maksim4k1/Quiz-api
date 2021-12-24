const db = require('../db')
const error = (res, status, text) => res.status(status).json(text).end()

const getCategories = (req, res) => {
  const categories = db.get('categories')

  if(!categories) return error(res, 400, 'Access is denied')

  res.send(categories)
}

const getQuizzes = (req, res) => {
  const quizzes = db.get('quizzes').find({ categoryId: req.params.categoryId })

  if(!quizzes) return error(res, 400, 'Access is denied')

  res.send(quizzes.value().quizzes)
}

const getQuiz = (req, res) => {
  const id = req.params.id;
  if(!id) return error(res, 400, 'Access is denied')
  
  const quiz = db.get('quiz').find(foundQuiz => foundQuiz.id === id).value()

  console.log(quiz)
  if(!quiz) return error(res, 400, 'Access is denied')

  res.send(quiz)
}

module.exports = {
  getCategories,
  getQuizzes,
  getQuiz
}