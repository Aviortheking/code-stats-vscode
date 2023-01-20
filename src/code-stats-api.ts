import type fetch from 'node-fetch'
import { Pulse } from "./pulse"
import { getISOTimestamp, getLanguageName } from "./utils"

// Please do not look at this
let realFetch: typeof fetch
// @ts-expect-error VSCode is not including fetch everytime
if (typeof fetch === 'undefined') {
	realFetch = require('node-fetch')
} else {
	// @ts-expect-error VSCode is not including fetch everytime
	realFetch = fetch
}

export class CodeStatsAPI {
	private API_KEY = null;
	private USER_NAME = null;
	private UPDATE_URL = "https://codestats.net/api";
	private headers: Record<string, string> = {
		"Content-Type": "application/json"
	}

	constructor(apiKey: string, apiURL: string, userName: string) {
		this.updateSettings(apiKey, apiURL, userName);
	}

	public updateSettings(apiKey: string, apiURL: string, userName: string) {

		this.API_KEY = apiKey;
		this.UPDATE_URL = apiURL;
		this.USER_NAME = userName;

		if (
		this.API_KEY === null ||
		this.API_KEY === undefined ||
		this.API_KEY === ""
		) {
			return;
		}

		this.headers["X-API-Token"] = this.API_KEY
	}

	public async sendUpdate(pulse: Pulse): Promise<any> {
		// If we did not have API key, don't try to update
		if (this.API_KEY === null) {
			return null;
		}

		// tslint:disable-next-line:typedef
		const data = new ApiJSON(new Date());

		for (let lang of pulse.xps.keys()) {
			let languageName: string = getLanguageName(lang);
			let xp: number = pulse.getXP(lang);
			data.xps.push(new ApiXP(languageName, xp));
		}

		let json: string = JSON.stringify(data);
		console.log(`JSON: ${json}`);

		try {
			const response = await realFetch(`${this.UPDATE_URL}/my/pulses`, {
				method: 'POST',
				body: json,
				headers: this.headers
			})
			console.log(response)
			pulse.reset()
		} catch (error) {
			console.log(error)
		}
	}

	public async getProfile(): Promise<any> {
		try {
			const resp = await realFetch(`${this.UPDATE_URL}/users/${this.USER_NAME}`)
			const response = await resp.json()
			return response
		} catch (error) {
			console.log(error)
			return null
		}
	}
}

class ApiJSON {
	constructor(date: Date) {
		this.coded_at = getISOTimestamp(new Date());
		this.xps = new Array<ApiXP>();
	}

	coded_at: string;
	xps: Array<ApiXP>;
}

class ApiXP {
	constructor(language: string, xp: number) {
		this.language = language;
		this.xp = xp;
	}

	language: string;
	xp: number;
}
