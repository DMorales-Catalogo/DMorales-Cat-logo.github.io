const SPREADSHEET_ID = '1TeoYLaV7noS0VdzAKAt19vpUaJ7eL5G30Nc8r_EtHts';
const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/export?format=tsv`;
const WHATSAPP_NUMERO = '5355030077'; // Tu número real aquí

window.addEventListener('DOMContentLoaded', () => {
    cargarProductos();
});

async function cargarProductos() {
    try {
        const respuesta = await fetch(SHEET_URL);
        if (!respuesta.ok) throw new Error('No se pudo conectar con la base de datos');
        
        const textoTSV = await respuesta.text();
        const productos = parsearTSV(textoTSV);
        
        inyectarProductosEnLaWeb(productos);
    } catch (error) {
        console.error('Error al cargar catálogo:', error);
    }
}

function parsearTSV(texto) {
    const lineas = texto.split(/\r?\n/);
    const resultado = [];
    const cabeceras = lineas[0].split('\t').map(c => c.trim());
    
    for (let i = 1; i < lineas.length; i++) {
        const linea = lineas[i].trim();
        if (!linea) continue;
        
        const celdas = linea.split('\t');
        const producto = {};
        
        cabeceras.forEach((cabecera, indice) => {
            producto[cabecera] = celdas[indice] ? celdas[indice].trim() : '';
        });
        
        resultado.push(producto);
    }
    return resultado;
}

function inyectarProductosEnLaWeb(listaProductos) {
    document.getElementById('grid-masculina').innerHTML = '';
    document.getElementById('grid-femenina').innerHTML = '';
    document.getElementById('grid-moda').innerHTML = '';
    document.getElementById('grid-apple').innerHTML = '';

    listaProductos.forEach(producto => {
        if (!producto.nombre || !producto.categoria) return; 

        const card = document.createElement('div');
        card.classList.add('producto-card');
        
        // --- PROCESAMIENTO DE IMÁGENES MULTIPLES ---
        // Separamos por comas las imágenes que colocaste en la celda
        const listaImagenes = producto.imagen_url ? producto.imagen_url.split(',').map(img => img.trim()) : [];
        
        let htmlSlider = `<div class="imagen-slider-container">`;
        htmlSlider += `<div class="imagen-wrapper">`;
        
        if (listaImagenes.length > 0 && listaImagenes[0] !== '') {
            listaImagenes.forEach(urlFoto => {
                htmlSlider += `<img class="producto-imagen" src="${urlFoto}" alt="${producto.nombre}" loading="lazy" onerror="this.src='https://picsum.photos/300/400';">`;
            });
        } else {
            htmlSlider += `<img class="producto-imagen" src="https://picsum.photos/300/400" alt="${producto.nombre}">`;
        }
        
        htmlSlider += `</div>`;
        
        // Si hay más de una foto, añadimos una etiqueta flotante indicándolo (ej: 1 de 3)
        if (listaImagenes.length > 1) {
            htmlSlider += `<div class="slider-indicador">↔ Deslizar (1/${listaImagenes.length})</div>`;
        }
        htmlSlider += `</div>`;

        // --- PROCESAMIENTO DE TALLAS ---
        let htmlTallas = '';
        if (producto.tallas && producto.tallas.trim() !== '') {
            const arrayTallas = producto.tallas.split(',').map(t => t.trim());
            htmlTallas = `<div class="producto-tallas">Tallas: <div class="tallas-lista">`;
            arrayTallas.forEach(talla => {
                htmlTallas += `<span class="talla-item">${talla}</span>`;
            });
            htmlTallas += `</div></div>`;
        }

        // --- ENLACE WHATSAPP ---
        const mensajeWhatsApp = encodeURIComponent(`Hola D'Morales, estoy interesado en el producto: *${producto.nombre}* (${producto.precio} CUP). ¿Tienen disponibilidad?`);
        const enlaceWhatsApp = `https://wa.me/${WHATSAPP_NUMERO}?text=${mensajeWhatsApp}`;
        
        // Armamos la tarjeta completa
        card.innerHTML = `
            ${htmlSlider}
            <div class="producto-info">
                <h3 class="producto-nombre">${producto.nombre}</h3>
                <p class="producto-descripcion">${producto.descripcion}</p>
                ${htmlTallas}
                <p class="producto-precio">${producto.precio} CUP</p>
                <a href="${enlaceWhatsApp}" target="_blank" class="btn-whatsapp">Encargar por WhatsApp</a>
            </div>
        `;
        
        let contenedorGrid;
        if (producto.categoria === 'ropa-masculina') contenedorGrid = document.getElementById('grid-masculina');
        else if (producto.categoria === 'ropa-femenina') contenedorGrid = document.getElementById('grid-femenina');
        else if (producto.categoria === 'accesorios-moda') contenedorGrid = document.getElementById('grid-moda');
        else if (producto.categoria === 'accesorios-apple') contenedorGrid = document.getElementById('grid-apple');
        
        if (contenedorGrid) {
            contenedorGrid.appendChild(card);
        }
    });

    // Pequeño script para actualizar el indicador numérico del carrusel (ej: 2/3) dinámicamente al deslizar
    document.querySelectorAll('.imagen-wrapper').forEach(wrapper => {
        wrapper.addEventListener('scroll', () => {
            const anchoImagen = wrapper.clientWidth;
            const paginaActual = Math.round(wrapper.scrollLeft / anchoImagen) + 1;
            const indicador = wrapper.parentElement.querySelector('.slider-indicador');
            const totalImagenes = wrapper.children.length;
            if (indicador) {
                indicador.textContent = `↔ Deslizar (${paginaActual}/${totalImagenes})`;
            }
        });
    });
}

