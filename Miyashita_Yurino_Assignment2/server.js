//created by Yurino Miyashita 
//modified Blake Saari's server.js 
// Load Express Package
var express = require('express');
var app = express();
// Load Body-Parser Package
var parser = require("body-parser");
// Load QueryString Package
const qs = require('querystring');
// Get Body
app.use(parser.urlencoded({
  extended: true
}));
// Monitor all requests
app.all('*', function (request, response, next) {
  console.log(request.method + ' to ' + request.path);
  next();
});
// Route all other GET requests to files in public 
app.use(express.static(__dirname + '/public'));
// Load Product Data   
var products = require(__dirname + '/products.json');
// Initialize Quantity
products.forEach((prod, i) => {
  prod.quantity_available = products[i].quantity_available
})
//determine if there is error in quantity text box.
//copied from invoice.html in store 1 direcotry and modified 
function notAPosInt(arrayElement, returnErrors = false) {
  errors = []; // [] is to display below if functions,  assume no errors at first
  if (arrayElement == '') {
    arrayElement = 0;
  }
  //assume there was no entry on texbox
  if (Number(arrayElement) != arrayElement) errors.push('Not a number!'); // Check if string is a number value
  if (arrayElement < 0) errors.push('Negative value!'); // Check if it is non-negative
  if (parseInt(arrayElement) != arrayElement) errors.push('Not an integer!'); // Check that it is an integer
  return (returnErrors ? errors : (errors.length == 0))
}
// Routing taking json file    
app.get("/products.json", function (request, response, next) {
  response.type('.js');
  var products_str = `var products = ${JSON.stringify(products)};`;
  response.send(products_str);
});
// Process purchase request (validate quantities, check quantity available)
app.post("/purchase", function (request, response, next) {
  console.log(request.body); //getting request from invoice.html body
  var quantities = request.body['quantity']; //assigning value to quantities as quantity entred in store.html textbox
  var errors = {};
  var available_quantity = false;
  for (i in quantities) {
    console.log(quantities[i])
    if (notAPosInt(quantities[i]) == false) {
      errors['quantity' + i] = `Please submit valid data for ${products[i].name}!` //if quantity enetred is invalid number 
    }
    if (quantities[i] > 0) { //if quantity entered is greater than, meaning no errors
      available_quantity = true;
    }
    if (quantities[i] > products[i].quantity_available) { //if quantity entered is greater than quantity available 
      errors['quantity' + i] = `We currenly don't have ${(quantities[i])}${products[i].name}. please check our website later!`
    }
  }
  //taking quantity entered to display in invoice and direct to log in page
  //changed login.html from invoice.html
  let quantity_object = {
    "quantity": JSON.stringify(quantities)
  }; //creating string by quantity_object
  console.log(Object.keys(errors));
  if (Object.keys(errors).length == 0) { //no errors, 
    for (i in quantities) { //remove purchase quantity from inventory
      products[i].quantity_available -= Number(quantities[i]);
    } //sends invoice with quantity with quary string
    response.redirect('./login.html?' + qs.stringify(quantity_object)); //inserting value as quary string to invoice.html table 
  } else { //with errors, redirect to login.html  
    let errors_obj = {
      "errors": JSON.stringify(errors)
    };
    console.log(qs.stringify(quantity_object));
    response.redirect('./store.html?' + qs.stringify(quantity_object) + '&' + qs.stringify(errors_obj)); //redirect to store.html and display errors 
  }
});

let users_reg_data = require(__dirname + '/public/user.json');
function isValidUserInfo(username, password, returnErrors = false) {
  let errors = [];
  let isUserError = false;
  if(!users_reg_data[username]) {
    console.log('ユーザーが存在しません。')
    errors.push(`User does not exist`);
  } else {
    const storedPassword = users_reg_data[username]["password"]
    console.log(`user.jsonに保存されているpassword${storedPassword}`);
    if(storedPassword === password) {
      isUserError = true;
      console.log(`passwordが一致しています`)
    } else {
      console.log(`passwordが一致していません`)
      errors.push(`Incorrect password or username`);
    }
  }
  return {isUserError, errors}
}

app.post("/login-form", function (request, response, next) {
    console.log(users_reg_data)
    const body = request.body;
    // console.log(body)
    const username = body['username'];
    const password = body['password'];
    const quantityString = body['quantityString'];
    console.log("bbb" + quantityString)
    // console.log(`username---${username}`);
    // console.log(`password---${password}`);
    // console.log(`users_reg_data.dport---${users_reg_data.dport}`);
    const {isUserError, errors} = isValidUserInfo(username, password)
    if(isUserError === false) {
      console.log('user情報NG')
      console.log(errors)
      let errors_obj = {
        "errors": JSON.stringify(errors)
      };
      console.log(qs.stringify(errors_obj));
      response.redirect('./login.html?' + qs.stringify(errors_obj)); //redirect to store.html and display errors       
    } else {
      response.redirect('./invoice.html?' + quantityString); 
      console.log('OK')
    }
  });
// Start server
app.listen(8080, () => console.log(`listening on port 8080`));