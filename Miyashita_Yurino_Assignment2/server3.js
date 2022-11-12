// Author: Blake Saari - ITM352 - Spring 2022
// Server developed for eCommerce website
// Based on Assignment 2 Examples, Momoka Michimoto (Fall 2021), Lab 12
// Load Packages and Functions
// Load Express Package
let express = require('express');
let app = express();
// Load File System Package
let fs = require('fs')
// Load Body-Parser Package
let parser = require("body-parser");
// Load QueryString Package
const qs = require('querystring');
const { response } = require('express');
const {URLSearchParams} = require('url');
// Load Product Data
let products = require(__dirname + '/products.json');
// Initialize Quantity
products.forEach((prod, i) => {
  prod.quantity_available = products[i].quantity_available
})
// Load User Data
let filename = './public/data/user_data.json';
// Store Data from Purchase
let qty_obj = {};
// Load Body
app.use(express.urlencoded({
  extended: true
}));
// Determines valid quantity (If "q" is a negative interger)
function isNonNegInt(q, return_errors = false) {
  errors = []; // assume no errors at first
  if (q == '') q = 0; // handle blank inputs as if they are 0
  if (Number(q) != q) errors.push('<b><font color="red">Not a number!</font></b>'); // Check if string is a number value
  if (q < 0) errors.push('<b><font color="red">Negative value!</font></b>'); // Check if it is non-negative
  if (parseInt(q) != q) errors.push('<b><font color="red">Not an integer!</font></b>'); // Check that it is an integer
  return return_errors ? errors : (errors.length == 0);
};
// Determines input in textbox
function checkQuantityTextbox(qtyTextbox) {
  errs = isNonNegInt(qtyTextbox.value, true);
  if (errs.length == 0) errs = ['Want to purchase: '];
  if (qtyTextbox.value.trim() == '') errs = ['Type desired quantity: '];
  document.getElementById(qtyTextbox.name + '_label').innerHTML = errs.join('<font color="red">, </font>');
};
// ---------------------------- Purchase -------------------------------- //
// Processing Purchase Request (Validates Quantities & Checks Availability)
app.post("/purchase", function (request, response, next) {
  // Get quantities from body
  let quantities = request.body['quantity'];
  // Start with no errors
  let errors = {};
  // Start with no quantities available
  let available_quantity = false;
  // Get quantity data
  for (i in quantities) {
    // Validate quantity inputted
    if (isNonNegInt(quantities[i]) == false) {
      errors['quantity_' + i] = `Submit a valid quantity for ${products[i].item}!`
    }
    // Check if quantity is available
    if (quantities[i] > 0) {
      available_quantity = true;
    }
    // Check if quantity request is larger than quantity available
    if (quantities[i] > products[i].quantity_available) {
      errors['available_' + i] = `We don 't have ${(quantities[i])} ${products[i].item} ready to ship, order less or check our stock later!`
    }
  }
  // If no quantities selected, push error
  if (!available_quantity) {
    errors['No quantities inputted'] = `Please enter a quantity for steaks!`;
  }
  // Edit product quantities available
  let quantity_object = {
    "quantity": JSON.stringify(quantities)
  };
  // If no errors
  if (Object.keys(errors).length == 0) {
    for (i in quantities) {
      // Subtract from quantities available
      products[i].quantity_available -= Number(quantities[i]);
    }
    // Save quantity requested
    qty_obj = quantity_object
    // Redirect to login page
    response.redirect('./login.html');
  }
  // If errors exist...
  else {
    let errors_obj = {
      "errors": JSON.stringify(errors)
    };
    console.log(qs.stringify(quantity_object));
    // Redirect to store page with errors
    response.redirect('./store.html?' + qs.stringify(quantity_object) + '&' + qs.stringify(errors_obj));
  }
});
// ---------------------------- Log-in -------------------------------- //
if (fs.existsSync(filename)) {
  // Lab 13 Example
  let data_str = fs.readFileSync(filename, 'utf-8');
  let user_str = JSON.parse(data_str);
} else {
  console.log(filename + ' does not exist.');
}
// Processing Login Request
// Process login form POST and redirect to logged in page if ok, back to login page if not
app.post("/process_login", function (request, response) {
  // Start with no errors
  let errors = {};
  // Pull data from login form
  let the_email = request.body['email'].toLowerCase();
  let the_password = request.body['password'];
  // Check if entered password matches stored password (Lab 13)
  if (typeof user_str[the_email] != 'undefined') {
    if (user_str[the_email].password == the_password) {
      // If the passwords match...
      qty_obj['email'] = the_email;
      qty_obj['fullname'] = user_str[the_email].name;
      // Store quantity data
      let params = new URLSearchParams(qty_obj);
      console.log(qty_obj)
      // If no errors, redirect to invoice page with quantity data
      response.redirect('./invoice.html?' + params.toString());
      return;
      // If password incorrect add to errors letiable
    } else {
      errors['login_error'] = `Incorrect password`;
    }
    // If email incorrect add to errors letiable
  } else {
    errors['login_error'] = `Wrong E-Mail`;
  }
  // If errors exist, redirect to login page with errors in string
  let params = new URLSearchParams(errors);
  params.append('email', the_email);
  response.redirect('./login.html?' + params.toString());
});
// ---------------------------- Registration -------------------------------- //
app.post("/registration", function (request, response) {
  // Start with 0 registration errors
  let registration_errors = {}
  // Import email from submitted page
  let register_email = request.body['email'].toLowerCase();
  // Validate email address (From w3resource - Email Validation)
  if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(request.body.email) == false) {
    registration_errors['email'] = `Please enter a valid email address`;
  }
  // Validates that there is an email inputted
  else if (register_email.length == 0) {
    registration_errors['email'] = `Please enter a valid email address`;
  }
  // Validates that the email inputted has not already been registered
  if (typeof user_str[register_email] != 'undefined') {
    registration_errors['email'] = `This email address has already been registered`
  }
  // Validates that password is at least 8 characters
  if (request.body.password.length < 8) {
    registration_errors['password'] = `Password must be at least 8 characters`;
  }
  // Validates that there is a password inputted
  else if (request.body.password.length == 0) {
    registration_errors['password'] = `Please enter a password`
  }
  // Validates that the passwords match
  if (request.body['password'] != request.body['repeat_password']) {
    registration_errors['repeat_password'] = `Your passwords do not match, please try again`;
  }
  // Validates that the full name inputted consists of A-Z characters exclusively
  if (/^[A-Za-z, ]+$/.test(request.body['fullname'])) {} else {
    registration_errors['fullname'] = `Please enter your first and last name`;
    // Assures that the name inputted will not be longer than 30 characters
  }
  if (request.body['fullname'].length > 30) {
    registration_errors['fullname'] = `Please enter a name less than 30 characters`;
  }
  // Assignment 2 Example Code -- Reading and writing user info to a JSON file
  // If there are no errors...
  if (Object.keys(registration_errors).length == 0) {
    user_str[register_email] = {};
    user_str[register_email].password = request.body.password;
    user_str[register_email].email = request.body.email;
    // Write data into user_data.json file via the user_str letiable
    fs.writeFileSync(filename, JSON.stringify(user_str));
    // Add product quantity data
    qty_obj['email'] = register_email;
    qty_obj['fullname'] = user_str[register_email].name;
    let params = new URLSearchParams(qty_obj)
    // If registered send to invoice with product quantity data
    response.redirect('./invoice.html?' + params.toString());
  } else {
    // If errors exist, redirect to registration page with errors
    request.body['registration_errors'] = JSON.stringify(registration_errors);
    let params = new URLSearchParams(request.body);
    response.redirect("./registration.html?" + params.toString());
  }
});
// ---------------------------- Change Registration Details -------------------------------- //
app.post("/change_password", function (request, response) {
  // Start with no errors
  let reset_errors = {};
  // Pulls data inputed into the form from the body
  let current_email = request.body['email'].toLowerCase();
  let current_password = request.body['password'];
  // Validates that email is correct format
  if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(request.body.email) == false) {
    reset_errors['email'] = `Please enter a valid email address (Ex: johndoe@meatlocker.com)`
  }
  // Validates that an email was inputted
  else if (current_email.length == 0) {
    reset_errors['email'] = `Please enter an email address`
  }
  // Validates that both new passwords are identical
  if (request.body['newpassword'] != request.body['repeatnewpassword']) {
    reset_errors['repeatnewpassword'] = `The passwords you entered do not match`;
  }
  // Validates that inputted email and password match credentials stored in user_data.json
  if (typeof user_str[current_email] != 'undefined') {
    // Validates that password submited matches password saved in user_data.json
    if (user_str[current_email].password == current_password) {
      // Validates that password is at least 8 characters long
      if (request.body.newpassword.length < 8) {
        reset_errors['newpassword'] = `Password must be at least 8 characters`
      }
      // Validates that passwords matches user_data.json
      if (user_str[current_email].password != current_password) {
        reset_errors['password'] = `The password entered is incorrect`
      }
      // Validates that inputted new passwords are identical
      if (request.body.newpassword != request.body.repeatnewpassword) {
        reset_errors['repeatnewpassword'] = `The passwords you entered do not match`
      }
      // Validates that new password is different than current password
      if (request.body.newpassword && request.body.repeatnewpassword == current_password) {
        reset_errors['newpassword'] = `Your new password must be different from your old password`
      }
    } else {
      // Error message if password is incorrect
      reset_errors['password'] = `You entered an incorrect password`;
    }
  } else {
    // Error message is email is incorrect
    reset_errors['email'] = `The email entered has not been registered yet`
  }
  // If there are no errors... (Momoka Michimoto)
  if (Object.keys(reset_errors).length == 0) {
    user_str[current_email].password = request.body.newpassword
    // Write new password into user_data.json
    fs.writeFileSync(filename, JSON.stringify(user_str), "utf-8");
    // Pass quantity data
    qty_obj['email'] = current_email;
    qty_obj['fullname'] = user_str[current_email].name;
    let params = new URLSearchParams(qty_obj);
    // Redirect to login page with quantity data in string
    response.redirect('./login.html?' + params.toString());
    return;
  } else {
    // Request errors
    request.body['reset_errors'] = JSON.stringify(reset_errors);
    let params = new URLSearchParams(request.body);
    // Redirect back to update registration page with errors in string
    response.redirect('update_registration.html?' + params.toString());
  }
})
// ---------------------------- Routing -------------------------------- //
// Routing
app.get("/products.json", function (request, response, next) {
  response.type('.js');
  let products_str = `let products = ${JSON.stringify(products)};`;
  response.send(products_str);
});
// Route all other GET requests to files in public
app.use(express.static(__dirname + '/public'));
// ---------------------------- Start Server -------------------------------- //
app.listen(8080, () => console.log(`listening on port 8080`));