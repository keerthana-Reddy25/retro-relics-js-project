//variables
const cart_btn = document.querySelector(".cart-btn");
const close_cart_btn = document.querySelector(".close-cart");
const clear_cart_btn = document.querySelector(".clear-cart");
const cart_dom = document.querySelector(".cart");
const cart_overlay = document.querySelector(".cart-overlay");

const cart_items = document.querySelector(".cart-items");
const cart_total = document.querySelector(".cart-total");
const cart_content = document.querySelector(".cart-content");
const products_dom = document.querySelector(".products-center");



//cart
let cart = [];
//getting the products
class Products {
  async get_products() {
    try {
      let result = await fetch('products.json');
      let data = await result.json();
      let products = data.items;
      products = products.map(item =>{
        const {title, price} = item.fields;
        const {id} = item.sys;
        const image = item.fields.image.fields.file.url;
        return {title, price, id, image}

      })
      return products;
    } catch (error) {
      console.log(error);
    }
  }
}

//ui class/ display products
class UI {
    display_products(products){
        let result = '';
        products.forEach(product => {
            result += `
            <article class="product">
          <div class="img-container">
            <img
              src=${product.image}
              alt="product"
              class="product-img"
            />
            <button class="bag-btn" data-id=${product.id}>
              <i class="fas fa-shopping-cart"></i>
              add to bag
            </button>
          </div>
          <h3>${product.title}</h3>
          <h4>$ ${product.price}</h4>
        </article>
            
            
            `;
            
        });
        products_dom.innerHTML = result;

    }

    get_bag_buttons(){
        const btns  = [...document.querySelectorAll(".bag-btn")];
        console.log(btns);

    }
}

//local storage
class Storage {
    static save_products(products){
        localStorage.setItem('products',JSON.stringify(products))
    }
}

document.addEventListener("DOMContentLoaded", () => {
  //making calls to the functions present in the above classes
  const ui = new UI();
  const products = new Products();

  //get all products
  products.get_products().then((products) => {
    ui.display_products(products)
    Storage.save_products(products);
  }).then(()=>{
    ui.get_bag_buttons()
  });
  
});
