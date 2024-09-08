const mongoose = require ('mongoose');

const RepoSchema = new mongoose.Schema({
    repo_name:{
        type: String,
        required: true,
    },
    repo_url:{
        type: String,
        required: true,
    },
    last_issue_id:{
        type: String,
        required: true,
    },
    last_issue_link:{
        type: String,
        required: true,
    },
    particular_user:{
        type: String,
        required: false,
    },
    UserId: {type: mongoose.Schema.Types.ObjectId,ref: "users",required: true},
});
const RepoModel = mongoose.model('repos',RepoSchema);
module.exports = RepoModel;