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

//created by Yurino Miyashita 
//modified Blake Saari's server.js 
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

// // Determines entry in textbox
// function checkQuantityTextbox(qtyTextbox) {
//   errs = isNonNegInt(qtyTextbox.value, true);
//   if (errs.length == 0) errs = ['Want to purchase: '];
//   if (qtyTextbox.value.trim() == '') errs = ['Type desired quantity: '];
//   document.getElementById(qtyTextbox.name + '_label').innerHTML = errs.join('<font color="red">, </font>');
// };

// Routing 
app.get("/products.json", function (request, response, next) {
  response.type('.js');
  var products_str = `var products = ${JSON.stringify(products)};`;
  response.send(products_str);
});

// Process purchase request (validate quantities, check quantity available)
// I changed from 'quantity_' + i to 'quantity' + i +'_label'
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

  //
  let quantity_object = {
    "quantity": JSON.stringify(quantities)
  }; //creating string by quantity_object
  console.log(Object.keys(errors));
  if (Object.keys(errors).length == 0) { //no errors, 
    for (i in quantities) { //remove purchase quantity from inventory
      products[i].quantity_available -= Number(quantities[i]);
    } //sends invoice with quantity with quary string
    response.redirect('./invoice.html?' + qs.stringify(quantity_object)); //inserting value as quary string to invoice.html table 
  } else { //with errors, redirect to store.html  
    let errors_obj = {
      "errors": JSON.stringify(errors)
    };
    console.log(qs.stringify(quantity_object));
    response.redirect('./store.html?' + qs.stringify(quantity_object) + '&' + qs.stringify(errors_obj)); //redirect to store.html and display errors 
  }
});

// Start server
app.listen(8080, () => console.log(`listening on port 8080`));