const Article = require('mongoose').model('Article');


module.exports = {
  index: (req, res) => {
      Article.find({}).limit(4).populate('author').then(articles => {
          res.render('home/index',{
              articles
          });
      });
  },
    getAllPost: (req, res) => {
        Article.find({}).limit().populate('author').then(articles => {
            res.render('home/AllPost',{
                articles
            });
        });
    },
};





