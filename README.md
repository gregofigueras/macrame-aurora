# 🌿 Macramé Aurora — Sistema de Gestión de Tienda & Talleres

Sistema web integral desarrollado a medida para **Macramé Aurora** ([@macrameaurora_](https://www.instagram.com/macrameaurora_/)), tienda de artesanías en macramé y dictado de talleres presenciales.

Diseñado con una estética artesanal, cálida y bohemia inspirada en la identidad de marca (tonos lino, crudo, terracota suave, verde salvia y tipografía editorial).

---

## ✨ Características Principales

### 1. 📅 Talleres con Calendario & Control de Señas
* **Calendario Mensual Interactivo**: Visualización de fechas con talleres programados, horarios y porcentaje de ocupación en tiempo real (`5/8 cupos ocupados`).
* **Parámetros del Taller**: Título/temática, fecha, hora de inicio, duración, cupo máximo de personas, arancel total por alumno y monto sugerido de seña.
* **Inscripción y Registro de Personas**:
  * Si la persona no está registrada, se ingresa su **Nombre y Apellido** y **Número de Teléfono** (y email opcional), guardándose automáticamente en la base de contactos.
  * Si ya existe, se autocompleta rápidamente desde el buscador.
* **Control de Seña**:
  * Indicación de si pagó la seña, cuánto abonó y medio de pago, o si **todavía no la pagó (Pendiente)**.
  * Cálculo automático del saldo restante a cobrar en el taller.
  * Botón de **1-Click** para *"Registrar Seña"* cuando el alumno envía el comprobante.
  * Botón de *"Cobrar Saldo Total"* al completar el pago.
* **Integración con WhatsApp**: Botón directo para cada inscripto que abre WhatsApp con un mensaje pre-armado y personalizado con los datos del taller, fecha, hora y estado de la seña.
* **Exportación de Inscriptos**: Descarga de la lista de asistentes a Excel (CSV).

---

### 2. 🧾 Control de Gastos & Materiales
* Registro categorizado de insumos:
  * **Armazones** (hierro, círculos, media luna).
  * **Hilos y Cordones** (algodón peinado, urdido, yute, lino).
  * **Espejos** (biselados, redondos).
  * **Herrajes y Accesorios** (argollas de madera, mosquetones).
  * **Packaging** (bolsas de lienzo estampadas).
  * **Insumos de Taller** (meriendas, café, guías impresas).
* Filtros por categoría, buscador por concepto o proveedor, y totalizador.

---

### 3. 💰 Registro de Ventas & Ganancias
* Registro de piezas vendidas:
  * **Canastas** (organizadoras, rústicas, nido).
  * **Espejos** (Sol bohemio, con flecos).
  * **Armazones decorados**, **Tapices de pared**, **Portamacetas**, encargos personalizados.
* Ingreso de precio de venta y costo estimado de materiales para calcular el **margen de ganancia neto real** por producto.
* Asociación opcional con cliente y medio de cobro.

---

### 4. 📊 Panel General (Dashboard)
* **Ingresos Totales**: Ventas de productos + Señas y aranceles de talleres.
* **Gastos Totales**: Insumos y materiales.
* **Ganancia Neta (Balance)**: Ingresos menos gastos, con indicador porcentual de margen.
* **Alertas de Señas Pendientes**: Muestra de forma destacada los alumnos con seña pendiente junto al botón rápido de WhatsApp para solicitar el comprobante.

---

### 5. 👥 Directorio de Alumnos & Clientes
* Agenda de contactos con teléfono, notas y su historial de compras y talleres a los que se inscribió.
* Botón directo de chat por WhatsApp.

---

### 6. 📁 Reportes, Excel & Respaldos
* **Exportación a Excel (CSV)** de Gastos, Ventas y Alumnos (con codificación UTF-8 compatible con Windows Excel).
* **Copia de seguridad en JSON**: Descarga y restauración de backup completo en 1 clic.
* Persistencia local automática en el navegador (`localStorage`).

---

## 🛠️ Tecnologías Utilizadas

* **React 19** + **TypeScript**
* **Vite 8**
* **Tailwind CSS v4** (con paleta de diseño artesanal bohemio)
* **Lucide Icons**
* **Google Fonts**: *Cormorant Garamond* & *Plus Jakarta Sans*

---

## 🚀 Instalación y Uso Local

1. Clonar el repositorio:
   ```bash
   git clone https://github.com/gregofigueras/macrame-aurora.git
   cd macrame-aurora
   ```

2. Instalar dependencias:
   ```bash
   npm install
   ```

3. Iniciar el servidor de desarrollo:
   ```bash
   npm run dev
   ```

4. Abrir en el navegador:
   ```
   http://localhost:5173
   ```

5. Para compilar para producción:
   ```bash
   npm run build
   ```

---

Hecho con dedicación para **Macramé Aurora** 🌿
