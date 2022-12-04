//Yurino Miyashita
// this function asks the server for a service and convert the response to text 


function nav_bar(this_product_key, product_data){
    for (let products_key in products_data){
        if (products_key ==this_product_key) continue;
        document.write(`<a href='./store1.html?products_key=${products_key}'>${products_key}</a>&nbsp&nbsp&nbsp;`);
    }
}