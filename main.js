// ELementos del HTML
const cards = document.getElementById('cards');
const items = document.getElementById('items');
const footer = document.getElementById('footer');
// Templates
const templateCard = document.getElementById('template-card').content;
const templateFooter = document.getElementById('template-footer').content;
const templateCarrito = document.getElementById('template-carrito').content;
// Fragment
const fragment = document.createDocumentFragment();

// Objeto carrito para almacenar los datos del .json
let carrito = {};

// Evento para esperar que el documento sea cargado completamente
document.addEventListener('DOMContentLoaded', ()=>{
  fetchData();
  if(localStorage.getItem('carrito')){
    carrito = JSON.parse(localStorage.getItem('carrito'));
    pintarCarrito();
  }
})

// Evento click para el div cards
cards.addEventListener('click', (e) => {
    addCarrito(e); // si hacen algun click en todo el div que contiene los productos
})

// Evento para la suma y resta de cantidades
items.addEventListener('click', (e)=>{
    actCantidad(e);

})

// Cargando los datos del .json
const fetchData = async () => {
    try{
        const res = await fetch('datos.json');
        const data = await res.json();
        pintarCards(data);
    } catch (error){
        console.log(error)
    }
}

// pinto de manera dinamica cada objeto en el documento html
const pintarCards = (data) => {
    data.forEach((producto)=>{
        templateCard.querySelector('h5').textContent = producto.title;
        templateCard.querySelector('p span').textContent = producto.precio;
        templateCard.querySelector('img').setAttribute('src', producto.thumbnailUrl);
        templateCard.querySelector('button').setAttribute('id', `btn-${producto.id}`);
        templateCard.querySelector('button').dataset.id = producto.id;

        const clone = templateCard.cloneNode(true);
        fragment.appendChild(clone);
    })
    cards.appendChild(fragment);
}
// agrego al carrito
const addCarrito = (e) =>{
    if (e.target.classList.contains('btn-dark')) {
        // agregamos la informacion al carrito
        setCarrito(e.target.parentElement);
    }
    e.stopPropagation();
}

const setCarrito = (objeto) => {
    const producto = {
        id: objeto.querySelector('.btn-dark').dataset.id,
        title: objeto.querySelector('h5').textContent,
        precio: objeto.querySelector('p span').textContent,
        cantidad: 1
    }; 
    // preguntamos si el objeto carrito ya tiene el producto en cuestion
    if (carrito.hasOwnProperty(producto.id)) {
        producto.cantidad = carrito[producto.id].cantidad + 1;
    }

    carrito[producto.id] = {...producto}; // crea una copia de producto en el objeto carrito
    // Esto hace que si existe el producto en el carrito lo sobrescriba

    //  vamos a la funcion pintar carrito
    pintarCarrito();
}

const pintarCarrito = () =>{
    console.log('Pintar carrito');
    // para poder reccorrer un objeto con un forEach hay que hacerlo de la siguiente manera
    items.innerHTML = ''; // limpio el contenido de items para que no se guarde el anterior
    Object.values(carrito).forEach(producto =>{
        templateCarrito.querySelector('th').textContent = producto.id;
        templateCarrito.querySelectorAll('td')[0].textContent = producto.title;
        templateCarrito.querySelectorAll('td')[1].textContent = producto.cantidad;
        templateCarrito.querySelector('.btn-info').dataset.id = producto.id;
        templateCarrito.querySelector('.btn-danger').dataset.id = producto.id;
        templateCarrito.querySelector('span').textContent = producto.cantidad * producto.precio;
        
        // Clonamos el template
        const clone = templateCarrito.cloneNode(true);
        fragment.appendChild(clone);
    })
    items.appendChild(fragment);

    pintarfooter();

    localStorage.setItem('carrito', JSON.stringify(carrito)); // para guargar los datos en el local storage
}

const pintarfooter = () => {
    console.log('Pintar footer');

    footer.innerHTML = '';
    // Si el carrito esta vacio
    if(Object.keys(carrito).length === 0){
        footer.innerHTML = '<th scope="row" colspan="5">Carrito vacio - comience a comprar ya!</th>';
        return
    }

    const nuevaCantidad = Object.values(carrito).reduce((acc, {cantidad}) => acc + cantidad, 0 );
    const nuevoPrecio   = Object.values(carrito).reduce((acc, {cantidad, precio}) => acc + cantidad *precio, 0); 

    templateFooter.querySelector('td').textContent = nuevaCantidad;
    templateFooter.querySelector('span').textContent = nuevoPrecio;

    const clone =  templateFooter.cloneNode(true);
    fragment.appendChild(clone);
    footer.appendChild(fragment);

    const vaciar = document.getElementById('vaciar')
    vaciar.addEventListener('click', ()=>{
        carrito = {};
        pintarCarrito();

    })

}

const actCantidad = e =>{
    // INcrementar cantidad
    if(e.target.classList.contains('btn-info')){
        const producto    = carrito[e.target.dataset.id];
        producto.cantidad++;
        producto.precio   = producto.precio * producto.cantidad;
        
        carrito[e.target.dataset.id] = {...producto};

        pintarCarrito();

    }
    if(e.target.classList.contains('btn-danger')){
        const producto    = carrito[e.target.dataset.id];
        producto.cantidad--;
        if (producto.cantidad === 0) {
            console.log('Es cero mijito')
            delete carrito[e.target.dataset.id];
            
        }
        producto.precio   = producto.precio * producto.cantidad;
        
        // carrito[e.target.dataset.id] = {...producto};

        pintarCarrito();

    }
    e.stopPropagation()
}