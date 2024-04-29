const API_HOST = import.meta.env.VITE_API_HOST;

export async function Fetcher(
	url: string,
	init?: RequestInit,
	logout?: () => void,
	token?: string,
) {
	const headers = {
		"Content-Type": "application/json",
		...(token ? { Authorization: `Bearer ${token}` } : {}),
		...init?.headers,
	};

	const response = await fetch(API_HOST + url, {
		...init,
		headers,
	});

	const data = await response.json();

	// TODO: Adjust error format when we get the API documentation
	if (!response.ok) {
		if (data.error !== undefined) {
			throw new ApiError(data.error, data.code, response.status);
		}

		throw new ApiError(
			"Ocurrio un error inesperado",
			data.code,
			response.status,
		);
	}

	if (response.status === 401) {
		logout?.();
	}

	return data;
}

export class ApiError extends Error {
	constructor(
		public message: string,
		public code: string,
		public status: number,
	) {
		super(message);
		this.code = code;
		this.status = status;
	}
}
