/*
==============================================================
  ARROZ CON LECHE DELICIOSO — pedido.js
  Archivo: js/pedido.js

  Funciones:
  1. Controles de cantidad por producto (+/-)
  2. Cálculo del total en tiempo real
  3. Habilitación/deshabilitación del botón de envío
  4. Construcción del mensaje de WhatsApp con el resumen
  5. Modal de confirmación ("Estamos gestionando tu pedido")
==============================================================
*/


/* ============================================================
   CONFIGURACIÓN
   Cambia los números de WhatsApp si cambian
   ============================================================ */
const WHATSAPP_NUMBER = '573204371555'; // Número principal (sin +, con código de país)


/* ============================================================
   1. CONTROLES DE CANTIDAD (+/-)
   
   Usamos delegación de eventos: escuchamos clics en el
   contenedor padre en lugar de cada botón individual.
   Esto es más eficiente y funciona con elementos dinámicos.
   ============================================================ */

// Seleccionamos todos los items de producto
const prodItems = document.querySelectorAll('.prod-item');

prodItems.forEach(item => {
  const minusBtn = item.querySelector('.qty-minus');
  const plusBtn  = item.querySelector('.qty-plus');
  const qtyVal   = item.querySelector('.qty-val');

  // Botón RESTAR (−)
  minusBtn.addEventListener('click', () => {
    let current = parseInt(qtyVal.textContent);
    if (current > 0) {
      current--;
      qtyVal.textContent = current;
      animateQty(qtyVal); // Pequeña animación visual
      updateProductState(item, current);
      recalcTotal();
    }
  });

  // Botón SUMAR (+)
  plusBtn.addEventListener('click', () => {
    let current = parseInt(qtyVal.textContent);
    current++;
    qtyVal.textContent = current;
    animateQty(qtyVal);
    updateProductState(item, current);
    recalcTotal();
  });
});


/* ============================================================
   Actualiza el estado visual del item (seleccionado o no)
   ============================================================ */
function updateProductState(item, qty) {
  if (qty > 0) {
    item.classList.add('selected');
  } else {
    item.classList.remove('selected');
  }
}


/* ============================================================
   Animación pequeña al cambiar la cantidad
   ============================================================ */
function animateQty(el) {
  el.style.transform = 'scale(1.4)';
  el.style.color = 'var(--color-primary)';
  setTimeout(() => {
    el.style.transform = 'scale(1)';
    el.style.color = '';
  }, 180);
}


/* ============================================================
   2. CÁLCULO DEL TOTAL EN TIEMPO REAL
   
   Recorre todos los productos, multiplica cantidad × precio
   (el precio está guardado en el atributo data-price del HTML)
   ============================================================ */
const totalDisplay = document.getElementById('total-display');

function recalcTotal() {
  let total = 0;

  prodItems.forEach(item => {
    const price = parseInt(item.getAttribute('data-price')); // Lee el precio del atributo data-price
    const qty   = parseInt(item.querySelector('.qty-val').textContent);
    total += price * qty;
  });

  // Formatea el número con separador de miles colombiano
  totalDisplay.textContent = formatCOP(total);

  // Animación al cambiar el total
  totalDisplay.classList.remove('total-pop');
  void totalDisplay.offsetWidth; // Fuerza reflow para reiniciar la animación
  totalDisplay.classList.add('total-pop');

  // Habilitar o deshabilitar el botón de envío
  checkFormReady(total);

  return total; // Retorna el total para usarlo en otros lugares
}


/* ============================================================
   3. HABILITAR/DESHABILITAR BOTÓN DE ENVÍO
   
   El botón se habilita solo cuando:
   - Hay al menos 1 producto seleccionado (total > 0)
   - El nombre está lleno
   - El teléfono está lleno
   - La dirección está llena
   ============================================================ */
const btnPedido   = document.getElementById('btn-pedido');
const pedidoHint  = document.getElementById('pedido-hint');
const inputNombre = document.getElementById('f-nombre');
const inputTel    = document.getElementById('f-telefono');
const inputDir    = document.getElementById('f-direccion');

// También escuchamos cambios en los campos de texto
[inputNombre, inputTel, inputDir].forEach(input => {
  input.addEventListener('input', () => checkFormReady(getCurrentTotal()));
});

function getCurrentTotal() {
  let total = 0;
  prodItems.forEach(item => {
    total += parseInt(item.getAttribute('data-price'))
           * parseInt(item.querySelector('.qty-val').textContent);
  });
  return total;
}

function checkFormReady(total) {
  const hasProducts = total > 0;
  const hasName     = inputNombre.value.trim().length > 0;
  const hasPhone    = inputTel.value.trim().length > 0;
  const hasAddress  = inputDir.value.trim().length > 0;

  const isReady = hasProducts && hasName && hasPhone && hasAddress;

  btnPedido.disabled = !isReady;

  // Actualizar texto de ayuda según lo que falta
  if (!hasProducts) {
    pedidoHint.textContent = 'Selecciona al menos un producto para continuar.';
  } else if (!hasName || !hasPhone || !hasAddress) {
    pedidoHint.textContent = 'Completa tu nombre, WhatsApp y dirección para continuar.';
  } else {
    pedidoHint.textContent = '¡Todo listo! Haz clic para enviar tu pedido.';
    pedidoHint.style.color = 'var(--color-success)';
  }
}


/* ============================================================
   4. CONSTRUCCIÓN DEL MENSAJE DE WHATSAPP
   
   Cuando el usuario hace clic en "Enviar pedido",
   construimos un mensaje de texto con todos los detalles
   y abrimos WhatsApp con ese mensaje pre-cargado.
   ============================================================ */
btnPedido.addEventListener('click', () => {
  // Recopilar datos del formulario
  const nombre   = inputNombre.value.trim();
  const telefono = inputTel.value.trim();
  const direccion= inputDir.value.trim();
  const ciudad   = document.getElementById('f-ciudad').value;
  const nota     = document.getElementById('f-nota').value.trim();

  // Recopilar productos seleccionados
  const productosSeleccionados = [];
  let totalFinal = 0;

  prodItems.forEach(item => {
    const qty  = parseInt(item.querySelector('.qty-val').textContent);
    if (qty > 0) {
      const nombre_prod = item.getAttribute('data-name');
      const price       = parseInt(item.getAttribute('data-price'));
      const subtotal    = price * qty;
      totalFinal       += subtotal;
      productosSeleccionados.push({ nombre_prod, qty, price, subtotal });
    }
  });

  // Construir el texto del mensaje para WhatsApp
  // \n es salto de línea, %0A es su versión codificada para URL
  let mensaje = `NUEVO PEDIDO — Sweet Rice\n\n`;
  mensaje    += `-Cliente: ${nombre}\n`;
  mensaje    += `-WhatsApp: ${telefono}\n`;
  mensaje    += `-Dirección: ${direccion}, ${ciudad}\n\n`;
  mensaje    += `-Detalle del pedido:\n`;

  productosSeleccionados.forEach(p => {
    mensaje += `  • ${p.nombre_prod} × ${p.qty} = ${formatCOP(p.subtotal)}\n`;
  });

  mensaje += `\n TOTAL: ${formatCOP(totalFinal)}*\n`;

  if (nota) {
    mensaje += `\n Nota: ${nota}\n`;
  }

  mensaje += `\n Pedido enviado desde la web `;

  // Codificar el mensaje para URL (reemplaza caracteres especiales)
  const mensajeCodificado = encodeURIComponent(mensaje);

  // Construir el texto visible en el modal
  let detalleModal = `<strong> Tu pedido:</strong><br>`;
  productosSeleccionados.forEach(p => {
    detalleModal += `• ${p.nombre_prod} × ${p.qty} = ${formatCOP(p.subtotal)}<br>`;
  });
  detalleModal += `<br><strong> Total: ${formatCOP(totalFinal)}</strong><br>`;
  detalleModal += ` Entrega en: ${direccion}, ${ciudad}`;

  // Mostrar modal de confirmación PRIMERO
  showModal(detalleModal);

  // Después de 1.5 segundos, abrir WhatsApp
  // (le damos tiempo al usuario de ver el modal)
  setTimeout(() => {
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${mensajeCodificado}`, '_blank');
  }, 3000);
});


/* ============================================================
   5. MODAL DE CONFIRMACIÓN
   ============================================================ */
const modalOverlay = document.getElementById('modal-overlay');
const modalClose   = document.getElementById('modal-close');
const modalDetail  = document.getElementById('modal-detail');

// Muestra el modal con el detalle del pedido
function showModal(detalle) {
  modalDetail.innerHTML = detalle;
  modalOverlay.classList.add('visible');
  // Prevenir scroll del fondo mientras el modal está abierto
  document.body.style.overflow = 'hidden';
}

// Cierra el modal
function closeModal() {
  modalOverlay.classList.remove('visible');
  document.body.style.overflow = '';
}

// Botón "Entendido" dentro del modal
modalClose.addEventListener('click', closeModal);

// Cerrar al hacer clic en el overlay (fuera del modal)
modalOverlay.addEventListener('click', (e) => {
  if (e.target === modalOverlay) {
    closeModal();
  }
});

// Cerrar con la tecla Escape
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && modalOverlay.classList.contains('visible')) {
    closeModal();
  }
});


/* ============================================================
   UTILIDADES
   ============================================================ */

/**
 * Formatea un número como peso colombiano
 * Ej: 14000 → "$14.000"
 * @param {number} amount - Valor en pesos
 * @returns {string} Valor formateado
 */
function formatCOP(amount) {
  return '$' + amount.toLocaleString('es-CO');
}