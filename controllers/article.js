const Article = require('mongoose').model('Article');

function date() {
    let time = Date.now();
}

module.exports = {
  createGet: (req, res) =>{
      res.render('article/create');
  },
  createPost: (req,res) =>{
      let articleArgs = req.body;

      let errorMsg = '';

      if(!req.isAuthenticated()){
          errorMsg = 'Sorry , you must be logged in.';
      }
      else if(!articleArgs.title){
          errorMsg = 'Title is required.';
      }
      else if(!articleArgs.content){
          errorMsg = 'Content is required.';
      }

        if(errorMsg){
            res.render('article/create',{
                error: errorMsg
            });
            return;
        }
        let userId = req.user.id;


        let image = req.files.image;

        if(image){
            let filename = image.name;
            image.mv(`./public/images/${filename}`, err =>{
                if(err){
                    console.log(err.message);
                }
            });
        }
        articleArgs.imagePath = `/images/${image.name}`;

        articleArgs.author = userId;

        Article.create(articleArgs).then(article => {
            req.user.articles.push(article.id);
            req.user.save(err => {
                if(err){
                    res.redirect('article/create',{
                        error: err.message
                    });
                }else {
                    res.redirect('/');
                }
            })
        })
  },
    detailsGet: (req, res) =>{
      let id = req.params.id;

      Article.findById(id).populate('author').then(article => {
         res.render('article/details', article);
      });
    },

    editGet: (req,res) => {
      let id = req.params.id;

      if(!req.isAuthenticated()){
          let returnUrl = `/article/edit/${id}`;
          req.session.returnUrl = returnUrl;

          res.redirect('/user/login');
          return;
      }
      Article.findById(id).then(article => {
          req.user.isInRole('Admin').then(isAdmin => {
              if(!isAdmin && !req.user.isAuthor(article)){
                    res.redirect('/');
                    return;
              }
              res.render('article/edit',article);
          });
      });
    },

    editPost: (req,res) => {
      let id = req.params.id;
      let articleArgs = req.body;
      let errorMsg = '';

      if(errorMsg){
          res.render('article/edit',{error: errorMsg});
      }else
      Article.update({_id: id}, {$set: {title: articleArgs.title,
          content: articleArgs.content
      }}).then(err => {
          res.redirect(`/article/details/${id}`);
      })
    },
    deleteGet:(req,res) => {
        let id = req.params.id;

        if(!req.isAuthenticated()){
            let returnUrl = `/article/delete/${id}`;
            req.session.returnUrl = returnUrl;

            res.redirect('/user/login');
            return;
        }

        Article.findById(id).then(article => {
            req.user.isInRole('Admin').then(isAdmin => {
                if(!isAdmin && !req.user.isAuthor(article)){
                    res.redirect('/');
                    return;
                }

                res.render('article/delete', article);
            });
        });
    },
    deletePost:(req,res) => {
        let id = req.params.id;
        Article.findOneAndRemove({_id: id}).populate('author').then(article => {
            let author = article.author;

            let index = author.articles.indexOf(article.id);
            if(index < 0 ){
                let errorMsg = 'Article was not found for the author';
                res.render('article/delete',{error: errorMsg})
            }else {
                let count = 1;
                author.articles.splice(index,count);
                author.save().then((user) =>{
                    res.redirect('/');
                })
            }
        })

    }
};