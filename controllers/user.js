const User = require('../models/users.js')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const cloudinary = require('cloudinary').v2
const crypto = require('crypto')
const nodemailer = require('nodemailer')

const register = async (req, res) => {
    try {
        if(req.body.avatar){
            const avatar = await cloudinary.uploader.upload(req.body.avatar, {
                folder: 'avatars',
                width: 130,
                crop: 'scale'
            });
        }

        const { name, email, password } = req.body;

        const user = await User.findOne({ email });
        if (user) {
            return res.status(500).json({ message: 'This email is in use' });
        }

        const passwordHash = await bcrypt.hash(password, 10);

        if (password.length < 6) {
            return res.status(500).json({ message: 'Password is not long enough' });
        }

        if(req.body.avatar){
            const newUser = await User.create({
                name,
                email,
                password: passwordHash,
                avatar: {
                    public_id: avatar.public_id,
                    url: avatar.secure_url
                }
            });
        }else{
            const newUser = await User.create({
                name,
                email,
                password: passwordHash,
            });
        }

        const token = await jwt.sign({ id: newUser?._id }, process.env.SECRET_TOKEN, { expiresIn: '1h' });

        const cookieOptions = {
            httpOnly: true,
            expires: Date.now() + 5 * 24 * 60 * 60 * 1000 // Changed minutes to seconds
        };

        res.status(201).cookie('token', token, cookieOptions).json({
            newUser,
            token
        });
    } catch (error) {
        // Handle errors here
        console.error(error);
        res.status(500).json({ message: 'An error occurred while registering' });
    }
};

const login = async(req,res) =>{

    const {email, password} = req.body;

    const user = await User.findOne({email});

    if(!user){
        return res.status(500).json({message: 'no such an user was found'})
    }

    const comparePassword = await bcrypt.compare(password, user.password);

    if(!comparePassword){
        return res.status(500).json({message: "wrong password"})
    }

    const token = await jwt.sign({id: user._id}, process.env.SECRET_TOKEN, {expiresIn:'1h'})

    const cookieOptions = {
        httpOnly: true,
        expires: new Date(Date.now() + 5 * 24 * 60 * 1000)
    }

    res.status(200).cookie('token', token, cookieOptions).json({
        user,
        token
    })
}
const forgotPassword = async(req,res) =>{
    const user = await User.findOne({email: req.body.email})

    if(!user){
        return res.status(500).json({message: "no such user"})
    }


    const resetToken = await crypto.randomBytes(20).toString('hex');

    user.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest('hex');
    user.resetPasswordExpire = new Date(Date.now()+ 5*60*1000);

    await user.save({validateBeforeSave: false});

    const passwordUrl = `${req.protocol}://${req.get('host')}/reset/${resetToken}`

    const message = `use this to reset your password: ${passwordUrl}`

    try {
        const transporter = nodemailer.createTransport({
            port: 465,
            service: "gmail",
            host: "smtp.gmail.com",
            auth: {
                user: 'youremail@gmail.com',
                pass: 'password',
            },
            secure: true,
        });

        const mailData = {
            from: 'youremail@gmail.com',  // sender address
            to: req.body.email,   // list of receivers
            subject: 'password reset',
            text: message
        };

        await transporter.sendMail(mailData);

        res.status(200).json({
            message: "check your email"
        })

    }catch(error){
        user.resetPasswordToken = undefined
        user.resetPasswordExpire = undefined

        await user.save({validateBeforeSave: false})

        res.status(500).json({message: error.message})
    }
}
const resetPassword = async(req,res) =>{
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.token.digest('hex'))

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: {$gt: Date.now()}
    })

    if(!user){
        return res.status(500).json({message: 'invalid token'})
    }

    user.password = req.body.password;
    user.resetPasswordExpire = undefined;
    user.resetPasswordToken = undefined;

    await user.save()

    const token = jwt.sign({id: user._id}, process.env.SECRET_TOKEN, {expiresIn: "1h"});

    const cookieOptions = {
        httpOnly: true,
        expires: Date.now() + 5 * 24 * 60 * 1000
    }

    res.status(201).cookie('token', token, cookieOptions).json({
        newUser,
        token
    })

}
const logout = async(req,res) =>{
    const cookieOptions = {
        httpOnly: true,
        expires: new Date(Date.now())
    }
    res.status(200).cookie('token', null, cookieOptions
    ).json({
        message: 'logged out'
    })
}

const userDetail = async(req, res, next) => {
    const user = await User.findById(req.params.id)
    res.status(200).json({
        user
    })
}
module.exports = {register,login, forgotPassword, logout, resetPassword, userDetail}