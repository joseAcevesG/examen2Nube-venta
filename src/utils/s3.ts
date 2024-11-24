// cspell: disable
import {
	CopyObjectCommand,
	GetObjectCommand,
	HeadObjectCommand,
	MetadataDirective,
	PutObjectCommand,
	S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3 = new S3Client({
	region: process.env.AWS_REGION,
	credentials: {
		accessKeyId: process.env.aws_access_key_id,
		secretAccessKey: process.env.aws_secret_access_key,
		sessionToken: process.env.aws_session_token,
	},
	endpoint: `https://s3.${process.env.AWS_REGION}.amazonaws.com`,
	forcePathStyle: false,
});

export function uploadToS3(
	fileBuffer: Buffer,
	fileName: string,
	salesNoteId: string,
) {
	const bucketName = process.env.S3_BUCKET_NAME;
	const uploadParams = {
		Bucket: bucketName,
		Key: `${fileName}`,
		Body: fileBuffer,
		ContentType: "application/pdf",
		Metadata: {
			salesNoteId: salesNoteId,
			downloads: "0",
		},
	};

	const command = new PutObjectCommand(uploadParams);
	return s3.send(command);
}

export const getFile = (fileName: string) => {
	const command = new GetObjectCommand({
		Bucket: process.env.S3_BUCKET_NAME,
		Key: fileName,
	});

	return getSignedUrl(s3, command, { expiresIn: 3600 })
		.then((url) => ({ success: true, url }))
		.catch((error) => {
			console.error("Error al obtener el archivo: ", error);
			return { success: false, error: error };
		});
};

export const incrementDownloadCount = (fileName: string, fileUrl: string) => {
	const bucketName = process.env.S3_BUCKET_NAME;

	return new Promise((resolve, reject) => {
		const headObjectCommand = new HeadObjectCommand({
			Bucket: bucketName,
			Key: fileName,
		});

		s3.send(headObjectCommand)
			.then((headData) => {
				let downloads = Number.parseInt(
					headData.Metadata?.downloads || "0",
					10,
				);
				downloads++;

				const copyParams = {
					Bucket: bucketName,
					CopySource: `${bucketName}/${fileName}`,
					Key: fileName,
					MetadataDirective: MetadataDirective.REPLACE,
					Metadata: {
						...headData.Metadata,
						downloads: downloads.toString(),
					},
				};

				const copyCommand = new CopyObjectCommand(copyParams);
				return s3.send(copyCommand);
			})
			.then(() => {
				resolve(fileUrl);
			})
			.catch((error) => {
				console.error("Error al incrementar el contador de descargas:", error);
				if (error.name === "NotFound") {
					reject(
						new Error(
							"El archivo especificado no fue encontrado en el bucket.",
						),
					);
				} else {
					reject(new Error("Error al incrementar el contador de descargas"));
				}
			});
	});
};
