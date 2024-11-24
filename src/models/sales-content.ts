// cspell: disable
import { ResultSetHeader, RowDataPacket } from "mysql2";
import { SalesContent as SalesContentType } from "../types";
import pool from "../utils/mySQL";

class SaleContent {
	create(saleContent: SalesContentType): Promise<SalesContentType> {
		const sql =
			"INSERT INTO sales_contents (id, product, quantity, unit_price, amount, sales_note) VALUES (?, ?, ?, ?, ?, ?)";

		return pool
			.query<ResultSetHeader>(sql, [
				saleContent.id,
				saleContent.product,
				saleContent.quantity,
				saleContent.unitPrice,
				saleContent.amount,
				saleContent.salesNote,
			])
			.then(([result]) => {
				return { ...saleContent };
			})
			.catch((error) => {
				console.error(`Error creando contenido de la venta: ${error.message}`);
				return Promise.reject(
					new Error(`Error creando contenido de la venta: ${error.message}`),
				);
			});
	}

	get(id: string): Promise<SalesContentType> {
		const sql =
			"SELECT id, product, quantity, unit_price AS unitPrice, amount, sales_note AS salesNote FROM sales_contents WHERE id = ?";

		return pool
			.query<RowDataPacket[]>(sql, [id])
			.then(([rows]) => {
				if (rows.length === 0) {
					return Promise.reject(
						new Error("Contenido de la venta no encontrado"),
					);
				}
				return rows[0] as SalesContentType;
			})
			.catch((error) => {
				if (error.message.includes("ER_BAD_FIELD_ERROR")) {
					return Promise.reject(
						new Error("Contenido de la venta no encontrado"),
					);
				}
				if (error.message === "Contenido de la venta no encontrado") {
					return Promise.reject(
						new Error("Contenido de la venta no encontrado"),
					);
				}
				return Promise.reject(
					new Error(`Error obteniendo contenido de la venta: ${error.message}`),
				);
			});
	}
}

export default new SaleContent();
