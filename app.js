
//Molde productos
class Producto {
    constructor(id, nombre, precio, categoria, imagen) {
        this.id = id;
        this.nombre = nombre;
        this.precio = precio;
        this.categoria = categoria;
        this.imagen = imagen;
    }
}

//Base de datos del e commerce, todos los productos de nuestro catalogo
class BaseDeDatos {
    
    constructor() {
        
      //Array del catalogo
      this.productos = [];
        //llamamos a la funcion asincronica
        this.cargarRegistros();
    }

    //Funcion asincronica para cargar los productos desde un JSON
    async cargarRegistros(){
      const resultado = await fetch("./json/productos.json");
      this.productos = await resultado.json();
      cargarProductos(this.productos);
    }

    //catalogo de productos devuelto
    traerRegistros() {
        return this.productos;
    }

    //nos da producto segun su id
    registroPorId(id) {
        return this.productos.find((producto) => producto.id === id);
    }

    //nos da producto segun nombre
    registrosPorNombre(palabra) {
            return this.productos.filter((producto) =>producto.nombre.toLowerCase().includes(palabra.toLowerCase()));
    }

    //nos da producto segun la categoria
    registrosPorCategoria(categoria){
          return this.productos.filter((producto) => producto.categoria == categoria)
        }
}

//CLase para manipular el carrito
class Carrito {
    constructor() {  
      //storage 
      const carritoStorage = JSON.parse(localStorage.getItem("carrito"));

        //array donde van los productos almacenados
        this.carrito = carritoStorage || [];
        this.total = 0; 
        this.cantidadProductos = 0; 
    
        //llamo la funcion para aplicar lo que haya en el storage si es que hay
        this.listar();
    }

    //para saber si el producto se ebcuentra en el carrito
    estaEnCarrito({ id }) {
    return this.carrito.find((producto) => producto.id === id);
}

  //agregamos al carrito
  agregar(producto) {
    const productoEnCarrito = this.estaEnCarrito(producto);
  
    //si no esta en el carrito le mado push sino me agrego 1 de cantidad
    if (!productoEnCarrito) {
      this.carrito.push({ ...producto, cantidad: 1 });
    } else {
    productoEnCarrito.cantidad++;
  }

    localStorage.setItem("carrito", JSON.stringify(this.carrito));
    this.listar();
}

  //quitar del carrito
  quitar(id) {

    const indice = this.carrito.findIndex((producto) => producto.id === id);

    if (this.carrito[indice].cantidad > 1) {
      this.carrito[indice].cantidad--;
    } else {
      this.carrito.splice(indice, 1);
  }

    localStorage.setItem("carrito", JSON.stringify(this.carrito));
    this.listar();
  }

  //vaciar el carrito
  vaciar(){
    this.total=0;
    this.cantidadProductos=0;
    this.carrito=[];
    localStorage.setItem("carrito", JSON.stringify(this.carrito));
    this.listar();

  }

    //renderiza los productos en el html
    listar() {

        this.total = 0;
        this.cantidadProductos = 0;
        divCarrito.innerHTML = "";

    //recorro los productos y se renderizan al html
    for (const producto of this.carrito) {
        divCarrito.innerHTML += `
        <div class="productoCarrito">
            <h2>${producto.nombre}</h2>
            <p>$${producto.precio}</p>
            <p>Cantidad: ${producto.cantidad}</p>
            <a href="#" class="btnQuitar" data-id="${producto.id}">Quitar del carrito</a>
        </div>
    `;

      this.total += producto.precio * producto.cantidad;
      this.cantidadProductos += producto.cantidad;
  }

  if(this.cantidadProductos > 0){
    //boton comprar visible
    botonComprar.style.display = "block";
  
  }else{
    //boton comprar oculto
    botonComprar.style.display = "none";
  }

    const botonesQuitar = document.querySelectorAll(".btnQuitar");

    for (const boton of botonesQuitar) {
      boton.addEventListener("click", (event) => {
        event.preventDefault();
        const idProducto = Number(boton.dataset.id);

        this.quitar(idProducto);
      });
  }

  //actualizo contadores del html
  spanCantidadProductos.innerText = this.cantidadProductos;
    spanTotalCarrito.innerText = this.total;
  }
}

//elementos
const spanCantidadProductos = document.querySelector("#cantidadProductos");
const spanTotalCarrito = document.querySelector("#totalCarrito");
const divProductos = document.querySelector("#productos");
const divCarrito = document.querySelector("#carrito");
const inputBuscar = document.querySelector("#inputBuscar");
const botonCarrito = document.querySelector("section h1");
const botonComprar = document.querySelector("#botonComprar");
const botonesCategorias = document.querySelectorAll(".btnCategoria");

//se instacia la base de datos
const bd = new BaseDeDatos();

//se instancia el carrito
const carrito = new Carrito();

botonesCategorias.forEach((boton) => {
  boton.addEventListener("click" , () => {
    const categoria = boton.dataset.categoria;
    //Saco boton seleccionado 
    const botonSeleccionado = document.querySelector(".seleccionado");
    botonSeleccionado.classList.remove("seleccionado");
    //Se lo agrego al nuevo
    boton.classList.add("seleccionado");
    if(categoria == "Todos"){
      cargarProductos(bd.traerRegistros());
    }else{
      cargarProductos(bd.registrosPorCategoria(categoria));
    }
  })
});

//mostramos el catalogo de la base de datos apenas cargar la pagina
cargarProductos(bd.traerRegistros());

//funcion que renderiza productos del catalogo 
function cargarProductos(productos) {

  divProductos.innerHTML = "";

  for (const producto of productos) {
    divProductos.innerHTML += `
      <div class="producto">
        <h2>${producto.nombre}</h2>
        <p class="precio">$${producto.precio}</p>
        <div class="imagen">
          <img src="img/${producto.imagen}" />
        </div>
        <a href="#" class="btnAgregar" data-id="${producto.id}">Agregar al carrito</a>
      </div>
    `;
  }

    //lista con todos los bootnes que haya en nuestro catalogo
  const botonesAgregar = document.querySelectorAll(".btnAgregar");


  //recorremos boton de cada producto y le damos evento click a cada uno
  for (const boton of botonesAgregar) {
    boton.addEventListener("click", (event) => {

      event.preventDefault();

      const idProducto = Number(boton.dataset.id);
      const producto = bd.registroPorId(idProducto);

      carrito.agregar(producto);

      //alert de toastify
      Toastify({
        text: `Se ha añadido ${producto.nombre} al carrito`,
        gravity: "bottom",
        position: "center",
        style: {
          background: "linear-gradient(to right, #00b09b, #5e7bef)",
        },
      }).showToast();
    });
  }
}

//buscador
inputBuscar.addEventListener("input", (event) => {
  event.preventDefault();
  const palabra = inputBuscar.value;
  const productos = bd.registrosPorNombre(palabra);
  cargarProductos(productos);
});

//toggle que muestra u oculta el carrito
botonCarrito.addEventListener("click", (event) => {
  document.querySelector("section").classList.toggle("ocultar");
});

//boton comprar
botonComprar.addEventListener("click", (event) =>{
  event.preventDefault();
  carrito.vaciar();

  //alert de sweet alert
  Swal.fire({
    title: '¿Estás seguro que tenés lo que necesitas?',
    text: "Se comprarán todos los objectos del carrito!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Confirmar Compra!'
  }).then((result) => {
    if (result.isConfirmed) {
      Swal.fire(
        'Enhorabuena!',
        'Tu compra ha sido realizada!.',
        'success'
      )
    }
  })
} );