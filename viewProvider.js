const vscode = require('vscode');
const { t } = require('./i18n');

class XWriterViewProvider {
    constructor() {
        this._onDidChangeTreeData = new vscode.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
    }

    refresh() {
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element) {
        return element;
    }

    async getChildren(element) {
        if (!element) {
            // Root level items
            return [
                new ActionTreeItem(
                    t('tree.postTweet'),
                    t('tree.postTweetTooltip'),
                    'xWriter.postTweet',
                    vscode.TreeItemCollapsibleState.None
                ),
                new ActionTreeItem(
                    t('tree.setup'),
                    t('tree.setupTooltip'),
                    'xWriter.setupCredentials',
                    vscode.TreeItemCollapsibleState.None
                ),
                new ActionTreeItem(
                    t('tree.reset'),
                    t('tree.resetTooltip'),
                    'xWriter.resetCredentials',
                    vscode.TreeItemCollapsibleState.None
                ),
                new ActionTreeItem(
                    t('tree.donate'),
                    t('tree.donateTooltip'),
                    'xWriter.donate',
                    vscode.TreeItemCollapsibleState.None
                ),
                new ActionTreeItem(
                    t('tree.help'),
                    t('tree.helpTooltip'),
                    'xWriter.help',
                    vscode.TreeItemCollapsibleState.None
                )
            ];
        }
        return [];
    }
}

class ActionTreeItem extends vscode.TreeItem {
    constructor(label, tooltip, commandId, collapsibleState) {
        super(label, collapsibleState);
        this.tooltip = tooltip;
        this.command = {
            command: commandId,
            title: label,
            arguments: []
        };
        this.contextValue = 'action';
    }
}

module.exports = {
    XWriterViewProvider
};
