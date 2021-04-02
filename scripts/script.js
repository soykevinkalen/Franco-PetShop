function openNav() {
    document.getElementById("mySidenav").style.width = "400px";
    document.getElementById("main").style.marginLeft = "400px";
  }
  
function closeNav() {
    document.getElementById("mySidenav").style.width = "0";
    document.getElementById("main").style.marginLeft= "0";
}

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
                setTimeout(function(){ window.location.href = "/";},1800);                
            }
            form.classList.add('was-validated')
        }, false)
      })
  })()

function filtro(tipo, productos) {
    let array = productos.filter(producto => producto.tipo == tipo)
    return array;
}

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
    const botonPagar = document.querySelectorAll('.boton-pagar')

    function renderItems() {
        let divItems = document.querySelector('#items');
        for (let info of baseDeDatos) {
            let unidad = document.createElement('p')
            unidad.setAttribute('id','u'+info['_id'])           
            let divContainer = document.createElement('div')
            divContainer.classList.add('carta')
            let imagen = document.createElement('div')
            imagen.style.backgroundImage = `url(${info['imagen']})`
            imagen.classList.add('imagenCarta')
            let titulo = document.createElement('h5')
            titulo.classList.add('nombre','text-center', 'pt-2')
            titulo.textContent = info['nombre']
            let precio = document.createElement('p')
            precio.classList.add('ps-2')
            precio.textContent = 'Precio: $' + info['precio']   
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
                let bodyModal = document.getElementById('modalBody')
                bodyModal.textContent = productoModal.descripcion
            })
            let myToast = document.getElementById('liveToast')
            let toast =  new bootstrap.Toast(myToast)    
            var texto = document.getElementsByClassName('toast-body')
            let boton = document.createElement('button');
            boton.classList.add('btn', 'btn-success', 'btn-sm', 'mt-1');
            boton.textContent = 'Comprar';
            boton.setAttribute('id', info['_id']);
            boton.addEventListener('click', (e)=>{
                let numeroDeUnidades = carrito.reduce((total, itemId) => itemId === e.target.getAttribute('id') ? total += 1 : total, 0)
                let producto = baseDeDatos.find(elemento => elemento['_id'] == e.target.getAttribute('id') )
                if(numeroDeUnidades != producto.stock){
                    texto[0].textContent = 'Compra realizada'
                    toast._timeout = 0
                    toast._element.classList.remove('bg-danger')
                    toast._element.classList.add('bg-success')
                    toast._config.delay = 500
                    toast.show()
                    carrito.push(e.target.getAttribute('id'))
                    calcularTotal();
                    renderizarCarrito();
                    guardarCarritoEnLocalStorage();
                }else{
                    texto[0].textContent = 'Sin stock'
                    toast._timeout = 0
                    toast._element.classList.remove('bg-success')
                    toast._element.classList.add('bg-danger')
                    toast._config.delay = 500
                    toast.show()
                }
            });
            let deshacer = document.createElement('button');
            deshacer.classList.add('btn', 'btn-danger','mt-1', 'btn-sm');
            deshacer.textContent = 'Deshacer compra';
            deshacer.setAttribute('id','d'+info['_id']);
            let id = null
            let nuevoLocalStorage = []
            let pos = null 
            deshacer.addEventListener('click', (e)=>{
                id = carrito.find(producto => 'd'+producto === e.target.id)
                if(id){
                    texto[0].textContent = 'Compra eliminada'
                    toast._timeout = 0
                    toast._element.classList.remove('bg-success')
                    toast._element.classList.add('bg-danger')
                    toast._config.delay = 500
                    toast.show()
                    nuevoLocalStorage = [...JSON.parse(localStorage.getItem('carrito'))]
                    pos = nuevoLocalStorage.indexOf(id)    
                    nuevoLocalStorage.splice(pos, 1)
                    carrito = [...nuevoLocalStorage]
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
            divContainer.appendChild(descripcionModal)
            divContainer.appendChild(boton)
            divContainer.appendChild(deshacer)
            divItems.appendChild(divContainer)
        }
    }
    function renderizarCarrito() {
        let carritoSinDuplicados = [...new Set(carrito)]
        listaCarrito.forEach(lista =>{
            lista.textContent = ''
            carritoSinDuplicados.forEach(item => {
                let producto = data.response.find(elemento => elemento['_id'] == item )
                let numeroDeUnidades = carrito.reduce((total, itemId) => itemId === item ? total += 1 : total, 0)
                let compra = document.createElement('button');
                compra.classList.add('btn', 'btn-success', 'me-2');
                compra.textContent = '+';
                let myToast = document.getElementById('liveToast')
                let toast =  new bootstrap.Toast(myToast)    
                var texto = document.getElementsByClassName('toast-body')
                let imagen = document.createElement('div')
                imagen.style.backgroundImage = `url(${producto['imagen']})`
                imagen.classList.add('imagenCarrito')
                compra.setAttribute('id', producto['_id']);
                compra.addEventListener('click', (e)=>{
                    if(numeroDeUnidades != producto.stock){
                        carrito.push(e.target.getAttribute('id'))
                        calcularTotal();
                        renderizarCarrito();
                        guardarCarritoEnLocalStorage();
                    }else{
                        texto[0].textContent = 'Sin stock'
                        toast._timeout = 0
                        toast._element.classList.remove('bg-success')
                        toast._element.classList.add('bg-danger')
                        toast._config.delay = 500
                        toast.show()
                    }
                });
                let deshacer = document.createElement('button');
                deshacer.classList.add('btn', 'btn-primary', 'ms-2');
                deshacer.textContent = '-';
                deshacer.setAttribute('id','d'+producto['_id']);
                let id = null
                let nuevoLocalStorage = []
                let pos = null 
                deshacer.addEventListener('click', (e)=>{
                    id = carrito.find(producto => 'd'+producto === e.target.id)
                    if(id){
                        nuevoLocalStorage = [...JSON.parse(localStorage.getItem('carrito'))]
                        pos = nuevoLocalStorage.indexOf(id)    
                        nuevoLocalStorage.splice(pos, 1)
                        carrito = [...nuevoLocalStorage]
                        calcularTotal();
                        renderizarCarrito();
                        guardarCarritoEnLocalStorage();
                    }
                });
                let divTexto = document.createElement('div')
                let divBotones = document.createElement('div')
                let spanUnidades = document.createElement('span')
                let divTextoTotal = document.createElement('div')
                let spanTextoTotal = document.createElement('span')

                spanTextoTotal.textContent = `Total del producto: $${producto['precio']*numeroDeUnidades}`
                spanTextoTotal.classList.add('text-center','w-100')
                divTextoTotal.appendChild(spanTextoTotal)
                spanUnidades.textContent = numeroDeUnidades
                divBotones.appendChild(compra)
                divBotones.appendChild(spanUnidades)
                divBotones.appendChild(deshacer)
                divBotones.classList.add('d-flex', 'justify-content-center', 'align-items-center','mt-2')
                let li = document.createElement('li')
                li.classList.add('list-group-item', 'text-right', 'mx-2','d-flex', 'flex-column','justify-content-center','align-items-center')
                divTexto.textContent = `${producto['nombre']} - $${producto['precio']}`
                divTexto.classList.add('text-center')
                li.appendChild(imagen)
                let boton = document.createElement('button')
                boton.classList.add('btn', 'btn-danger','mt-1','w-100')
                boton.textContent = 'Deshacer compras'
                boton.setAttribute('item', 'ds'+item)
                boton.addEventListener('click', (e)=>{
                    let id = e.target.getAttribute('item')
                    carrito = carrito.filter(carritoId =>'ds'+carritoId !== id )
                    renderizarCarrito()
                    calcularTotal()
                    guardarCarritoEnLocalStorage()
                })
                divTextoTotal.appendChild(boton)
                divTextoTotal.classList.add('d-flex','flex-column', 'mt-2','w-100')
                li.appendChild(divTexto)
                li.appendChild(divBotones)
                li.appendChild(divTextoTotal)
                li.classList.add('mt-2')
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
            renderizarCarrito();
            calcularTotal();
            localStorage.clear();
        });
    })
    botonPagar.forEach(boton =>{
        boton.addEventListener('click', ()=>{
            carrito = [];
            renderizarCarrito();
            calcularTotal();
            localStorage.clear();
            setTimeout(function(){ window.location.href = "/";},500);                
        });
    })

    cargarCarritoDeLocalStorage();
    })
    .catch(error => console.log(error))