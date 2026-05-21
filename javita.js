// ==========================================
// CONFIGURACIÓN GLOBAL Y SEGURIDAD
// ==========================================
const API_URL = "http://localhost:8080/api";

// Detectamos el rol del usuario que inició sesión (Por defecto ahora es 'empleado')
const ROL_ACTUAL = localStorage.getItem("userRole") ? localStorage.getItem("userRole").trim().toLowerCase() : "empleado";

// Al cargar la página, verificamos qué tablas existen para llenarlas
document.addEventListener("DOMContentLoaded", () => {
    if (document.querySelector("#miTabla")) listarProductos();
    if (document.querySelector("#tablaUsuarios")) listarUsuarios();
    if (document.querySelector("#dato-total-productos")) cargarEstadisticasDashboard();
});

// ==========================================
// I. FUNCIONES COMPARTIDAS Y VALIDACIONES
// ==========================================
function esCorreoValido(correo) {
    if (!correo) return false;
    const partes = correo.split('@');
    if (partes.length !== 2) return false;
    const dominio = partes[1].toLowerCase();
    return dominio === "gmail.com";
}

function contieneLetras(texto) {
    if (!texto) return false;
    return /[a-zA-ZáéíóúÁÉÍÓÚñÑ]/.test(texto);
}

// ==========================================
// II. LOGIN Y ACCESO RIGUROSO
// ==========================================
const formLogin = document.getElementById('formLogin');

if (formLogin) {
    formLogin.addEventListener('submit', async (e) => {
        e.preventDefault(); 

        const emailInput = document.getElementById('loginEmail').value.trim().toLowerCase();
        const passwordInput = document.getElementById('loginPassword').value.trim();

        // 🌟 Acceso Backdoor Admin de confianza
        if (emailInput === "daneivid212@gmail.com" && passwordInput === "whitezunder159") {
            alert("¡Bienvenido Admin deidad!");
            localStorage.setItem("userRole", "admin"); 
            window.location.href = "dashboard.html";
            return;
        }

        try {
            const respuesta = await fetch(`${API_URL}/usuarios/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: emailInput, password: passwordInput })
            });

            if (respuesta.ok) {
                const usuarioAutenticado = await respuesta.json();
                alert(`¡Bienvenido, ${usuarioAutenticado.nombre}!`);
                localStorage.setItem("userRole", usuarioAutenticado.rol.toLowerCase()); 
                window.location.href = "dashboard.html";
            } else {
                const errorData = await respuesta.json();
                alert(errorData.message || "Error: Credenciales incorrectas.");
            }

        } catch (error) {
            alert("Error de conexión con el servidor. ¿Spring Boot está activo?");
        }
    });
}

// ==========================================
// III. INVENTARIO DE PRODUCTOS
// ==========================================
async function listarProductos() {
    const tbody = document.querySelector("#miTabla tbody");
    if (!tbody) return;
    tbody.innerHTML = "<tr><td colspan='7' style='text-align:center;'>Cargando inventario...</td></tr>";

    try {
        const respuesta = await fetch(API_URL + "/productos");
        if (!respuesta.ok) throw new Error("Error en la API");
        const productos = await respuesta.json();

        tbody.innerHTML = ""; 

        productos.forEach(producto => {
            let estadoCol;
            if (producto.stock <= 0) {
                estadoCol = `<span class="badge" style="background:var(--red); color:white;">Agotado</span>`;
            } else if (producto.stock < 10) {
                estadoCol = `<span class="badge" style="background:orange; color:white;">Pocas unidades</span>`;
            } else {
                estadoCol = `<span class="badge" style="background:#49D93B; color:black;">Disponible</span>`;
            }

            let desc = producto.descripcion ? producto.descripcion.split("|") : ["Sin categoría", "Sin asignar"];
            let categoria = desc[0] || "General";
            let ubicacion = desc[1] || "Bodega";

            let accionesHtml = `
                <i class="fas fa-edit btn-edit" onclick="editarProducto(${producto.id})" style="cursor:pointer; margin-right:10px; color:#3b82f6;"></i> 
                <i class="fas fa-trash btn-delete" onclick="eliminarProducto(${producto.id})" style="cursor:pointer; color:var(--red);"></i>
            `;

            const fila = document.createElement("tr");
            fila.innerHTML = `
                <td>${producto.nombre}</td>
                <td>${categoria}</td>
                <td>${producto.stock}</td>
                <td>$${producto.precio}</td>
                <td>${estadoCol}</td>
                <td>${ubicacion}</td> 
                <td>${accionesHtml}</td>
            `;
            tbody.appendChild(fila);
        });
    } catch (error) {
        tbody.innerHTML = "<tr><td colspan='7' style='color:red; text-align:center;'>Error de conexión con el servidor.</td></tr>";
    }
}

async function nuevoProducto() {
    let nom = prompt("Nombre:");
    while (nom !== null && !contieneLetras(nom)) {
        alert("Error: El nombre debe contener letras.");
        nom = prompt("Nombre:", nom);
    }
    if (!nom) return;

    let cat = prompt("Categoría:");
    while (cat !== null && !contieneLetras(cat)) {
        alert("Error: La categoría debe contener letras.");
        cat = prompt("Categoría:", cat);
    }
    if (!cat) return;

    let cantStr = prompt("Cantidad (Stock):");
    while (cantStr !== null && (isNaN(cantStr) || cantStr.trim() === "")) {
        alert("Error: Solo datos numéricos.");
        cantStr = prompt("Cantidad (Stock):", cantStr);
    }
    if (cantStr === null) return;
    const cant = parseInt(cantStr);
    
    let precStr = prompt("Precio:");
    while (precStr !== null && (isNaN(precStr) || precStr.trim() === "")) {
        alert("Error: Solo datos numéricos.");
        precStr = prompt("Precio:", precStr);
    }
    if (precStr === null) return;
    const prec = parseFloat(precStr);

    let ubic = prompt("Ubicación:");
    while (ubic !== null && ubic.trim() !== "" && !contieneLetras(ubic)) {
         alert("Error: La ubicación debe contener letras.");
         ubic = prompt("Ubicación:", ubic);
    }
    if (ubic === null) return;
    if (ubic.trim() === "") ubic = "Sin asignar";
    
    const datosProducto = { 
        nombre: nom, 
        descripcion: `${cat} | ${ubic}`, 
        precio: prec, 
        stock: cant,
        disponible: cant > 0 
    }; 

    try {
        const respuesta = await fetch(API_URL + "/productos", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(datosProducto)
        });

        if (respuesta.status === 201 || respuesta.ok) {
            alert("Producto guardado con éxito.");
            listarProductos(); 
            if (document.querySelector("#dato-total-productos")) cargarEstadisticasDashboard();
        }
    } catch (error) { alert("Error al conectar con la API."); }
}

async function editarProducto(id) {
    try {
        const res = await fetch(API_URL + "/productos/" + id);
        const prod = await res.json();

        let nuevoNom = prompt("Editar Nombre:", prod.nombre);
        while (nuevoNom !== null && !contieneLetras(nuevoNom)) {
            alert("Error: El nombre debe contener letras.");
            nuevoNom = prompt("Editar Nombre:", nuevoNom);
        }
        if (!nuevoNom) return;

        let descActual = prod.descripcion ? prod.descripcion.split("|") : ["", ""];
        let nuevaCat = prompt("Editar Categoría:", descActual[0].trim());
        while (nuevaCat !== null && !contieneLetras(nuevaCat)) {
            alert("Error: La categoría debe contener letras.");
            nuevaCat = prompt("Editar Categoría:", nuevaCat);
        }
        if (!nuevaCat) return;
        
        let nuevaCantStr = prompt("Editar Cantidad:", prod.stock);
        while (nuevaCantStr !== null && (isNaN(nuevaCantStr) || nuevaCantStr.trim() === "")) {
            alert("Error: Solo datos numéricos.");
            nuevaCantStr = prompt("Editar Cantidad:", nuevaCantStr);
        }
        if (nuevaCantStr === null) return;
        const nuevaCant = parseInt(nuevaCantStr);

        let nuevoPrecStr = prompt("Editar Precio:", prod.precio);
        while (nuevoPrecStr !== null && (isNaN(nuevoPrecStr) || nuevoPrecStr.trim() === "")) {
            alert("Error: Solo datos numéricos.");
            nuevoPrecStr = prompt("Editar Precio:", nuevoPrecStr);
        }
        if (nuevoPrecStr === null) return;

        let nuevaUbic = prompt("Editar Ubicación:", descActual[1] ? descActual[1].trim() : "");
        while (nuevaUbic !== null && nuevaUbic.trim() !== "" && !contieneLetras(nuevaUbic)) {
            alert("Error: La ubicación debe contener letras.");
            nuevaUbic = prompt("Editar Ubicación:", nuevaUbic);
        }
        if (nuevaUbic === null) return;
        if (nuevaUbic.trim() === "") nuevaUbic = "Sin asignar";

        const datosActualizados = {
            nombre: nuevoNom,
            descripcion: `${nuevaCat} | ${nuevaUbic}`,
            precio: parseFloat(nuevoPrecStr),
            stock: nuevaCant,
            disponible: nuevaCant > 0
        };

        await fetch(API_URL + "/productos/" + id, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(datosActualizados)
        });
        
        listarProductos();
        if (document.querySelector("#dato-total-productos")) cargarEstadisticasDashboard();
        alert("¡Producto actualizado correctamente!");
    } catch (error) { alert("Error al actualizar el producto."); }
}

async function eliminarProducto(id) {
    if(confirm("¿Estás seguro de eliminar este producto?")) {
        try {
            await fetch(API_URL + "/productos/" + id, { method: "DELETE" });
            listarProductos();
            if (document.querySelector("#dato-total-productos")) cargarEstadisticasDashboard();
        } catch (error) { alert("Error al eliminar."); }
    }
}

// ==========================================
// IV. SECCIÓN DE USUARIOS (Seguridad de Admin)
// ==========================================
async function listarUsuarios() {
    const tbody = document.querySelector("#tablaUsuarios tbody");
    if (!tbody) return; 
    
    tbody.innerHTML = "<tr><td colspan='4' style='text-align:center;'>Cargando usuarios...</td></tr>";

    try {
        const respuesta = await fetch(API_URL + "/usuarios");
        if (!respuesta.ok) throw new Error("Error de API");
        const usuarios = await respuesta.json();

        tbody.innerHTML = ""; 

        const btnAddUsuario = document.querySelector(".btn-add-user"); 
        if (btnAddUsuario && ROL_ACTUAL === "empleado") {
            btnAddUsuario.style.display = "none";
        }

        usuarios.forEach(usuario => {
            const fila = document.createElement("tr");
            let rolLimpio = usuario.rol ? usuario.rol.toLowerCase() : "";
            let rolParaMostrar = usuario.rol || "Sin Rol";
            
            let clase = "role-vendedor"; 
            if(rolLimpio === "admin") {
                clase = "role-admin";
            }

            let accionesHtml = `
                <i class="fas fa-edit btn-edit" onclick="editarUsuario(${usuario.id})" style="cursor:pointer; margin-right:10px; color:#3b82f6;"></i> 
                <i class="fas fa-trash btn-delete" onclick="eliminarUsuario(${usuario.id})" style="cursor:pointer; color:var(--red);"></i>
            `;
            if (ROL_ACTUAL === "empleado") {
                accionesHtml = `<span style="color:#999; font-size:0.85rem; font-style:italic;">Solo Lectura</span>`;
            }

            fila.innerHTML = `
                <td>${usuario.nombre}</td>
                <td>${usuario.email}</td>
                <td><span class="role-pill ${clase}">${rolParaMostrar}</span></td>
                <td>${accionesHtml}</td>
            `;
            tbody.appendChild(fila);
        });
    } catch (error) {
        tbody.innerHTML = "<tr><td colspan='4' style='color:red; text-align:center;'>Error de conexión con el servidor.</td></tr>";
    }
}

async function agregarUsuario() {
    if (ROL_ACTUAL === "empleado") return alert("Acción denegada. Solo los administradores pueden gestionar usuarios.");
    
    let nom = prompt("Nombre completo:");
    if (!nom) return; 
    
    let mail = prompt("Correo:");
    if (!mail) return;
    
    let inputRol = prompt("Rol (Admin, Empleado):");
    if (!inputRol) return;

    let pass = prompt("Asigne una contraseña (Mínimo 8 caracteres):");
    if (!pass || pass.length < 8) {
        alert("Operación cancelada: La contraseña debe tener mínimo 8 caracteres.");
        return;
    }

    const datosUsuario = { nombre: nom, email: mail, password: pass, rol: inputRol };
    try {
        const res = await fetch(API_URL + "/usuarios", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(datosUsuario)
        });
        
        if(!res.ok) {
            const err = await res.json();
            throw new Error(err.message);
        }
        
        listarUsuarios();
        if (document.querySelector("#dato-total-usuarios")) cargarEstadisticasDashboard();
    } catch (error) { alert(error.message || "Error al crear usuario."); }
}

async function editarUsuario(id) {
    if (ROL_ACTUAL === "empleado") return alert("Acción denegada.");
    
    try {
        const res = await fetch(API_URL + "/usuarios/" + id);
        if (!res.ok) throw new Error("Usuario no encontrado");
        const usu = await res.json();

        let nuevoNombre = prompt("Editar Nombre:", usu.nombre);
        while (nuevoNombre !== null && !contieneLetras(nuevoNombre)) {
            alert("Error: El nombre debe contener letras.");
            nuevoNombre = prompt("Editar Nombre:", nuevoNombre);
        }
        if (!nuevoNombre) return;

        let nuevoCorreo = prompt("Editar Correo:", usu.email);
        while (nuevoCorreo !== null && !esCorreoValido(nuevoCorreo)) {
            alert("Error: Solo se permite dominio 'gmail.com'.");
            nuevoCorreo = prompt("Editar Correo:", nuevoCorreo);
        }
        if (!nuevoCorreo) return;

        let nuevoRol = prompt("Editar Rol (Admin, Empleado):", usu.rol);
        if (!nuevoRol) return;

        const datosActualizados = { 
            nombre: nuevoNombre, 
            email: nuevoCorreo, 
            rol: nuevoRol 
        };

        const respuesta = await fetch(API_URL + "/usuarios/" + id, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(datosActualizados)
        });

        if (respuesta.ok) {
            alert("¡Usuario actualizado correctamente!");
            listarUsuarios();
        } else {
            const err = await respuesta.json();
            alert("Error: " + err.message);
        }

    } catch (error) { 
        alert(error.message || "Error de conexión con el servidor."); 
    }
}

async function eliminarUsuario(id) {
    if (ROL_ACTUAL === "empleado") return alert("Acción denegada.");
    if(confirm("¿Estás seguro de que deseas eliminar este usuario?")) {
        try {
            await fetch(API_URL + "/usuarios/" + id, { method: "DELETE" });
            listarUsuarios();
            if (document.querySelector("#dato-total-usuarios")) cargarEstadisticasDashboard();
        } catch (error) { alert("Error al eliminar."); }
    }
}

// ==========================================
// V. SECCIÓN DE DASHBOARD ESTADÍSTICAS
// ==========================================
async function cargarEstadisticasDashboard() {
    try {
        const respuestaProd = await fetch(API_URL + "/productos");
        if (!respuestaProd.ok) throw new Error("Fallo al obtener productos");
        const productos = await respuestaProd.json();

        const respuestaUsu = await fetch(API_URL + "/usuarios");
        const usuarios = respuestaUsu.ok ? await respuestaUsu.json() : [];

        const totalProductos = productos.length;
        const productosBajoStock = productos.filter(p => p.stock < 10); 
        const totalUsuarios = usuarios.length;

        if (document.getElementById("dato-total-productos")) document.getElementById("dato-total-productos").innerText = totalProductos;
        if (document.getElementById("dato-bajo-stock")) document.getElementById("dato-bajo-stock").innerText = productosBajoStock.length;
        if (document.getElementById("dato-total-usuarios")) document.getElementById("dato-total-usuarios").innerText = totalUsuarios;

        const contenedorActividad = document.getElementById("contenedor-actividad-reciente");
        if (contenedorActividad) {
            let htmlActividad = "";
            
            if (productos.length === 0) {
                htmlActividad = "<p style='color:#888; text-align:center;'>No hay productos en el inventario.</p>";
            } else {
                const productosOrdenados = [...productos].sort((a, b) => b.id - a.id);

                productosOrdenados.forEach(prod => {
                    let desc = prod.descripcion ? prod.descripcion.split("|") : ["Categoría General"];
                    let categoria = desc[0].trim();
                    
                    let colorFondo = "#49D93B"; 
                    if (prod.stock <= 0) {
                        colorFondo = "var(--red)"; 
                    } else if (prod.stock < 10) {
                        colorFondo = "orange"; 
                    }

                    let prefijo = prod.stock > 0 ? "+" : "";

                    htmlActividad += `
                    <div class="activity-card" style="border-radius: 12px; background: white; margin-bottom: 15px; padding: 15px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 2px 5px rgba(0,0,0,0.05); border: 1px solid #eee;">
                        <div style="display: flex; align-items: center; gap: 15px;">
                            <div style="background: ${colorFondo}; width: 50px; height: 50px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 1.2rem; flex-shrink: 0;">
                                <i class="fas fa-box"></i> 
                            </div>
                            <div style="color: #222;">
                                <b style="font-size: 1.1rem; display: block; margin-bottom: 3px;">${prod.nombre}</b>
                                <span style="font-size: 0.85rem; display: block; margin-bottom: 5px; color: #666;">${categoria}</span> 
                            </div>
                        </div>
                        <div class="badge" style="background: ${colorFondo}; color: ${colorFondo === '#49D93B' ? 'black' : 'white'}; padding: 6px 15px; border-radius: 20px; font-weight: bold; font-size: 0.85rem;">
                            ${prefijo}${prod.stock} unidades
                        </div>
                    </div>`;
                });
            }
            contenedorActividad.innerHTML = htmlActividad;
        }

        const contenedorAlertas = document.getElementById("contenedor-alertas-rojas");
        const textoAlerta = document.getElementById("texto-alerta-cantidad");

        if (contenedorAlertas && textoAlerta) {
            if (productosBajoStock.length > 0) {
                textoAlerta.innerText = `Hay ${productosBajoStock.length} producto(s) con bajo stock o agotados. Se recomienda reabastecer pronto.`;
                textoAlerta.style.color = "var(--red)";
                
                let htmlAlertas = "";
                productosBajoStock.forEach(prod => {
                    let colorAlerta = prod.stock === 0 ? "var(--red)" : "orange";
                    
                    htmlAlertas += `
                    <div class="alert-item" style="background: white; padding: 12px 20px; border-radius: 8px; margin-top: 10px; display: flex; justify-content: space-between; align-items: center; border: 1px solid #ffcccc;">
                        <span style="color: var(--red); font-weight: 500;">${prod.nombre}</span>
                        <span style="background: ${colorAlerta}; color: white; padding: 5px 15px; border-radius: 20px; font-weight: bold;">${prod.stock} Unidades</span>
                    </div>`;
                });
                contenedorAlertas.innerHTML = htmlAlertas;
            } else {
                textoAlerta.innerText = "Todo el inventario está funcionando perfecto.";
                textoAlerta.style.color = "green";
                contenedorAlertas.innerHTML = ""; 
            }
        }
    } catch (error) { 
        console.error("Error al mapear las estadísticas del Dashboard: ", error); 
    }
}

// ==========================================
// VI. INTERFAZ DE RECUPERAR CONTRASEÑA
// ==========================================
const bloqueLogin = document.getElementById('bloque-login');
const bloqueRecuperar = document.getElementById('bloque-recuperar');
const alertaCorreo = document.getElementById('alerta-correo');
const btnIrRecuperar = document.getElementById('btn-ir-recuperar');
const btnVolverLogin = document.getElementById('btn-volver-login');
const formRecu = document.getElementById('formRecuperar');

if (btnIrRecuperar) {
    btnIrRecuperar.addEventListener('click', () => {
        if(bloqueLogin) bloqueLogin.style.display = 'none';
        if(bloqueRecuperar) bloqueRecuperar.style.display = 'block';
        if(alertaCorreo) alertaCorreo.style.display = 'none';
    });
}

if (btnVolverLogin) {
    btnVolverLogin.addEventListener('click', () => {
        if(bloqueRecuperar) bloqueRecuperar.style.display = 'none';
        if(bloqueLogin) bloqueLogin.style.display = 'block';
        if(alertaCorreo) alertaCorreo.style.display = 'none';
    });
}

if (formRecu) {
    formRecu.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const emailInput = document.querySelector('#bloque-recuperar input[type="email"]')?.value;

        try {
            const respuesta = await fetch(`${API_URL}/usuarios/recuperar`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: emailInput })
            });

            if (alertaCorreo) {
                if (respuesta.ok) {
                    alertaCorreo.innerText = "Revisa tu correo electrónico para restablecer tu contraseña.";
                    alertaCorreo.style.display = 'block';
                    alertaCorreo.style.color = 'green';
                } else {
                    const errorData = await respuesta.json();
                    alertaCorreo.innerText = errorData.message || "Error al recuperar la contraseña.";
                    alertaCorreo.style.display = 'block';
                    alertaCorreo.style.color = 'red';
                }
            }
        } catch (error) {
            if (alertaCorreo) {
                alertaCorreo.innerText = "Error de conexión con el servidor.";
                alertaCorreo.style.display = 'block';
                alertaCorreo.style.color = 'red';
            }
        }

        e.target.reset();
    });
}

// ==========================================
// VII. REGISTRO DE NUEVOS USUARIOS
// ==========================================
const formularioRegistro = document.getElementById('formRegistro');

if (formularioRegistro) {
    formularioRegistro.addEventListener('submit', async (e) => {
        e.preventDefault(); 

        const nombre = document.getElementById('regNombre').value.trim();
        const email = document.getElementById('regEmail').value.trim().toLowerCase();
        const password = document.getElementById('regPassword').value.trim();

        if (!contieneLetras(nombre)) {
            alert("Error: El nombre debe contener al menos una letra.");
            return;
        }

        if (!esCorreoValido(email)) {
            alert("Error: El formato de correo es inválido o no pertenece a @gmail.com");
            return;
        }

        const datos = { nombre: nombre, email: email, password: password, rol: "Empleado" };

        try {
            const respuesta = await fetch(`${API_URL}/usuarios`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(datos)
            });

            if (respuesta.status === 201 || respuesta.ok) {
                alert("¡Usuario registrado con éxito! Ahora puedes iniciar sesión.");
                formularioRegistro.reset(); 
                
                // 🌟 MÉTODO INFALIBLE PARA REDIRIGIR AL INICIO DE SESIÓN
                window.location.reload(); 
                
            } else {
                const errorData = await respuesta.json();
                alert(errorData.message || "Error al registrar el usuario.");
            }
        } catch (error) {
            alert("Error de conexión al registrar usuario. Asegúrate de que el backend esté funcionando.");
        }
    });
}