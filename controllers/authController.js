const User = require("../models/userModel")
const bcrypt = require("bcryptjs")

exports.signUp = async (req, res) => {
    
    try {
    const {username, password} = req.body
    const hashpassword = await bcrypt.hash(password, 12)
    const newUser = await User.create({
        username, password: hashpassword
    })
    res.status(201).json({
        status: 'success', 
        data: {
            user: newUser
        }
    })
    } catch (error) {
        res.status(400).json({
            status: 'fail'
        })
        
    }
}


exports.login = async (req, res) => {
    
    try {
    const {username, password} = req.body
    const user = await User.findOne({username})
    
    if (!user) {
        return res.status(404).json({
            status: 'fail',
            message: 'user not found'
        })

    }    
   const isCorrect = await bcrypt.compare(password, user.password)

   if (!isCorrect) {
    return res.status(404).json({
        status: 'fail',
        message: 'incorrect username or password'
    })

} 
    req.session.user = user
    res.status(200).json({
        status: 'success', 
         
    })
    } catch (error) {
        res.status(400).json({
            status: 'fail'
        })
        
    }
}