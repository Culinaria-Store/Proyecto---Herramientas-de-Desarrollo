// controllers/facturacionController.js
import db from '../config/db.js';

export const procesarFacturacion = async (req, res) => {
    const { items, tipoPago, numeroPago, sucursalId, tipoComprobante } = req.body;
    const userId = req.userId;
    let connection;

    if (!items || items.length === 0) {
        return res.status(400).json({ message: "El carrito está vacío" });
    }

    try {
        connection = await db.getConnection();
        await connection.beginTransaction();

        // 1. --- VALIDACIÓN DE PASARELA SIMULADA ---
        if (tipoPago === 'YAPE') {
            if (!numeroPago || numeroPago.length !== 9 || !numeroPago.startsWith('9')) {
                return res.status(400).json({ message: "Número de Yape inválido. Debe tener 9 dígitos y empezar con 9." });
            }
        } else if (tipoPago === 'TARJETA') {
            if (!numeroPago || numeroPago.length !== 16) {
                return res.status(400).json({ message: "Número de tarjeta inválido. Debe contener 16 dígitos." });
            }
        }

        // =========================================================================
        // 🛠️ HUECO PARA MIAPI.CLOUD: Cuando compres la API, aquí meterás el fetch externo:
        // const responseApi = await fetch('https://api.miapi.cloud/v1/payments', { ... });
        // =========================================================================

        // 2. Calcular montos económicos
        let totalCosto = 0;
        for (const item of items) {
            totalCosto += (parseFloat(item.precio) * parseInt(item.cantidad));
        }
        
        const igv = (totalCosto * 0.18);
        const subtotal = totalCosto - igv;

        // 3. Insertar la venta principal con la sucursal asignada
        const [numVenta] = await connection.query(`
            INSERT INTO ventas (id_usuario, total, tipo_pago, sucursal_id, tipo_comprobante, nro_operacion) 
            VALUES (?, ?, ?, ?, ?, ?)`,
            [userId, totalCosto, tipoPago, sucursalId, tipoComprobante, `OP-${Math.floor(100000 + Math.random() * 900000)}`]
        );
        const idVenta = numVenta.insertId;

        // 4. Procesar cada artículo: Validar/Restar Stock e Insertar Detalle
        for (const item of items) {
            // Verificar stock en la sucursal específica (Asumiendo tabla de stock por sucursal o global)
            const [prodCheck] = await connection.query(
                'SELECT stock FROM productos WHERE id_producto = ?', 
                [item.id_producto]
            );

            if (!prodCheck[0] || prodCheck[0].stock < item.cantidad) {
                throw new Error(`Stock insuficiente para el producto ID: ${item.id_producto}`);
            }

            // Restar stock del inventario
            await connection.query(
                'UPDATE productos SET stock = stock - ? WHERE id_producto = ?',
                [item.cantidad, item.id_producto]
            );

            // Registrar detalle de facturación
            await connection.query(`
                INSERT INTO detalle_facturacion (id_venta, id_producto, cantidad, precio_unitario) 
                VALUES (?, ?, ?, ?)`,
                [idVenta, item.id_producto, item.cantidad, item.precio]
            );
        }

        // 5. Limpiar el carrito del usuario tras la compra exitosa
        await connection.query('DELETE FROM carrito WHERE id_usuario = ?', [userId]);

        await connection.commit();
        res.json({ 
            status: "Success", 
            message: "¡Facturación y venta completada!",
            idVenta: idVenta
        });

    } catch (error) {
        if (connection) await connection.rollback();
        res.status(500).json({ message: error.message || "Error crítico en el proceso de facturación" });
    } finally {
        if (connection) connection.release();
    }
};