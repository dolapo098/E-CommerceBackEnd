const express = require("express");
const app = express();
app.use(express.json());
const PORT = 5050;
const mongo = require("mongoose");
const user = require("./models/users");
const Joi = require("@hapi/joi");
const cors = require("cors");
app.use(cors());
const bcrypt = require("bcrypt");
const saltRounds = 10;
const jwt = require("jsonwebtoken");
const Product = require("./models/products");
const createproduct = require("./models/createproduct");

mongo.connect("mongodb://127.0.0.1:27017/heyalice", err => {
  if (err) {
    console.log("ERROR.....Something went wrong......");
  } else {
    console.log("CONNECTED TO MONGO!!!... ");
  }
});

app.post("/login", (req, res) => {
  const data = req.body;
  const schema = Joi.object().keys({
    email: Joi.string()
      .trim()
      .email()
      .required(),
    password: Joi.string()
      .min(5)
      .max(15)
      .required()
  });
  const result = Joi.validate(data, schema);
  const error = result.error;
  const value = result.value;
  if (error) {
    return res.json({
      status: false,
      message: error.details[0].message
    });
  }
  const password = value.password;
  user.findOne({ email: value.email }, (err, doc) => {
    if (err) {
      return res.json(err);
    } else {
      if (doc) {
        if (bcrypt.compareSync(password, doc.password)) {
          const token = jwt.sign(doc.toJSON(), "heyalice", { expiresIn: "1h" });
          return res.json({
            status: true,
            message: "user found",
            value: token
          });
        } else {
          return res.json({
            status: false,
            message: `Wrong Password`
          });
        }
      } else {
        return res.json({
          status: false,
          message: "User does not exist"
        });
      }
    }
  });
});

app.post("/signup", (req, res) => {
  const userDetails = req.body;
  const schema = Joi.object().keys({
    fullname: Joi.string().required(),
    email: Joi.string()
      .email()
      .trim()
      .required(),
    password: Joi.string()
      .min(5)
      .max(15)
      .required()
  });
  const { error, value } = Joi.validate(userDetails, schema);

  if (error) {
    return res.json({
      status: false,
      message: error.details[0].message
    });
  }
  user.findOne({ email: value.email }, (err, existingUser) => {
    if (err) {
      return res.json(err);
    }
    if (!existingUser) {
      const password = value.password;
      var salt = bcrypt.genSaltSync(saltRounds);
      var hash = bcrypt.hashSync(password, salt);
      value.password = hash;

      const newUser = new user(value);
      newUser.save((err, doc) => {
        if (err) {
          return res.json(err);
        } else {
          return res.json({
            status: true,
            message: `Registration Successful..Welcome ${doc.fullname}`,
            value: doc
          });
        }
      });
    } else {
      return res.json({
        status: false,
        message: `User already Exists`
      });
    }
  });
});

app.get("/testoncecreateproducts", (req, res) => {
  const products = [
    new Product({
      imagePath: "./food/bread.jpg",
      categories: 1,
      name: "bread",
      price: 100
    }),
    new Product({
      imagePath: "./food/burger.jpg",
      categories: 2,
      name: "burger",
      price: 200
    }),
    new Product({
      imagePath: "./food/chicken.jpg",
      categories: 1,
      name: "chicken",
      price: 500
    }),
    new Product({
      imagePath: "./food/cupcake.jpg",
      categories: 2,
      name: "cupcake",
      price: 50
    }),
    new Product({
      imagePath: "./food/rice.jpg",
      categories: 1,
      name: "rice",
      price: 200
    }),
    new Product({
      imagePath: "./food/shawama.jpg",
      categories: 2,
      name: "shawama",
      price: 700
    })
  ];

  for (let i = 0; i < products.length; i++) {
    products[i].save((err, doc) => {
      if (err) {
        return res.json(err);
      } else {
        return res.json({
          status: true,
          value: doc
        });
      }
    });
  }
});

app.get("/createproduct", (req, res) => {
  const productDetails = req.query;
  const schema = Joi.object().keys({
    Categories: Joi.number().required(),
    Name: Joi.string().required(),
    Price: Joi.number().required()
  });
  const { error, value } = Joi.validate(productDetails, schema);
  if (error) {
    return res.json({
      status: false,
      message: error.details[0].message
    });
  }
  // console.log(productDetails);
  const createProd = new createproduct(value);
  createProd.save((err, doc) => {
    if (!err) {
      return res.json({
        status: true,
        value: doc
      });
    } else {
      return res.send(err);
    }
  });
});

app.get("/product", (req, res) => {
  const data = req.query;

  const search = {};
  if (data.name) {
    search.name = `/${data.name}/`;
  }

  if (data.category) {
    search.category = data.category;
  }

  createproduct.find(search, (err, data) => {
    res.json(data);
  });
});

app.listen(PORT, err => {
  if (err) {
    console.log(err);
  } else {
    console.log("And We are live!!!!!!");
  }
});
