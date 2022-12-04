var filename= _filename + '/user_data.json';
var fs = require('fs');

//var users_reg_data = require(filename);

if (fs.existsSync(filename)){
    var data  = fs.readFileSync (filename, 'utf-8');
    var users_reg_data = JSON.parse(data);
}
var user_reg_data = require(filename);　
console.log ()

/* when you get a POST, you can decode it 
to require the body and when somebody request the body 
it will make little log in form 
if you wan
*/