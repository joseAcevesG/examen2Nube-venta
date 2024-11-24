export type Product = {
	id: string;
	name: string;
	measureUnit: string;
	basePrice: number;
};

export type SalesNote = {
	id: string;
	client: string;
	billingAddress: string;
	shippingAddress: string;
	total: number;
};

export type SalesContent = {
	id: string;
	product: string;
	quantity: number;
	unitPrice: number;
	amount: number;
	salesNote: string;
};
