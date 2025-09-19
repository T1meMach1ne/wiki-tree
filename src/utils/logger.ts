import * as vscode from 'vscode';

const OUTPUT_CHANNEL = vscode.window.createOutputChannel('Wiki Tree');

export function logInfo(message: string): void {
  OUTPUT_CHANNEL.appendLine('INFO  ' + new Date().toISOString() + '  ' + message);
}

export function logError(message: string, error?: unknown): void {
  OUTPUT_CHANNEL.appendLine('ERROR ' + new Date().toISOString() + '  ' + message);
  if (error instanceof Error) {
    OUTPUT_CHANNEL.appendLine(error.stack ?? error.message);
  }
}

export function showInfoMessage(message: string): void {
  void vscode.window.showInformationMessage(message);
}

export function showErrorMessage(message: string): void {
  void vscode.window.showErrorMessage(message);
}
