// cspell: disable
import { ResultSetHeader, RowDataPacket } from "mysql2";
import { SalesNote as SalesNoteType } from "../types";
import pool from "../utils/mySQL";

class SaleNote {
	create(saleNote: SalesNoteType): Promise<SalesNoteType> {
		console.log("Creando nota de venta");
		const sql =
			"INSERT INTO sales_notes (id, client, billing_address, shipping_address, total) VALUES (?, ?, ?, ?, ?)";

		return pool
			.query<ResultSetHeader>(sql, [
				saleNote.id,
				saleNote.client,
				saleNote.billingAddress,
				saleNote.shippingAddress,
				saleNote.total,
			])
			.then(([result]) => {
				console.log("Nota de venta creada");
				return { ...saleNote };
			})
			.catch((error) => {
				console.error(error);
				console.error(`Error creando la nota de venta: ${error.message}`);
				return Promise.reject(
					new Error(`Error creando la nota de venta: ${error.message}`),
				);
			});
	}

	get(id: string): Promise<SalesNoteType> {
		const sql =
			"SELECT id, client, billing_address AS billingAddress, shipping_address AS shippingAddress, total FROM sales_notes WHERE id = ?";

		return pool
			.query<RowDataPacket[]>(sql, [id])
			.then(([rows]) => {
				if (rows.length === 0) {
					return Promise.reject(new Error("Nota de venta no encontrada"));
				}
				return rows[0] as SalesNoteType;
			})
			.catch((error) => {
				if (error.message.includes("ER_BAD_FIELD_ERROR")) {
					return Promise.reject(new Error("Nota de venta no encontrada"));
				}
				if (error.message === "Nota de venta no encontrada") {
					return Promise.reject(new Error("Nota de venta no encontrada"));
				}
				return Promise.reject(
					new Error(`Error obteniendo la nota de venta: ${error.message}`),
				);
			});
	}
}

export default new SaleNote();
