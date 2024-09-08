const jwt = require('jsonwebtoken');
const ensureAuthenticated = (req,res,next) =>{
    const auth = req.headers['authorization'];
    // console.log(JSON.stringify(req.headers));
    if(!auth){
        return res.status(403).json({message:"unauthorized, JWT token is require"});
    }
    try{
        const decoded = jwt.verify(auth,process.env.JWT_SECRET);
        req.user = decoded;
        next();
    }catch(err){
        console.log(err);
        return res.status(403).json({message:"unauthorized, JWT token is wrong or expired"});
    }
}

module.exports = ensureAuthenticated;