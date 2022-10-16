const axios = require("axios");
const { Op } = require("sequelize");
const { Category, Product } = require("../db");

async function getProductDb() {
  return await Product.findAll();
}

async function getProductsWithCategories() {
  return await Product.findAll({
    order: ['id'],
    include: {
      model: Category,
      through: {
        attributes: [],
      },
    },
  });
}

async function getProductById(id) {
  const product = await Product.findByPk(id, {
    include: {
      model: Category,
      through: { attributes: [] },
    },
  });
  return product;
}

async function searchByQuery(name) {
  const result = await Product.findAll({
    where: {
      name: {
        [Op.iLike]: "%" + name + "%",
      },
    },
    include: {
      model: Category,
      through: {
        attributes: [],
      },
    },
  });
  return result;
}

function newProductBodyIsValid(newProduct) {
    const {name, price, description, condition, image, categories = []} = newProduct
    if (!name || !price || !description || !condition || !image || !categories.length) {
        throw new Error ("Name, price, description, condition, image and category are required fields.")
    }
    return true
}

module.exports = {
  getProductDb,
  getProductsWithCategories,
  getProductById,
  searchByQuery,
  newProductBodyIsValid
};
