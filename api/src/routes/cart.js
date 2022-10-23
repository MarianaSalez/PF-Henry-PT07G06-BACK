const { Router } = require("express");
const { Cart, Product } = require("../db");
const { getCartsDb, getCartById, findCartAndProduct } = require("../handlers");

const router = Router();

router
  .get("/", async (req, res) => {
    try {
      const cartsDb = await getCartsDb();
      res.json(cartsDb);
    } catch (error) {
      res.status(404).json(error.message);
    }
  })

  .get("/:id", async (req, res) => {
    const { id } = req.params;
    try {
      const singleCart = await getCartById(id);
      res.json(singleCart);
    } catch (error) {
      res.status(404).json(error.message);
    }
  })

  .put("/addProductToCart/:cartId/:productId", async (req, res) => {
    const { cartId, productId } = req.params;
    try {
      const { cartToAddTo, productToAdd } = await findCartAndProduct(cartId, productId);

      if (productToAdd.toJSON()?.status !== "Publicado") throw new Error('Selected product is not available for purchasing at the moment')

      await cartToAddTo.addProduct(productId);
      const price = productToAdd.toJSON().price
      await cartToAddTo.update({total:  cartToAddTo.toJSON().total + price});
      res.json("Successfully added");
    } catch (error) {
      res.status(400).json(error.message);
    }
  })
  
  .delete("/removeProductFromCart/:cartId/:productId", async (req, res) => {
    const { cartId, productId } = req.params;
    try {
      const { cartToAddTo } = await findCartAndProduct(cartId, productId);

      await cartToAddTo.removeProduct(productId);
      res.json("Successfully removed");
    } catch (error) {
      res.status(400).json(error.message);
    }
  })

  .delete("/clearCart/:cartId", async (req, res) => {
    const { cartId } = req.params;
    try {
      const cartToClear = await getCartById(cartId);
      await cartToClear.setProducts([]);
      res.json(`Cart ${cartId} successfully cleared`);
    } catch (error) {
      res.status(400).json(error.message);
    }
  });

module.exports = router;
