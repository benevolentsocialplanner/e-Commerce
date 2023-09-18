const mongoose = require('mongoose');

const db = () => {
    mongoose.connect('mongodb://localhost:27017', {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }).then(() => {
        console.log('mongo connected ')
    }).catch((err) => {
        console.log(`err? ${err}`)
    })
}
module.exports = db