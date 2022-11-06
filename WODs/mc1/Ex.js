// setting the amount 
var amount = 367; 

//divide by quarters
step1=parseInt(amount/25);
remainder1 = amount%25; 

//devide by dimes 
step2 = parseInt(remainder1/10);
remainder2 = remainder1%10; 

//devide by nickels
step3 = parseInt(remainder2/5);
remainder3 = remainder2%5; 

//devide by pennies 
step4=parseInt(remainder3/1);
remainder4 = remainder3%1; 

console.log(step1, step2, step3, step4 );
console.log(remainder4);
console.log(remainder1); 
console.log(remainder2); 