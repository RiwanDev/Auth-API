const db = require('better-sqlite3')('./users.db', {readonly: false});  // Librairie utilisé pour les bases de données
const express = require('express'); // Librairie utilisé pour l'API
const app = express(); // Définition de "app"
app.disable('x-powered-by'); // Désactivation du header "x-powered-by"
app.use(express.json()); // Utilisation du module "json"
const Cryptr = require('cryptr'); // Utilisation de la librairie Cryptr
const createTable = "CREATE TABLE IF NOT EXISTS users ( email, password, phone, firstname, lastname, verified, uuid);" // Code SQL permettant de crée la table si elle n'existe pas
db.exec(createTable); // Execute le code SQL au dessus
const encryptKey = "Riwan1337" // Mot de passe de chiffrement des mots de passes
const cryptr = new Cryptr(encryptKey);
const port = 80;
// Fonction permettant de valider une adresse email (selon un regex)
function IsValidEmail(email) {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}
// Fonction permettant de valider un numéro de téléphone (selon un regex)
function IsValidPhone(phone) {
    const re = /^[+]*[(]{0,1}[0-9]{1,3}[)]{0,1}[-\s\./0-9]*$/g
    return re.test(String(phone).toLowerCase());
}
// Fonction permettant de valider le prénom/nom d'une personne (selon un regex)
function IsValidName(name) {
    if (name == undefined || name == null){
        return false;
    }
    return /^[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]+$/u.test(name);
}
// Fonction permettant de valider si le mot de passe est correcte
function IsValidPassword(password) 
{ 
    return /^(?=.*[\d])(?=.*[A-Z])(?=.*[a-z])(?=.*[!@#$%^&*])[\w!@#$%^&*]{8,}$/.test(password);
}

console.log(IsValidName(undefined));

// Fonction permettant de verifier si l'email existe déjà 
function IsEmailAlreadyExists(email){
    
    var item = db.prepare('SELECT * FROM users WHERE email=?').get(email);
    if (item == undefined){ return false; }
    else {return true}
}
// Fonction permettant de verifier si le numéro de téléphone existe déjà 
function IsPhoneAlreadyExists(phone){
    var item = db.prepare('SELECT * FROM users WHERE phone=?').get(phone);
    if (item == undefined){ return false; }
    else {return true}

}


// Fonction permettant de générer un identifiant
function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
  

// Partie de l'API permettant de s'enregistrer
 app.post('/register', (req, res) => {
    if (!IsValidEmail(req.body.email)){
        return res.status(400).send({"code":400, "reason":"email", "message":"Vous devez spécifier une adresse email valide"})
    }
    if (!IsValidPhone(req.body.phone)){
        return res.status(400).send({"code":400, "reason":"phone", "message":"Vous devez spécifier un numéro de téléphone valide"})
    }
    if (!IsValidName(req.body.firstname) || req.body.firstname == undefined){
        return res.status(400).send({"code":400, "reason":"firstname", "message":"Vous devez spécifier un prénom valide"})
    }
    if (!IsValidName(req.body.lastname) || req.body.lastname == undefined){
        return res.status(400).send({"code":400, "reason":"lastname", "message":"Vous devez spécifier un nom valide"})
    }
    if (!IsValidPassword(req.body.password)){
        return res.status(400).send({"code":400, "reason":"password", "message":"Vous devez spécifier un mot de passe contenant plus de 8 caractères, contenant des lettres en minuscule et en majuscule."})
    }
    if (IsEmailAlreadyExists(req.body.email)){
        return res.status(400).send({"code":400, "reason":"email_already_exists", "message":"L'adresse email spécifié existe déjà"})
    }
    if (IsPhoneAlreadyExists(req.body.phone)){
        return res.status(400).send({"code":400, "reason":"phone_already_exists", "message":"Le numéro de téléphone spécifié existe déjà"})
    }

    var insert = db.prepare(`INSERT INTO users (email, password, phone, firstname, lastname, verified, uuid) VALUES (?, ?, ?, ?, ?, ?, ?)`)
    insert.run(req.body.email, cryptr.encrypt(req.body.password), req.body.phone, req.body.firstname, req.body.lastname, 0, uuidv4());
    return res.status(200).send({"code":200, message:"Le compte a été crée avec succes"})
})

// Partie de l'API permettant de se connecter
app.post('/login', (req, res) => {

    var item = db.prepare('SELECT * FROM users WHERE email=?').get(req.body.email);
    if (item == undefined){ 
        return res.status(400).send({"code":400, "reason":"email", "message":"L'adresse email n'existe pas"})
    }
    if (cryptr.decrypt(item.password) != req.body.password){
        return res.status(400).send({"code":400, "reason":"password", "message":"Le mot de passe n'est pas valide"})
    }
    if (cryptr.decrypt(item.password) == req.body.password) {

        return res.status(200).send({"firstname": item.firstname, "lastname": item.lastname, "email": item.email, "phone": item.phone, "uuid": item.uuid})
    }
})
app.listen(port, () => {
    console.log("Listening on port " + port)
});

