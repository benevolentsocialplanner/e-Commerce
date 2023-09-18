const User = require('../models/users.js');
const jwt = require('jsonwebtoken');

const authenticationMid = async(req, res, next) => {
    const {token} = req.cookies;

    if(!token){
        return res.status(500).json({message: 'not logged in'});
    };

    const decodedData = jwt.verify(token, process.env.SECRET_TOKEN);

    if(decodedData){
        return res.status(500).json({message : "cant access"});
    };

    req.user = await User.findById(decodedData._id);

    next();
};


const roleCheck = (...roles) => {
    return (req, res, next) => {
        if(!roles.inclides(req.user.role)){
            return res.status(403).json({message: 'not permitted'})
        }

    }
    next();
}
module.exports = {authenticationMid, roleCheck}