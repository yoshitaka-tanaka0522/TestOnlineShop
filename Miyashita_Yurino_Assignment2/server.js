//created by Yurino Miyashita 
//modified Blake Saari's server.js 
// Load Express Package
let express = require('express');
let app = express();
// Load Body-Parser Package
let parser = require("body-parser");
// Load QueryString Package
const qs = require('querystring');
let fs = require('fs')
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
let products = require(__dirname + '/products.json');
var json_file_path = __dirname + '/user_data.json';
// Initialize Quantity
products.forEach((prod, i) => {
  prod.quantity_available = products[i].quantity_available
})

var qty_obj = {};
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
  let products_str = `let products = ${JSON.stringify(products)};`;
  response.send(products_str);
});
// Process purchase request (validate quantities, check quantity available)
app.post("/purchase", function (request, response, next) {
  console.log(request.body); //getting request from invoice.html body
  let quantities = request.body['quantity']; //assigning value to quantities as quantity entred in store.html textbox
  let errors = {};
  let available_quantity = false;
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
    }
    // Save quantity requested
    qty_obj = quantity_object
    //sends invoice with quantity with quary string
    response.redirect('./login.html?' + qs.stringify(quantity_object)); //inserting value as quary string to invoice.html table 
  } else { //with errors, redirect to login.html  
    let errors_obj = {
      "errors": JSON.stringify(errors)
    };
    console.log(qs.stringify(quantity_object));
    response.redirect('./store.html?' + qs.stringify(quantity_object) + '&' + qs.stringify(errors_obj)); //redirect to store.html and display errors 
  }
});

// --- Get data in advance from json file -- //
let users_reg_data;
// Check if user_data.json file exists
if(fs.existsSync(json_file_path)) {
  // Lab 13 Example Read file json file synchronously
  const data_string = fs.readFileSync(json_file_path, 'utf-8');
  console.log(`dataString---${data_string}`)
  // Since it cannot be treated as data in the state of a string, convert it to an object
  users_reg_data = JSON.parse(data_string);
  console.dir(users_reg_data)
} else {
  // when the file path does not exist
  console.log(`File path ${json_file_path} not found `)
}

/**
 * Querying input user and json data
 * @type {boolean, array}
 */
function isValidUserInfo(input_email, input_password) {
  let errors = [];
  let isUserError = false;
  // If user email key is undefined or key value does not exist
  if(!users_reg_data[input_email]) {
    isUserError = true;
    errors.push(`User does not exist`);
  } else {
    const stored_email = users_reg_data[input_email].email
    const stored_password = users_reg_data[input_email].password
    // If email does not match or password does not match
    if(!(stored_email=== input_email) || !(stored_password === input_password)) {
      isUserError = true;
      // if you identify a problem with which one is wrong, there is a vulnerability problem, so an error is displayed that either one does not match
      errors.push(`Incorrect password or username`);
    }
  }

  return {isUserError, errors}
}

// Processing after pressing the login button
app.post("/login_user", function (request, response) {
    // Receiving request processing from users
    const body = request.body;
    // Convert customer-entered email addresses to lowercase
    const input_email = body['username'].toLowerCase();
    console.log("inputemail" + input_email)
    // Get password entered by customer
    const input_password = body['password'];body.password
    // Querying input user and json data
    const {isUserError, errors} = isValidUserInfo(input_email, input_password)
    if(isUserError) {
      let errors_obj = {
        "errors": JSON.stringify(errors)
      };
      console.log(qs.stringify(errors_obj));
      response.redirect('./login.html?' + qs.stringify(errors_obj)); //redirect to store.html and display errors       
    } else {
      // If the password matches, use the object to pass the email address and full name to the next screen.
      qty_obj['email'] = input_email;
      qty_obj['fullname'] = users_reg_data[input_email].name;
      // Store quantity data
      let params = new URLSearchParams(qty_obj);
      console.log(`params---${params}`);
      response.redirect('./invoice.html?' + params.toString());
      return;
    }
  });

  app.post("/registrate_user", function (request, response) {
    // Start with 0 registration errors
    let registration_errors = {}
    const input_email = request.body['email']
    const input_password = request.body['password']
    const input_confirm_password = request.body['confirm_Password']
    const input_username = request.body['username']
    // If the password value entered by the user exists, do a format check on the email address
    // X@Y.Z
    // Xには文字、数字、”＿”または、”.”が入る。Yには文字と数字が入る。　Zには、3文字まで入る
    if(input_email) {
      // Validate email address
      // X@Y.Z　Xには文字、数字、”＿”または、”.”が入る
      // Yには文字と数字が入る
      // Zには、3文字まで入る
      const email_regex = /^[a-zA-Z0-9\_\.]+@([a-zA-Z0-9]*\.)+[a-zA-Z]{3}$/
      if (!(email_regex.test(input_email))) {
        registration_errors['email'] = `Please enter a valid email address(Ex: johndoe@meatlocker.com)`;
      }
      // Validates that the email inputted has not already been registered
      if (typeof users_reg_data[input_email] != 'undefined') {
        registration_errors['email'] = `This email address has already been registered`;
      }
    }

    // Validates that password is at least 10 characters
    if (input_password.length < 10) {
      registration_errors['password'] = `Password must be at least 10 characters`;
    }
    // Validates that there is a password inputted
    else if (input_password.length == 0) {
      registration_errors['password'] = `Please enter a password`
    }
    // 10文字以上
    // CASE SENSITIVE　“ABC” と“abc”は違うもの
    // スペースは使えない
    const password_regex = /^[a-zA-Z0-9][^ |　]{10,}$/
    if (!(password_regex.test(input_password))) {
      registration_errors['password'] = `Please correct format password`;
    }
    // Validates that the passwords match
    if (input_password != input_confirm_password) {
      registration_errors['confirm_password'] = `Your passwords do not match, please try again`;
    }
    // Validate that the full name inputted consists of A-Z characters exclusively
    const username_regex = /^[A-Za-z]+$/
    if (!(username_regex.test(input_username))) {
      registration_errors['username'] = `Please enter your first and last name`;
    }
    // 名前は３０文字以内、２文字以上、文字だけ
    if (input_username < 2 || input_username.length > 30) {
      registration_errors['username'] = `Please enter a name less than 30 characters`;
    }
    
    if(Object.keys(registration_errors).length === 0) {
      users_reg_data[input_email] = {
        name: input_username,
        password: input_password,
        email: input_email
      };
      // Write data into user_data.json file via the user_str letiable
      try {
        fs.writeFileSync(json_file_path, JSON.stringify(users_reg_data));
        // Add product quantity data
        qty_obj['email'] = input_email;
        qty_obj['username'] = user_str[input_email].name;
        let params = new URLSearchParams(qty_obj)
        // If registered send to invoice with product quantity data
        response.redirect('./invoice.html?' + params.toString());
      } catch(err) {
        console.log(err.message);
      }
    } else {
      // If errors exist, redirect to registration page with errors
      request.body['registration_errors'] = JSON.stringify(registration_errors);
      let params = new URLSearchParams(request.body);
      response.redirect("./registration.html?" + qs.stringify(params));
    }
  });
// Start server
app.listen(8080, () => console.log(`listening on port 8080`));