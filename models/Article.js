const mongoose =require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;

let articleSchema = mongoose.Schema({
    title: { type: String, require:true },
    content:{ type: String, required:true },
    author:{ type: ObjectId, required: true, ref: 'User' },
    date: { type: Date, default: Date.now() },
    imagePath:{type: String}
});

const  Article = mongoose.model('Article' ,articleSchema);

module.exports = Article;
