require('dotenv').config();
const {Sequelize} = require('sequelize');
const fs = require('fs');
const path = require('path');
const { userInfo } = require('os');
const { DB_NAME, DB_USER, DB_PASSWORD, DB_HOST } = require('./config');


const sequelize = new Sequelize(`postgres://${DB_USER}:${DB_PASSWORD}@${DB_HOST}/${DB_NAME}`, {
    logging: false,
    native: false,
});
const basename = path.basename(__filename);

const modelDefiners = [];

fs.readdirSync(path.join(__dirname, '/models'))
  .filter((file) => (file.indexOf('.') !==0) && (file !==basename) && (file.slice(-3) === '.js'))
  .forEach((file) => {
    modelDefiners.push(require(path.join(__dirname, '/models', file)))
  });

 modelDefiners.forEach(model => model(sequelize));
 
 let entries = Object.entries(sequelize.models);
 let capsEntries = entries.map((entry) => [entry[0][0].toUpperCase()+entry[0].slice(1), entry[1]]);
 sequelize.models = Object.fromEntries(capsEntries);

 const { Product , Category, User} = sequelize.models;

 //Relaciones entre usuarios y productos
User.hasMany(Product, {as: "productsOwner", foreignKey: "ownerId"})
Product.belongsTo(User, {as: "owner"})

 //Relaciones entre productos y categorias
 Product.belongsToMany(Category, {through: "product_category"})
 Category.belongsToMany(Product, {through: "product_category"})

 module.exports = {
    Product,
    Category,
    User,
    conn: sequelize,
 }