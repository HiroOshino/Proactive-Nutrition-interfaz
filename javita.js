// config global URL de la pag...
const API_URL = "http://localhost:8080/api";

// Al cargar la página, verificamos qué tablas existen para llenarlas
document.addEventListener("DOMContentLoaded", () => {
    if (document.querySelector("#miTabla")) listarProductos();
    if (document.querySelector("#tablaUsuarios")) listarUsuarios();
    // Dispara el Dashboard si detecta que estamos en esa pantalla
    if (document.querySelector("#dato-total-productos")) cargarEstadisticasDashboard();
});

// ==========================================
// I. FUNCIONES COMPARTIDAS Y VALIDACIONES
// ==========================================

// Validación de correo 
function esCorreoValido(correo) {
    if (!correo) return false;
    const partes = correo.split('@');
    if (partes.length !== 2) return false;
    const dominio = partes[1].toLowerCase();
    return dominio === "gmail.com";
}

// NUEVO: Validación para exigir al menos una letra (evita puros números "1111")
function contieneLetras(texto) {
    if (!texto) return false;
    return /[a-zA-ZáéíóúÁÉÍÓÚñÑ]/.test(texto);
}

// ==========================================
// II. SECCIÓN DE INVENTARIO
// ==========================================

async function listarProductos() {
    const tbody = document.querySelector("#miTabla tbody");
    tbody.innerHTML = "<tr><td colspan='7' style='text-align:center;'>Cargando inventario...</td></tr>";

    try {
        const respuesta = await fetch(API_URL + "/productos");
        if (!respuesta.ok) throw new Error("Error en la API");
        const productos = await respuesta.json();

        tbody.innerHTML = ""; 

        productos.forEach(producto => {
            //lógica de colores para el stock
            let estadoCol;
            if (producto.stock <= 0) {
                estadoCol = `<span class="badge" style="background:var(--red); color:white;">Agotado</span>`;
            } else if (producto.stock < 10) {
                estadoCol = `<span class="badge" style="background:orange; color:white;">Pocas unidades</span>`;
            } else {
                estadoCol = `<span class="badge" style="background:#49D93B; color:black;">Disponible</span>`;
            }

            // Separamos la categoría y ubicación si las guardamos juntas en "descripcion"
            let desc = producto.descripcion ? producto.descripcion.split("|") : ["Sin categoría", "Sin asignar"];
            let categoria = desc[0] || "General";
            let ubicacion = desc[1] || "Bodega";

            const fila = document.createElement("tr");
            fila.innerHTML = `
                <td>${producto.nombre}</td>
                <td>${categoria}</td>
                <td>${producto.stock}</td>
                <td>$${producto.precio}</td>
                <td>${estadoCol}</td>
                <td>${ubicacion}</td> 
                <td>
                    <i class="fas fa-edit btn-edit" onclick="editarProducto(${producto.id})" style="cursor:pointer; margin-right:10px;"></i> 
                    <i class="fas fa-trash btn-delete" onclick="eliminarProducto(${producto.id})" style="cursor:pointer; color:var(--red);"></i>
                </td>
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
        alert("Error: El nombre debe contener letras (Ej: Bolso Totto 1). No se aceptan solo números.");
        nom = prompt("Nombre:", nom);
    }
    if (!nom) return;

    let cat = prompt("Categoría:");
    while (cat !== null && !contieneLetras(cat)) {
        alert("Error: La categoría debe contener letras (Ej: Deportes).");
        cat = prompt("Categoría:", cat);
    }
    if (!cat) return;

    const cantStr = prompt("Cantidad (Stock):");
    if (!cantStr) return;
    const cant = parseInt(cantStr);
    
    let precStr = prompt("Precio (Ej: 85000):");
    if (!precStr) return;
    const prec = parseFloat(precStr.replace('$', '').replace('.', ''));

    let ubic = prompt("Ubicación (Ej. Pasillo A):");
    while (ubic !== null && ubic.trim() !== "" && !contieneLetras(ubic)) {
         alert("Error: La ubicación debe contener letras (Ej: Estante 1).");
         ubic = prompt("Ubicación (Ej. Pasillo A):", ubic);
    }
    if (ubic === null) return;
    if (ubic.trim() === "") ubic = "Sin asignar";
    
    if(!isNaN(cant) && !isNaN(prec)) { 
        const datosProducto = {
            nombre: nom,
            descripcion: `${cat} | ${ubic}`, 
            precio: prec,
            stock: cant
        };

        try {
            const respuesta = await fetch(API_URL + "/productos", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(datosProducto)
            });

            if (respuesta.status === 201) {
                alert("Producto guardado en la base de datos.");
                listarProductos(); 
                if (document.querySelector("#dato-total-productos")) cargarEstadisticasDashboard();
            } else {
                const error = await respuesta.json();
                alert("Error de validación:\n" + error.errores.join("\n"));
            }
        } catch (error) {
            alert("Error al conectar con la API.");
        }
    } else {
        alert("Error: Los valores numéricos de cantidad o precio son inválidos.");
    }
}

async function editarProducto(id) {
    try {
        const res = await fetch(API_URL + "/productos/" + id);
        if (!res.ok) throw new Error("Producto no encontrado");
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

        const nuevaCantStr = prompt("Editar Cantidad (Stock):", prod.stock);
        if (!nuevaCantStr) return;
        const nuevaCant = parseInt(nuevaCantStr);

        const nuevoPrecStr = prompt("Editar Precio:", prod.precio);
        if (!nuevoPrecStr) return;
        const nuevoPrec = parseFloat(nuevoPrecStr.replace('$', '').replace('.', ''));

        let nuevaUbic = prompt("Editar Ubicación:", descActual[1] ? descActual[1].trim() : "");
        while (nuevaUbic !== null && nuevaUbic.trim() !== "" && !contieneLetras(nuevaUbic)) {
            alert("Error: La ubicación debe contener letras.");
            nuevaUbic = prompt("Editar Ubicación:", nuevaUbic);
        }
        if (nuevaUbic === null) return;
        if (nuevaUbic.trim() === "") nuevaUbic = "Sin asignar";

        if (!isNaN(nuevaCant) && !isNaN(nuevoPrec)) {
            const datosActualizados = {
                nombre: nuevoNom,
                descripcion: `${nuevaCat} | ${nuevaUbic}`,
                precio: nuevoPrec,
                stock: nuevaCant
            };

            const respuesta = await fetch(API_URL + "/productos/" + id, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(datosActualizados)
            });

            if (respuesta.ok) {
                alert("Producto actualizado.");
                listarProductos();
                if (document.querySelector("#dato-total-productos")) cargarEstadisticasDashboard();
            } else {
                alert("Error al actualizar los datos.");
            }
        } else {
            alert("Error: Cantidad o Precio inválidos.");
        }
    } catch (error) {
        alert("Error de red.");
    }
}

async function eliminarProducto(id) {
    if(confirm("¿Estás seguro de eliminar este producto de la base de datos?")) {
        try {
            await fetch(API_URL + "/productos/" + id, { method: "DELETE" });
            listarProductos();
            if (document.querySelector("#dato-total-productos")) cargarEstadisticasDashboard();
        } catch (error) {
            alert("Error al eliminar.");
        }
    }
}

// ==========================================
// III. SECCIÓN DE USUARIOS
// ==========================================
async function listarUsuarios() {
    const tbody = document.querySelector("#tablaUsuarios tbody");
    tbody.innerHTML = "<tr><td colspan='5' style='text-align:center;'>Cargando usuarios...</td></tr>";

    try {
        const respuesta = await fetch(API_URL + "/usuarios");
        if (!respuesta.ok) throw new Error("Error de API");
        const usuarios = await respuesta.json();

        tbody.innerHTML = ""; 

        usuarios.forEach(usuario => {
            const fila = document.createElement("tr");

            let rolLimpio = usuario.rol ? usuario.rol.toLowerCase() : "";
            let clase = "role-owner"; 
            let rolParaMostrar = usuario.rol || "Sin Rol";

            if(rolLimpio === "admin") clase = "role-admin";
            else if(rolLimpio === "vendedor") clase = "role-vendedor";
            else if(rolLimpio === "almacenista") clase = "role-almacenista";

            fila.innerHTML = `
                <td>${usuario.nombre}</td>
                <td>${usuario.email}</td>
                <td><span class="role-pill ${clase}">${rolParaMostrar}</span></td>
                <td style="letter-spacing: 2px;">••••••••</td> <td>
                    <i class="fas fa-edit btn-edit" onclick="editarUsuario(${usuario.id})" style="cursor:pointer; margin-right:10px;"></i> 
                    <i class="fas fa-trash btn-delete" onclick="eliminarUsuario(${usuario.id})" style="cursor:pointer; color:var(--red);"></i>
                </td>
            `;
            tbody.appendChild(fila);
        });
    } catch (error) {
        tbody.innerHTML = "<tr><td colspan='5' style='color:red; text-align:center;'>Error de conexión con el servidor.</td></tr>";
    }
}

async function agregarUsuario() {
    let nom = prompt("Nombre completo:");
    while (nom !== null && !contieneLetras(nom)) {
        alert("Error: El nombre debe contener letras.");
        nom = prompt("Nombre completo:", nom);
    }
    if (!nom) return; 

    let mail = prompt("Correo:");
    while (mail !== null && !esCorreoValido(mail)) {
        alert("Error: El gmail es incorrecto 'gmail.com'.");
        mail = prompt("Correo (ejemplo@gmail.com):", mail);
    }
    if (!mail) return;

    let inputRol = prompt("Rol (Owner, Admin, Vendedor, Almacenista):");
    if (!inputRol) return;

    let rolLimpio = inputRol.replaceAll(" ", "").toLowerCase();
    const rolesPermitidos = ["owner", "admin", "vendedor", "almacenista"];

    while (inputRol !== null && !rolesPermitidos.includes(rolLimpio)) {
        alert("Error: Rol no reconocido.");
        inputRol = prompt("Rol (Owner, Admin, Vendedor, Almacenista):", inputRol);
        if (!inputRol) return; 
        rolLimpio = inputRol.replaceAll(" ", "").toLowerCase(); 
    }

    let pass = prompt("Asigne una contraseña (Mínimo 6 caracteres):");
    if (!pass || pass.length < 6) {
        alert("Error: Contraseña inválida.");
        return;
    }

    const datosUsuario = {
        nombre: nom,
        email: mail,
        password: pass,
        rol: inputRol
    };

    try {
        const respuesta = await fetch(API_URL + "/usuarios", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(datosUsuario)
        });

        if (respuesta.status === 201) {
            alert("GG Usuario guardado en la base de datos.");
            listarUsuarios();
            if (document.querySelector("#dato-total-productos")) cargarEstadisticasDashboard();
        } else {
            const error = await respuesta.json();
            alert("Error al guardar: \n" + (error.errores ? error.errores.join("\n") : error.mensaje));
        }
    } catch (error) {
        alert(" pipi Error de conexión con Spring Boot.");
    }
}

async function editarUsuario(id) {
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

        let nuevoRol = prompt("Editar Rol (Owner, Admin, Vendedor, Almacenista):", usu.rol);
        if (!nuevoRol) return;

        let rolLimpio = nuevoRol.replaceAll(" ", "").toLowerCase();
        const rolesPermitidos = ["owner", "admin", "vendedor", "almacenista"];

        while (nuevoRol !== null && !rolesPermitidos.includes(rolLimpio)) {
            alert("Error: Rol no válido.");
            nuevoRol = prompt("Editar Rol:", nuevoRol);
            if (!nuevoRol) return;
            rolLimpio = nuevoRol.replaceAll(" ", "").toLowerCase();
        }

        const nuevaPass = prompt("Confirme o ingrese nueva contraseña (Mínimo 6 caracteres):");
        if (!nuevaPass || nuevaPass.length < 6) return;

        const datosActualizados = {
            nombre: nuevoNombre,
            email: nuevoCorreo,
            password: nuevaPass,
            rol: nuevoRol
        };

        const respuesta = await fetch(API_URL + "/usuarios/" + id, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(datosActualizados)
        });

        if (respuesta.ok) {
            alert("Usuario ha sido actualizado.");
            listarUsuarios();
        } else {
            alert("Error al actualizar usuario.");
        }
    } catch (error) {
        alert("Error de red.");
    }
}

async function eliminarUsuario(id) {
    if(confirm("¿Estás seguro de que deseas eliminar este usuario de la API?")) {
        try {
            await fetch(API_URL + "/usuarios/" + id, { method: "DELETE" });
            listarUsuarios();
            if (document.querySelector("#dato-total-productos")) cargarEstadisticasDashboard();
        } catch (error) {
            alert("Error al eliminar.");
        }
    }
}

// ==========================================
// IV. SECCIÓN DE DASHBOARD Estadisticas
// ==========================================
async function cargarEstadisticasDashboard() {
    try {
        const respuesta = await fetch(API_URL + "/dashboard/stats");
        if (!respuesta.ok) throw new Error("Fallo en la API");
        const stats = await respuesta.json();

        // 1. Llenar las 3 tarjetas principales
        document.getElementById("dato-total-productos").innerText = stats.totalProductos;
        document.getElementById("dato-bajo-stock").innerText = stats.bajoStockCount;
        document.getElementById("dato-total-usuarios").innerText = stats.totalUsuarios;

        // 2. Llenar la zona de ACTIVIDAD RECIENTE 
        const contenedorActividad = document.getElementById("contenedor-actividad-reciente");
        if (contenedorActividad && stats.actividadReciente) {
            let htmlActividad = "";
            
            if (stats.actividadReciente.length === 0) {
                htmlActividad = "<p style='color:#888;'>No hay actividad reciente registrada.</p>";
            } else {
                stats.actividadReciente.forEach(prod => {
                    let desc = prod.descripcion ? prod.descripcion.split("|") : ["Categoría General"];
                    let categoria = desc[0].trim();

                    let colorFondo = "#4CAF50"; 
                    let prefijo = "+"; 

                    if (prod.stock <= 0) {
                        colorFondo = "red"; 
                        prefijo = ""; 
                    } else if (prod.stock < 10) {
                        colorFondo = "orange"; 
                        prefijo = "";
                    }

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
                        <div class="badge" style="background: ${colorFondo}; color: white; padding: 6px 15px; border-radius: 20px; font-weight: bold; font-size: 0.85rem;">
                            ${prefijo}${prod.stock} unidades
                        </div>
                    </div>
                    `;
                });
            }
            contenedorActividad.innerHTML = htmlActividad;
        }

        // 3. Llenar la zona de Alertas Rojas
        const contenedorAlertas = document.getElementById("contenedor-alertas-rojas");
        const textoAlerta = document.getElementById("texto-alerta-cantidad");

        if (stats.listaBajoStock && stats.listaBajoStock.length > 0) {
            textoAlerta.innerText = `Hay ${stats.listaBajoStock.length} producto(s) con bajo stock o agotados. Se recomienda reabastecer pronto.`;
            textoAlerta.style.color = "red";
            
            let htmlAlertas = "";
            stats.listaBajoStock.forEach(prod => {
                let colorFondo = prod.stock === 0 ? "red" : "orange";
                
                htmlAlertas += `
                <div class="alert-item" style="background: white; padding: 12px 20px; border-radius: 8px; margin-top: 10px; display: flex; justify-content: space-between; align-items: center; border: 1px solid #ffcccc;">
                    <span style="color: var(--red); font-weight: 500;">${prod.nombre}</span>
                    <span style="background: ${colorFondo}; color: white; padding: 5px 15px; border-radius: 20px; font-weight: bold;">${prod.stock} Unidades</span>
                </div>
                `;
            });
            contenedorAlertas.innerHTML = htmlAlertas;
        } else {
            textoAlerta.innerText = "Todo el inventario está funcionando perfect.";
            textoAlerta.style.color = "green";
            contenedorAlertas.innerHTML = ""; 
        }

    } catch (error) {
        console.error("Error cargando el dashboard:", error);
    }
}