const mongoose = require("mongoose");


mongoose.connect('mongodb://localhost/CC_T2_Database');

mongoose.connection.on("error", (err) => {
    console.log("err", err);
});

mongoose.connection.on("connected", (err, res) => {
    console.log("mongoose is connected");
});


//database structure
const Schema = mongoose.Schema;

const tramvaieSchema = new Schema({
    numar: Number,
    traseu: [String]
},
{ collection: 'tramvaie' });

const autobuzeSchema = new Schema({
    numar: Number,
    traseu: [String]
},
{ collection: 'autobuze' });

const TramvaieModel = mongoose.connection.model('Tramvaie', tramvaieSchema)
const AutobuzeModel = mongoose.connection.model('Autobuze', autobuzeSchema);


module.exports = {
    Tramvaie: TramvaieModel,
    Autobuze: AutobuzeModel,
    Mongoose:mongoose
}