
import { CancellationToken, Event, ExtensionContext, TextDocumentContentProvider, Uri, workspace } from "vscode"
import { CodeStatsAPI } from "./code-stats-api"
import profileHtmlEex from './profile.html.eex'

import template = require('lodash.template');

export class ProfileProvider implements TextDocumentContentProvider {
	onDidChange?: Event<Uri>;

	api: CodeStatsAPI;
	context: ExtensionContext;

	constructor(context: ExtensionContext, api: CodeStatsAPI) {
		this.context = context;
		this.api = api;
	}

	provideTextDocumentContent(uri: Uri, token: CancellationToken): string | Thenable<string> {

		if (token.isCancellationRequested) return;

		const LEVEL_FACTOR = 0.025;

		function getLevel(xp: number): number {
			return Math.floor(Math.sqrt(xp) * LEVEL_FACTOR);
		}

		function getNextLevelXp(level: number): number {
			return Math.pow(Math.ceil((level + 1) / LEVEL_FACTOR), 2);
		}

		function getLevelProgress(xp: number, new_xp: number): number[] {
			let level = getLevel(xp);
			let curLevelXp = getNextLevelXp(level - 1);
			let nextLevelXp = getNextLevelXp(level);

			let haveXp = xp - curLevelXp;
			
			let needXp = nextLevelXp - curLevelXp;

			let xpP = Math.round(haveXp * 100.0 / needXp);
			let nxpP = Math.round(new_xp * 100.0 / needXp);
			return [ xpP, nxpP ];
		}

		function getSortedArray(obj: any): any[] {
			let items = [];

			for (const prop in obj) {
				let item = obj[prop];
				let percents = getLevelProgress(item.xps, item.new_xps);
				items.push(
				{
					name: prop,
					level: getLevel(item.xps),
					xp: item.xps,
					new_xp: item.new_xps,
					progress: percents[0],
					new_progress: percents[1]
				}
				);
			}
			
			return items.sort( (a,b) => {return b.xp - a.xp;});
		}

		return this.api.getProfile().then(async (profile) => {

			if( profile === null )
			{
				return `<h1>Can't fetch profile. Please try again later</h1> Make sure <strong>codestats.username</strong> setting is set to correct user name.`;
			}

			// don't look at this file please
			let htmlTemplate = profileHtmlEex
				
			profile["level"] = getLevel(profile["total_xp"]);

			let percents = getLevelProgress(profile["total_xp"], profile["new_xp"]);

			profile["progress"] = percents[0];
			profile["new_progress"] = percents[1];

			let languages = getSortedArray(profile["languages"]);
			let machines = getSortedArray(profile["machines"]);
			
			let html = template(htmlTemplate);

			return html({profile: profile, languages: languages, machines: machines});

		});
	}
}
