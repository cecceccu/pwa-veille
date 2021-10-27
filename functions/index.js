/* eslint-disable no-implicit-coercion */
/* eslint-disable consistent-return */
const functions = require("firebase-functions");
const cors = require('cors')({ origin: true });
const admin = require('firebase-admin');

admin.initializeApp();

const db = admin.database();
const refArticles = db.ref('/articles');

exports.helloWorld = functions.https.onRequest((request, response) => {
  response.send("Hello from a Severless Database!");
});

const getArticlesFromDatabase = (res) => {
  let articles = [];

  return refArticles.on('value', (snapshot) => {
    snapshot.forEach((article) => {
      let objArticle = article.val();
      objArticle.id = article.key;
      articles.push(objArticle);
    });   
    res.status(200).json(articles);
  }, (error) => {
    res.status(500).json({
      message: `Something went wrong. ${error}`
    })
  })
};

exports.addArticle = functions.https.onRequest((req, res) => {
  return cors(req, res, () => {
    if(req.method !== 'POST') {
      return res.status(500).json({
        message: 'Not allowed'
      })
    }
    console.log(req.body);
    const article = req.body;
    refArticles.child(article.id).set(article);
    getArticlesFromDatabase(res);
  });
});

exports.getArticles = functions.https.onRequest((req, res) => {
  return cors(req, res, () => {
    if(req.method !== 'GET') {
      return res.status(500).json({
        message: 'Not allowed'
      });
    }
    getArticlesFromDatabase(res)
  });
});

exports.deleteArticle = functions.https.onRequest((req, res) => {
  return cors(req, res, () => {
    if(req.method !== 'DELETE') {
      return res.status(500).json({
        message: 'Not allowed'
      })
    }
    const id = req.query.id 
    refArticles.child(id).remove()
    getArticlesFromDatabase(res)
  })
})