const axios = require("axios");
const { Op } = require("sequelize");
const { Category, Product, User, Cart } = require("../db");

const upperCasedConditions = ["USADO", "COMO NUEVO", "CLAROS SIGNOS DE USO"];
const upperCasedStatus = ["PUBLICADO", "VENDIDO", "EN PAUSA", "ELIMINADO"];

async function getUsersDb() {
  return await User.findAll({
    order: ["id"],
    include: [
      {
        model: Cart,
        as: "cartUser",
      },
      {
        model: Product,
        as: "productsOwner",
      },
    ],
  });
}

async function getUserById(id) {
  return await User.findByPk(id);
}

async function getProductDb() {
  return await Product.findAll();
}

async function getProductsWithCategories() {
  return await Product.findAll({
    order: ["id"],
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
      // through: { attributes: [] },
    },
  });
  return product;
}

async function searchByQuery(where) {
  const result = await Product.findAll({
    where: {
      name: {
        [Op.iLike]: "%" + where.name + "%",
      },
      condition: {
        [Op.iLike]: "%" + where.condition + "%",
      },
      status: {
        [Op.iLike]: "%" + where.status + "%",
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

function optionIsValid(validOptions, option) {
  if (
    typeof option === "string" &&
    !validOptions.includes(option.toUpperCase())
  ) {
    throw new Error(
      `Options available are one of these: ${validOptions.join(", ")}`
    );
  } else return true;
}

function newProductFieldsAreComplete(
  name,
  price,
  description,
  condition,
  image,
  categories
) {
  if (
    !name ||
    !price ||
    !description ||
    !condition ||
    !image ||
    !categories.length
  ) {
    throw new Error(
      "Name, price, description, condition, image and category are required fields."
    );
  } else return true;
}

function newProductBodyIsValid(newProduct) {
  const {
    name,
    price,
    description,
    condition,
    image,
    categories = [],
  } = newProduct;

  newProductFieldsAreComplete(
    name,
    price,
    description,
    condition,
    image,
    categories
  );
  optionIsValid(upperCasedConditions, condition);

  return true;
}

async function createProduct(newProduct) {
  const {
    name,
    price,
    description,
    condition,
    image,
    categories = [],
  } = newProduct;
  console.log(name);
  const owner = 1;
  const newP = await Product.create({
    name: name,
    price: price,
    description: description,
    condition: condition,
    image: image,
    owner: owner,
    status: "Publicado",
  });
  newP.setCategories(categories);
}

async function findProductAndCategories(id, categories) {
  if (!Array.isArray(categories) || !categories.length) {
    throw new Error("Request body must contain an array with categories IDs");
  }

  const productToModify = await getProductById(id);
  if (!productToModify) throw new Error("Product not Found");

  const categoriesToModify = await Category.findAll({
    where: {
      id: categories,
    },
  });
  if (!categoriesToModify.length) throw new Error("No categories where found");

  return { productToModify, categoriesToModify };
}

async function getCartsDb() {
  return await Cart.findAll({
    include: {
      model: Product,
      through:{
        attributes: []
      }
    },
    
  });
};

async function getCartById(id) {
 return await Cart.findByPk(id, {
    include: {
      model: Product,
      through:{
        attributes: []
      }
    },
  });
}

async function findCartAndProduct(cartId, productId) {
  if (!cartId || !productId) throw new Error("Missing Fields");

  const cartToAddTo = await getCartById(cartId);
  if (!cartToAddTo)
    throw new Error("No cart was found matching the provided ID");
  // console.log(cartToAddTo.toJSON())

  const productToAdd = await getProductById(productId);
  if (!productToAdd)
    throw new Error("No Product was found matching the provided ID");
  
  return {cartToAddTo, productToAdd}
}

module.exports = {
  getProductDb,
  getProductsWithCategories,
  getProductById,
  searchByQuery,
  newProductBodyIsValid,
  createProduct,
  findProductAndCategories,
  getUsersDb,
  getUserById,
  getCartsDb,
  getCartById,
  findCartAndProduct
};
