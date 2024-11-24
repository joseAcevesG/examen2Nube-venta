// cspell: disable

import axios from "axios";
import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import product from "../models/product";
import salesContent from "../models/sales-content";
import salesNote from "../models/sales-note";
import { SalesContent, SalesNote } from "../types";
import { generatePDF } from "../utils/createPdf";
import { getFile, incrementDownloadCount, uploadToS3 } from "../utils/s3";

const ip = process.env.IP;

class SalesController {
	get(req: Request, res: Response) {
		const { id } = req.params;
		salesNote
			.get(id)
			.then((data) => {
				if (!data) {
					throw new Error("Venta no encontrada");
				}
				res.json({ data });
			})
			.catch((error) => {
				if (
					error.message === "Nota de venta no encontrada" ||
					error.message === "Contenido de la venta no encontrado"
				) {
					res.status(404).send(error.message);
					return;
				}

				console.error("Error al obtener la venta: ", error);
				res.status(500).send("Error al procesar la solicitud");
			});
	}

	create(req: Request, res: Response) {
		console.log("Creando venta");
		const salesNoteId = uuidv4();

		const SalesNoteData: SalesNote = {
			id: salesNoteId,
			client: req.body.clientId,
			billingAddress: req.body.billingAddressId,
			shippingAddress: req.body.shippingAddressId,
			total: req.body.total,
		};

		let SaleContentData: SalesContent;

		salesNote
			.create(SalesNoteData)
			.then(() => {
				console.log("Nota de venta creada correctamente");
				return product.get(req.body.productId);
			})
			.then((product) => {
				console.log("Producto encontrado");
				if (!product) {
					throw new Error("Producto no encontrado");
				}
				SaleContentData = {
					id: uuidv4(),
					product: req.body.productId,
					quantity: req.body.quantity,
					amount: req.body.amount,
					salesNote: salesNoteId,
					unitPrice: product.basePrice,
				};
				return salesContent.create(SaleContentData);
			})
			.then(() => {
				console.log("Contenido de la venta creado correctamente");
				return generatePDF(SalesNoteData, SaleContentData);
			})
			.then((pdfBuffer) => {
				console.log("PDF generado correctamente");
				return uploadToS3(
					pdfBuffer,
					`sales-note-${salesNoteId}.pdf`,
					salesNoteId,
				);
			})
			.then(() => {
				console.log("PDF subido correctamente");
				return axios.post(
					`http://localhost:${process.env.NOTIFICATION_PORT}/`,
					{
						message: `Puede descargar la factura de la venta ${salesNoteId} en https://${ip}/sales/${salesNoteId}/pdf`,
					},
				);
			})
			.then(() => {
				console.log("Notificación enviada correctamente");
				res.status(201).send(`Venta creada correctamente id: ${salesNoteId}`);
			})
			.catch((error) => {
				if (error.message === "Producto no encontrado") {
					res.status(404).send(error.message);
					return;
				}
				if (error.response) {
					res.status(error.response.status).send(error.response.data);
					return;
				}
				console.error("Error creando la venta: ", error);
				res.status(500).send("Error al procesar la solicitud");
			});
	}

	getPDF(req: Request, res: Response) {
		const { id } = req.params;
		console.log(`sales-note-${id}.pdf`);
		getFile(`sales-note-${id}.pdf`)
			.then((result) => {
				if (!result.success) {
					throw new Error("Archivo no encontrado");
				}
				if (!("url" in result)) {
					throw new Error("Error al obtener la URL del archivo");
				}
				return incrementDownloadCount(`sales-note-${id}.pdf`, result.url);
			})
			.then((url: string) => {
				console.log("Redireccionando a la URL del archivo");
				res.redirect(url);
			})
			.catch((error) => {
				if (error.message === "Archivo no encontrado") {
					res.status(404).send(error.message);
					return;
				}

				console.error("Error al obtener el archivo: ", error);
				res.status(500).send("Error al procesar la solicitud");
			});
	}
}

export default new SalesController();
