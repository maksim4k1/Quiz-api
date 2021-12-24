const db = require("../db");
const error = (res, status, text) => res.status(status).json(text).end();

const top = (req, res) => {
  const users = db.get("users").value();
  
  if(!users) return error(res, 400, 'Access is denied')

  const sortedUsers = users.sort((a, b) => {
    if (a.data.score < b.data.score) {
      return 1;
    }
    if (a.data.score > b.data.score) {
      return -1;
    }
    return 0;
  });

  const top = sortedUsers.map((user, index) => {
    return {
      place: index + 1,
      username: user.data.username,
      image: user.data.image,
      score: user.data.score
    }
  });

  res.send(top);
}

const userProfile = (req, res) => {
  const username = req.params.username;
  
  if(!username) return error(res, 400, 'Access is denied')

  const user = db.get("users").find({ data: { username } }).value();
  if(!user) return error(res, 400, 'Access is denied')

  const userData = user.data;

  const userProfile = {
    username: userData.username,
    name: userData.name,
    score: userData.score,
    image: userData.image,
    description: userData.description,
  }
  
  res.send(userProfile);
}

module.exports = {
  top,
  userProfile
}