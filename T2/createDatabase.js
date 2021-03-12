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



const Tramvaie = mongoose.connection.model('Tramvaie', tramvaieSchema)
const Autobuze = mongoose.connection.model('Autobuze', autobuzeSchema);

//create database through create database row
const tramvai = new Tramvaie({ numar: 1, traseu: ["Copou", "Tudor Vladimirescu", "Tatarasi", "Copou"]});
const autobuz = new Tramvaie({ numar: 5, traseu: ["Dacia", "Podu Ros", "Tutora"]});

mongoose.connection.once('connected', (err) => {
    if (err) {
        return console.error('err');
    } 
    else {
        Tramvaie.create(tramvai, (err, document) => {
            if (err) {
                console.error(err);
            }
            console.log('++tramvai\n', document);
        })

        Autobuze.create(autobuz, (err, document) => {
            if (err) {
                console.error(err);
            }
            console.log('++autobuze\n', document);
        }) 
    }

})