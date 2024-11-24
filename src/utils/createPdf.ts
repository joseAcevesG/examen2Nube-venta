import { PDFDocument, rgb } from "pdf-lib";
import { SalesContent, SalesNote } from "../types";

export function generatePDF(
	salesNoteData: SalesNote,
	salesContentData: SalesContent,
) {
	return PDFDocument.create()
		.then((pdfDoc) => {
			const page = pdfDoc.addPage([600, 400]);
			const { height } = page.getSize();

			page.drawText(`Sales Note ID: ${salesNoteData.id}`, {
				x: 50,
				y: height - 50,
				size: 15,
				color: rgb(0, 0, 0),
			});
			page.drawText(`Client: ${salesNoteData.client}`, {
				x: 50,
				y: height - 80,
				size: 12,
			});
			page.drawText(`Total: ${salesNoteData.total}`, {
				x: 50,
				y: height - 110,
				size: 12,
			});
			page.drawText(`Product: ${salesContentData.product}`, {
				x: 50,
				y: height - 140,
				size: 12,
			});
			page.drawText(`Quantity: ${salesContentData.quantity}`, {
				x: 50,
				y: height - 170,
				size: 12,
			});
			page.drawText(`Unit Price: ${salesContentData.unitPrice}`, {
				x: 50,
				y: height - 200,
				size: 12,
			});
			page.drawText(`Amount: ${salesContentData.amount}`, {
				x: 50,
				y: height - 230,
				size: 12,
			});

			pdfDoc.setTitle(`Sales Note ${salesNoteData.id}`);
			pdfDoc.setSubject("Sales Note");
			pdfDoc.setProducer("Examen 1");
			pdfDoc.setCreator("Examen 1");
			pdfDoc.setCreationDate(new Date());
			pdfDoc.setAuthor(`Sales Note ID: ${salesNoteData.id}`);

			return pdfDoc.save();
		})
		.then((pdfBytes) => {
			return Buffer.from(pdfBytes);
		});
}
