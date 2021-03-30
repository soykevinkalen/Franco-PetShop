(function () {
    'use strict'
  
    var forms = document.querySelectorAll('.needs-validation')
  
    Array.prototype.slice.call(forms)
      .forEach(function (form) {
        form.addEventListener('submit', function (event) {
            event.preventDefault()
            
            if (!form.checkValidity()) {    
                event.stopPropagation()
                Swal.fire({
                    position: 'top-center',
                    icon: 'error',
                    title: 'Oops...',
                    text: 'Por favor complete el formulario',
                    showConfirmButton: false,
                    timer: 1500
                  })
            }else{
                let nombre = document.querySelector('.input-nombre')
                Swal.fire({
                    position: 'top-center',
                    icon: 'success',
                    title: `¡${nombre.value} gracias por elegirnos!`,
                    showConfirmButton: false,
                    timer: 1500
                  })
                setTimeout(function(){ window.location.href = "http://127.0.0.1:5500/index.html";},1800);                
            }
            form.classList.add('was-validated')
        }, false)
      })
  })()

function filtro(tipo, productos) {
    let array = productos.filter(producto => producto.tipo == tipo)
    return array;
}

// if(document.getElementById("juguetes") || document.getElementById('farmacia')){
  fetch(`https://apipetshop.herokuapp.com/api/articulos`, {
      method: 'GET'
  })
  .then(res => res.json())
  .then(data =>{ 
    let baseDeDatos = document.getElementById("juguetes") ? filtro('Juguete', data.response) : filtro('Medicamento', data.response);
    let carrito = [];
    let total = 0;
    const listaCarrito = document.querySelectorAll('.todosLosProductos');
    const spanTotal = document.querySelectorAll('.total');
    const botonVaciar = document.querySelectorAll('.boton-vaciar');
    // cargarCarritoDeLocalStorage();
    // renderItems();
    // calcularTotal();
    // renderizarCarrito();

    function renderItems() {
        let mainItems = document.querySelector('#items');
        for (let info of baseDeDatos) {
        let unidad = document.createElement('p')
        unidad.setAttribute('id','u'+info['_id'])           
        let divContainer = document.createElement('div')
        let imagen = document.createElement('img')
        imagen.setAttribute('src', info['imagen'])
        imagen.setAttribute('alt', info['nombre'])
        let titulo = document.createElement('h5')
        titulo.classList.add('nombre','text-center', 'pt-2')
        titulo.textContent = info['nombre']
        let precio = document.createElement('p')
        precio.classList.add('ps-2')
        precio.textContent = 'Precio: $' + info['precio']   
        let stock = document.createElement('p')
        stock.classList.add('ps-2')
        stock.textContent = 'STOCK: '+info['stock']+' UNIDADES'
        stock.setAttribute('id', 'stock'+info['_id'])
        let descripcionModal = document.createElement('button');
        descripcionModal.textContent = 'Descripción';
        descripcionModal.classList.add('btn', 'btn-primary', 'btn-sm')
        descripcionModal.setAttribute('type', 'button')
        descripcionModal.setAttribute('data-bs-toggle', 'modal')
        descripcionModal.setAttribute('data-bs-target', '#staticBackdrop')
        descripcionModal.setAttribute('id', 'desc' + info['_id'])
        descripcionModal.addEventListener('click', (e)=>{
            let productoModal = data.response.find(elemento => 'desc'+elemento['_id'] === e.target.id)
            let tituloModal = document.getElementById('staticBackdropLabel')
            tituloModal.textContent = productoModal.nombre
            let imagenModal = document.getElementById('imagenModal')
            imagenModal.src = productoModal.imagen
            let bodyModal = document.getElementById('modalBody')
            bodyModal.textContent = productoModal.descripcion
        })
        let boton = document.createElement('button');
        boton.classList.add('btn', 'btn-primary', 'btn-sm', 'mt-1');
        boton.textContent = 'Comprar';
        boton.setAttribute('id', info['_id']);
        boton.addEventListener('click', (e)=>{
            // let elemento = baseDeDatos.find(dato => dato._id == e.target.id)
            let stock = document.getElementById('stock'+e.target.id)
            let texto = stock.textContent
            if(texto.indexOf('SIN STOCK') == -1){
                console.log(texto)
                carrito.push(e.target.getAttribute('id'))
                calcularTotal();
                renderizarCarrito();
                guardarCarritoEnLocalStorage();
                if(parseInt(texto.split(' ')[1]) <= 5){
                    let cartel = document.getElementById('u'+e.target.id)
                    cartel.textContent = '¡¡¡Ultimas unidades!!!'
                    cartel.classList.add('text-center', 'btn-danger') 
                }
            }
        });
        let deshacer = document.createElement('button');
        deshacer.classList.add('btn', 'btn-primary','mt-1', 'btn-sm');
        deshacer.textContent = 'Deshacer compra';
        deshacer.setAttribute('id','d'+info['_id']);
        let id = null
        let nuevoLocalStorage = []
        let pos = null 
        deshacer.addEventListener('click', (e)=>{
        // FALTA QUE CUANDO DESAGA LA COMPRA SAQUE EL CARTEL
            let stock = document.getElementById('stock'+e.target.id.slice(1))
            let texto = stock.textContent
            if(parseInt(texto.split(' ')[1]) >= 4){
                let cartel = document.getElementById('u'+e.target.id.slice(1))
                cartel.textContent = ''
                cartel.classList.remove('text-center', 'btn-danger') 
            }
            id = carrito.find(producto => 'd'+producto === e.target.id)
            if(id){
                nuevoLocalStorage = [...JSON.parse(localStorage.getItem('carrito'))]
                pos = nuevoLocalStorage.indexOf(id)    
                nuevoLocalStorage.splice(pos, 1)
                carrito = [...nuevoLocalStorage]
                if(!carrito.length || nuevoLocalStorage.indexOf(id) === -1){
                    let elemento = baseDeDatos.find(dato => dato._id == id)
                    let stock = document.getElementById('stock'+id)
                    stock.textContent =elemento.stock == 1? 'STOCK: '+elemento.stock+' UNIDAD' : 'STOCK: '+elemento.stock+' UNIDADES'
                }
                calcularTotal();
                renderizarCarrito();
                guardarCarritoEnLocalStorage();
            }
        });
        divContainer.appendChild(imagen)
        divContainer.appendChild(titulo)
        if(info['stock'] < 5){
            unidad.textContent = '¡¡¡Últimas unidades!!!'
            unidad.classList.add('text-center', 'btn-danger') 
        }
        divContainer.appendChild(unidad)
        divContainer.appendChild(precio)
        divContainer.appendChild(stock)
        divContainer.appendChild(descripcionModal)
        divContainer.appendChild(boton)
        divContainer.appendChild(deshacer)
        mainItems.appendChild(divContainer)
        }
    }
    function renderizarCarrito() {
        let carritoSinDuplicados = [...new Set(carrito)]
        listaCarrito.forEach(lista =>{
            lista.textContent = ''
            carritoSinDuplicados.forEach(item => {
                let producto = data.response.find(elemento => elemento['_id'] == item )
                let numeroDeUnidades = carrito.reduce((total, itemId) => itemId === item ? total += 1 : total, 0)
                console.log(numeroDeUnidades)
                let modificaStock = document.getElementById('stock'+producto['_id'])
                let cuenta = producto.stock - numeroDeUnidades
                if(cuenta == 1){
                    modificaStock.textContent =  'STOCK: ' + cuenta + ' UNIDAD'
                    modificaStock.classList.remove('btn-danger')
                }else if(cuenta == 0 ){
                    modificaStock.textContent =  'STOCK: SIN STOCK'
                    modificaStock.classList.add('btn-danger')
                }else if(cuenta > 1){
                    modificaStock.textContent =  'STOCK: ' + cuenta + ' UNIDADES'
                }
                
                let li = document.createElement('li')
                li.classList.add('list-group-item', 'text-right', 'mx-2')
                li.textContent = `${numeroDeUnidades} x ${producto['nombre']} - $ ${producto['precio']}`
                let boton = document.createElement('button')
                boton.classList.add('btn', 'btn-danger', 'mx-5')
                boton.textContent = 'Deshacer compras'
                boton.style.marginLeft = '1rem'
                boton.setAttribute('item', 'ds'+item)
                boton.addEventListener('click', (e)=>{
                    let id = e.target.getAttribute('item')
                    console.log(id)
                    let object = baseDeDatos.find(dato => 'ds'+dato._id == id)
                    let stock = document.getElementById('stock'+object._id)
                    stock.classList.remove('btn-danger')
                    stock.textContent = object.stock == 1? 'STOCK: '+object.stock+' UNIDAD' : 'STOCK: '+object.stock+' UNIDADES'
                    if(object.stock > 4){
                        let cartel = document.getElementById('u'+object._id)
                        cartel.textContent = ''
                        cartel.classList.remove('text-center', 'btn-danger')
                    }
                    carrito = carrito.filter(carritoId =>'ds'+carritoId !== id )
                    renderizarCarrito()
                    calcularTotal()
                    guardarCarritoEnLocalStorage()
                })
                li.appendChild(boton)
                lista.appendChild(li)
            })
        })
    }

    function calcularTotal() {
        total = 0;
        for (let item of carrito) {
            let producto = baseDeDatos.filter(elemento => elemento['_id'] == item );
            if(!producto.length){
                if(!document.getElementById("juguetes")){
                    producto = filtro('Juguete', data.response);
                }else if(!document.getElementById('farmacia')){
                    producto = filtro('Medicamento', data.response);
                }
            }
            total = total + producto[0]['precio'];
            console.log(total)
        }
        let totalDosDecimales = total.toFixed(2);
        spanTotal.forEach(span =>{
            span.textContent = totalDosDecimales;
        })
    }

    function guardarCarritoEnLocalStorage () {
        localStorage.setItem('carrito', JSON.stringify(carrito));
    }

    function cargarCarritoDeLocalStorage () {
        if (localStorage.getItem('carrito')) {
            carrito =[...JSON.parse(localStorage.getItem('carrito'))];
            calcularTotal();
            if(document.getElementById("juguetes") || document.getElementById('farmacia')){
                renderItems();
            }
            renderizarCarrito();
        }else{
            if(document.getElementById("juguetes") || document.getElementById('farmacia')){
                renderItems();
            }
            calcularTotal();
            renderizarCarrito();
        }
    }

    botonVaciar.forEach(boton =>{
        boton.addEventListener('click', ()=>{
            carrito = [];
            if(localStorage.getItem('carrito')){
                let nuevoLocalStorage = [...JSON.parse(localStorage.getItem('carrito'))]
                nuevoLocalStorage.forEach(id => {
                    let stock = document.getElementById('stock'+id)
                    let object = baseDeDatos.find(dato => dato._id == id)
                    stock.textContent = object.stock == 1? 'STOCK: '+object.stock+' UNIDAD' : 'STOCK: '+object.stock+' UNIDADES'
                    stock.classList.remove('btn-danger')
                    if(object.stock > 4){
                        let cartel = document.getElementById('u'+object._id)
                        cartel.textContent = ''
                        cartel.classList.remove('text-center', 'btn-danger')
                    }
                })
            }
            renderizarCarrito();
            calcularTotal();
            localStorage.clear();
        });
    })

    cargarCarritoDeLocalStorage();
    // renderItems();
    // calcularTotal();
    // renderizarCarrito();
    })
    .catch(error => console.log(error))
// }