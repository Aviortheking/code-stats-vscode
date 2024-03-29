import * as path from 'path'
import {
	commands, Disposable, ExtensionContext, StatusBarAlignment, StatusBarItem,
	TextDocument, TextDocumentChangeEvent, Uri,
	ViewColumn, window, workspace, WorkspaceConfiguration
} from "vscode"
import { CodeStatsAPI } from "./code-stats-api"
import { ProfileProvider } from "./profile-provider"
import { Pulse } from "./pulse"
export class XpCounter {
  private combinedDisposable: Disposable;
  private statusBarItem: StatusBarItem;
  private pulse: Pulse;
  private api: CodeStatsAPI;
  private updateTimeout: any;

  // wait 10s after each change in the document before sending an update
  private UPDATE_DELAY = 10000;

  // List of detected output languages to filter out and not send to the backend.
  private filterOutLanguages: string[] = [
    "arduino-output",
    "code-runner-output",
    "jest-snapshot",
    "Diff",
    "testOutput",
    "Log"
  ]

  constructor(context: ExtensionContext) {
    this.pulse = new Pulse();
    this.initAPI();

    let subscriptions: Disposable[] = [];

    if (!this.statusBarItem) {
      this.statusBarItem = window.createStatusBarItem(StatusBarAlignment.Left);
      this.statusBarItem.command = "code-stats.profile";
    }

    subscriptions.push(workspace.registerTextDocumentContentProvider('code-stats', new ProfileProvider(context, this.api)));

    subscriptions.push(commands.registerCommand("code-stats.profile", () => {

      let config: WorkspaceConfiguration = workspace.getConfiguration(
        "codestats"
      );

      if (!config) {
        window.showErrorMessage('codestats.username configuration setting is missing');
        return;
      }

      if( config.get("username") === '' ){
        window.showErrorMessage('codestats.username configuration setting is missing');
        return;
      }

      const panel = window.createWebviewPanel(
        'codeStatsPanel',
        'Code::Stats Profile',
        ViewColumn.Two,
        {
          localResourceRoots: [Uri.file(path.join(context.extensionPath, 'assets'))]
        }
      );

      workspace.openTextDocument(Uri.parse('code-stats://profile')).then((value) => {
        panel.webview.html = value.getText();
      });
    }));

    subscriptions.push(commands.registerCommand('code-stats.api-key', async () => {
      // Display an input box to allow to change the API key
      const response = await window.showInputBox({title: 'Enter your Code::Stats API key', placeHolder: 'xxxxxxxx.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'})

      // do nothing if nothing was entered
      if (!response) {
        return
      }

      // Fetch the configuration
      const config = workspace.getConfiguration(
        "codestats",
      );

      // Update the apiKey globally
      // TODO: maybe add some sort of validation
      config.update('apikey', response, true)

      // Reload the API
      this.initAPI()
      window.showInformationMessage('API Key successfully updated!')
    }))

    workspace.onDidChangeTextDocument(
      this.onTextDocumentChanged,
      this,
      subscriptions
    );
    workspace.onDidChangeConfiguration(this.initAPI, this, subscriptions);
    this.combinedDisposable = Disposable.from(...subscriptions);
  }

  dispose(): void {
    this.combinedDisposable.dispose();
    this.statusBarItem.dispose();
  }

  private onTextDocumentChanged(event: TextDocumentChangeEvent): void {
    this.updateXpCount(event.document, 1);
  }

  public updateXpCount(document: TextDocument, changeCount: number): void {
    let show: boolean;
    if (this.isSupportedLanguage(document.languageId)) {
      this.pulse.addXP(document.languageId, changeCount);
      show = true;
    } else {
      show = false;
    }
    this.updateStatusBar(show, `${this.pulse.getXP(document.languageId)}`);

    // each change resets the timeout so we only send updates when there is a 10s delay in updates to the document
    if (this.updateTimeout !== null) {
      clearTimeout(this.updateTimeout);
    }

    this.updateTimeout = setTimeout(() => {
      const promise = this.api.sendUpdate(this.pulse);

      if (promise !== null) {
        promise.then(() => {
          this.updateStatusBar(
            show,
            `${this.pulse.getXP(document.languageId)}`
          );
        });
      }
    }, this.UPDATE_DELAY);
  }

  private updateStatusBar(show: boolean, changeCount: string): void {
    if (!show) {
      this.statusBarItem.hide();
    } else {
      this.statusBarItem.text = `$(pencil) C::S ${changeCount}`;
      this.statusBarItem.show();
    }
  }

  private isSupportedLanguage(language: string): boolean {
    // Check if detected language is something we don't want to send to backend like the code runner output
    if (this.filterOutLanguages.includes(language)) {
      console.log("Filtering out " + language);
      return false;
    }
    return true;
  }

  private initAPI() {
    let config: WorkspaceConfiguration = workspace.getConfiguration(
      "codestats"
    );
    if (!config) {
      return;
    }

    const apiKey: string = config.get("apikey");
    const apiURL: string = config.get("apiurl");
    const userName: string = config.get("username");

    console.log(
      `code-stats-vscode setting up:
      API URL: ${apiURL}
      NAME:    ${userName}
      KEY:     ${apiKey}
      `
    );

    if(this.api != null )
      this.api.updateSettings(apiKey, apiURL, userName);
    else
      this.api = new CodeStatsAPI(apiKey,apiURL,userName);
  }
}
