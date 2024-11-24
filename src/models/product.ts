// cspell: disable
import { ResultSetHeader, RowDataPacket } from "mysql2";
import { Product as ProductType } from "../types";
import pool from "../utils/mySQL";

class Product {
	create(product: ProductType): Promise<ProductType> {
		const sql =
			"INSERT INTO products (id, name, measure_unit, base_price) VALUES (?, ?, ?, ?)";

		return pool
			.query<ResultSetHeader>(sql, [
				product.id,
				product.name,
				product.measureUnit,
				product.basePrice,
			])
			.then(([result]) => {
				return { ...product };
			})
			.catch((error) => {
				return Promise.reject(
					new Error(`Error creando producto: ${error.message}`),
				);
			});
	}

	update(product: ProductType): Promise<ProductType> {
		const sql =
			"UPDATE products SET name = ?, measure_unit = ?, base_price = ? WHERE id = ?";

		return pool
			.query<ResultSetHeader>(sql, [
				product.name,
				product.measureUnit,
				product.basePrice,
				product.id,
			])
			.then(([result]) => {
				if (result.affectedRows === 0) {
					return Promise.reject(new Error("Producto no encontrado"));
				}
				return product;
			})
			.catch((error) => {
				if (error.message.includes("ER_BAD_FIELD_ERROR")) {
					return Promise.reject(new Error("Producto no encontrado"));
				}
				if (error.message === "Producto no encontrado") {
					return Promise.reject(new Error("Producto no encontrado"));
				}
				return Promise.reject(
					new Error(`Error actualizando producto: ${error.message}`),
				);
			});
	}

	delete(id: string): Promise<void> {
		const sql = "DELETE FROM products WHERE id = ?";

		return pool
			.query(sql, [id])
			.then(() => {
				return;
			})
			.catch((error) => {
				return Promise.reject(
					new Error(`Error eliminando producto: ${error.message}`),
				);
			});
	}

	getAll(): Promise<ProductType[]> {
		const sql =
			"SELECT id, name, measure_unit AS measureUnit, base_price AS basePrice FROM products";

		return pool
			.query<RowDataPacket[]>(sql)
			.then(([rows]) => {
				return rows as ProductType[];
			})
			.catch((error) => {
				return Promise.reject(
					new Error(`Error obteniendo productos: ${error.message}`),
				);
			});
	}

	get(id: string): Promise<ProductType> {
		const sql =
			"SELECT id, name, measure_unit AS measureUnit, base_price AS basePrice FROM products WHERE id = ?";

		return pool
			.query<RowDataPacket[]>(sql, [id])
			.then(([rows]) => {
				if (rows.length === 0) {
					return Promise.reject(new Error("Producto no encontrado"));
				}
				return rows[0] as ProductType;
			})
			.catch((error) => {
				console.error(error);
				if (error.message.includes("ER_BAD_FIELD_ERROR")) {
					return Promise.reject(new Error("Producto no encontrado"));
				}
				if (error.message === "Producto no encontrado") {
					return Promise.reject(new Error("Producto no encontrado"));
				}
				return Promise.reject(
					new Error(`Error obteniendo producto: ${error.message}`),
				);
			});
	}
}

export default new Product();
