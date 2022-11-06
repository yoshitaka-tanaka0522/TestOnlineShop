require("./products_data.js");
var num_products = 5;
var prod_num=0;

while( prod_num ++ <=  num_products/2){
    console.log(`${prod_num}. ${eval('name' + prod_num)}`);

}
console.log('That\'s all we have!')

/*require("./products_data.js");
var num_products = 5;
var prod_num=0;

while( prod_num ++ < num_products){
    console.log(prod_num);
    if(prod_num>num_products/2){
        console.log(`That’s enough!`)
        break;
    }
}
*/
 /* var num_products=5; 
  var prod_num=0; 
  

  for(prod_number=1; prod_num ++ < num_products) {
      console.log('that's enough!')
  }*/