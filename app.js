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
//buttons
let buttons_DOM = [];


//getting the products
class Products {
  async get_products() {
    try {
      let result = await fetch("products.json");
      let data = await result.json();
      let products = data.items;
      products = products.map((item) => {
        const { title, price } = item.fields;
        const { id } = item.sys;
        const image = item.fields.image.fields.file.url;
        return { title, price, id, image };
      });
      return products;
    } catch (error) {
      console.log(error);
    }
  }
}

//ui class/ display products
class UI {
  display_products(products) {
    let result = "";
    products.forEach((product) => {
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
              add to cart
            </button>
          </div>
          <h3>${product.title}</h3>
          <h4>$ ${product.price}</h4>
        </article>
            
            
            `;
    });
    products_dom.innerHTML = result;
  }

  get_bag_buttons() {
    const btns = [...document.querySelectorAll(".bag-btn")];
    // console.log(btns);
    buttons_DOM = btns;
    btns.forEach((btn) => {
      let id = btn.dataset.id;
      // console.log(id);
      let in_cart = cart.find((item) => item.id === id);
      if (in_cart) {
        btn.innerText = "In Cart";
        btn.disabled = true;
      }

      btn.addEventListener("click", (event) => {
        event.target.innerText = "In Cart";
        event.target.disabled = true;
        //get product from products based on the id
        let cart_item = {... Storage.get_product(id), amount:1};
        // console.log(cart_item);

        
        //add product to the cart
        cart = [...cart, cart_item];
        
        //save the cart in local storage
        Storage.save_cart(cart)
        //set cart values
        this.set_cart_values(cart);
        //display cart items
        this.add_cart_item(cart_item);
        //show the cart with added products
        this.show_cart();


      });
    });
  }
  set_cart_values(cart){
    let temp_total = 0;
    let items_total = 0;
    cart.map(item =>{
      temp_total += item.price * item.amount;
      items_total += item.amount;
    })
    cart_total.innerText = parseFloat(temp_total.toFixed(2))
    cart_items.innerText = items_total;
    
  }
  add_cart_item(item){
    const div = document.createElement('div')
    div.classList.add('cart-item')
    div.innerHTML = `<img src=${item.image} alt="product" />
    <div>
      <h4>${item.title}</h4>
      <h5>$ ${item.price}</h5>
      <span class="remove-item" data-id=${item.id}>Remove</span>
    </div>
    <div>
      <i class="fas fa-chevron-up" data-id=${item.id}></i>
      <p class="item-amount">${item.amount}</p>
      <i class="fas fa-chevron-down" data-id=${item.id}></i>
    </div>`;
    cart_content.appendChild(div);
    console.log(cart_content);
    
    
  }
  setup_app(){
    cart = Storage.get_cart();
    this.set_cart_values(cart);
    this.populate_cart(cart);
    cart_btn.addEventListener('click',this.show_cart.bind(this));
    close_cart_btn.addEventListener('click',this.hide_cart.bind(this));
    this.hide_cart();

  }
  show_cart(){
    cart_overlay.classList.add('transparentBcg');
    cart_dom.classList.add('showCart');

  }
  hide_cart(){
    cart_overlay.classList.remove('transparentBcg');
    cart_dom.classList.remove('showCart');
  }
  populate_cart(cart){
    cart.forEach(item =>{
      this.add_cart_item(item);
    })
  }
  cart_logic(){
    //clear cart button
    clear_cart_btn.addEventListener('click', () =>{this.clear_cart()});
    //cart functionality
    cart_content.addEventListener('click',event=>{
      // console.log(event.target);
      if(event.target.classList.contains('remove-item')){
        let remove_item = event.target;
        let id = remove_item.dataset.id;
        cart_content.removeChild(remove_item.parentElement.parentElement);
        this.remove_item(id);

      }
      else if(event.target.classList.contains('fa-chevron-up')){
        let add_amount = event.target;
        let id = add_amount.dataset.id;
        let temp_item = cart.find(item => item.id === id);
        temp_item.amount = temp_item.amount + 1;
        Storage.save_cart(cart);
        this.set_cart_values(cart);
        add_amount.nextElementSibling.innerText = temp_item.amount; 
      }
      else if(event.target.classList.contains('fa-chevron-down')){
        let lower_amount = event.target;
        let id = lower_amount.dataset.id;
        let temp_item = cart.find(item => item.id === id);
        temp_item.amount = temp_item.amount - 1;
        if (temp_item.amount >0){
          Storage.save_cart(cart);
          this.set_cart_values(cart);
          lower_amount.previousElementSibling.innerText = temp_item.amount;

        }else{
          cart_content.removeChild(lower_amount.parentElement.parentElement);
          this.remove_item(id);
        }
         
      }
    })

  }
  clear_cart(){
    let cart_items = cart.map(item => item.id);
    // console.log(cart_items);
    cart_items.forEach(id => this.remove_item(id));
    while(cart_content.children.length > 0){
      cart_content.removeChild(cart_content.children[0]);
      console.log(cart_content.children)
    }
    this.hide_cart();
  }
  remove_item(id){
    cart = cart.filter(item => item.id !== id);
    this.set_cart_values(cart);
    Storage.save_cart(cart);
    let button = this.get_single_button(id);
    button.disabled = false;
    button.innerHTML = `<i class="fas fa-shopping-cart"></i>add to cart`


  }
  get_single_button(id){
    return buttons_DOM.find(button => button.dataset.id === id);
  }
  
 
 
  
}

//local storage
class Storage {
  static save_products(products) {
    localStorage.setItem("products", JSON.stringify(products));
  }
  static get_product(id){
    let products = JSON.parse(localStorage.getItem('products'));
    return products.find((product)=>product.id === id);
  }
  static save_cart(cart){
    localStorage.setItem("cart",JSON.stringify(cart));
  }
  static get_cart(){
    return localStorage.getItem('cart')?JSON.parse(localStorage.getItem('cart')) : []
  }
}

document.addEventListener("DOMContentLoaded", () => {
  //making calls to the functions present in the above classes
  const ui = new UI();
  const products = new Products();

  //setup app
  ui.setup_app();

  //get all products
  products
    .get_products()
    .then((products) => {
      ui.display_products(products);
      Storage.save_products(products);
    })
    .then(() => {
      ui.get_bag_buttons();
      ui.cart_logic();
    });
});
