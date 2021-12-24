const db = require("../db");
const error = (res, status, text) => res.status(status).json(text).end()
const shortid = require('shortid')

const quizzes = (req, res) => {
  const myQuizzesId = req.body;
  if(!myQuizzesId) return error(res, 400, 'Access is denied')

  if(!myQuizzesId || !Array.isArray(myQuizzesId)) return error(res, 400, 'Access is denied')

  const quizzes = db.get("quiz").value();
  if(!quizzes) return error(res, 400, 'Access is denied')

  const myQuizzes = [];

  for(let i = 0; i < quizzes.length; i++){
    const quiz = quizzes[i];
    const index = myQuizzesId.findIndex((quizId) => quizId === quiz.id);

    if(index > -1){
      myQuizzesId.splice(index, 1);

      myQuizzes.push({
        id: quiz.id,
        title: quiz.name,
        description: quiz.description
      });
    }
    if(!myQuizzesId.length){
      break;
    }
  }

  res.send(myQuizzes);
}

const quiz = (req, res) => {
  const {username, id} = req.body;

  if(!username || !id) return error(res, 400, 'Access is denied')

  const quiz = db.get('quiz').find({ id }).value();
  if(!quiz) return error(res, 400, 'Access is denied')

  if(quiz.author !== username) return error(res, 400, 'Access is denied')

  const quizStatistic = {
    id: quiz.id,
    title: quiz.name,
    maxScore: quiz.questions.length,
    attempts: quiz.results.length,
    results: quiz.results.map((result) => {
      const userData = db.get('users').find((user) => user.data.username === result.username).value();
      if(!userData) return error(res, 400, 'Access is denied')
      return {...result, image: userData ? userData.data.image : null}
    }),
  }

  res.send(quizStatistic);
}

const createQuiz = (req, res) => {
  const {author, name, category, description="", questions} = req.body;

  if(!author || !name || !category || !questions) return error(res, 400, 'Access is denied')

  const id = `quiz_${shortid.generate()}`;
  const newQuiz = {
    id,
    name,
    category,
    author,
    description,
    questions,
    results: []
  }

  const categoryQuizzes = db.get('quizzes').find({ categoryId: category }).value()
  if(!categoryQuizzes) return error(res, 400, 'Access is denied')
  const newCategory = {...categoryQuizzes}
  newCategory.quizzes.push({
    id,
    title: name,
    description
  })

  const user = db.get('users').find((userData) => userData.data.username === author).value()
  if(!user) return error(res, 400, 'Access is denied')
  const newUser = {...user}
  newUser.data.myQuizzes.push(id);

  db.get('quiz').push(newQuiz).write()
  db.get('quizzes').chain().find({ categoryId: category }).assign(newCategory).write();
  db.get('users').chain().find((userData) => userData.data.username === author).assign(newUser).write();

  res.send(newQuiz)
}

const deleteQuiz = (req, res) => {
  const id = req.params.id

  if(!id) return error(res, 400, 'Access is denied')

  const categoryQuizzes = db.get('quizzes').find(category => category.quizzes.find(quiz => quiz.id === id)).value()
  if(!categoryQuizzes) return error(res, 400, 'Access is denied')
  const newCategory = {...categoryQuizzes}
  newCategory.quizzes = newCategory.quizzes.filter((quiz) => quiz.id !== id)
  console.log(newCategory.quizzes.filter((quiz) => quiz.id !== id))
  console.log(newCategory)

  const user = db.get('users').find((userData) => userData.data.myQuizzes.find(quizId => quizId === id)).value()
  if(!user) return error(res, 400, 'Access is denied')
  const newUser = {...user}
  newUser.data.myQuizzes = newUser.data.myQuizzes.filter((quizId) => quizId !== id)

  db.get('quiz').remove({ id }).write();
  db.get('quizzes').chain().find(category => category.quizzes.find(quiz => quiz.id === id)).assign(newCategory).write();
  db.get('users').chain().find((userData) => userData.data.myQuizzes.find(quizId => quizId === id)).assign(newUser).write();

  res.send({message: "Удаление прошло успешно"})
}

module.exports = {
  quizzes,
  quiz,
  createQuiz,
  deleteQuiz
}