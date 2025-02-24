import * as vscode from 'vscode';
import simpleGit , { SimpleGit } from 'simple-git';
import * as fs from 'fs';
import * as path from 'path';
import { debug } from 'console';

// Enable debug logs
const debugEnabled = vscode.workspace.getConfiguration('git-tracker').get<boolean>('enableDebug');

function debugLog(message: string) {
    if (debugEnabled) {
        console.log(`[Git Tracker]: ${message}`);
    }
}

// Track commits in your provided workspace
async function trackCommits(worklogRepoPath: string, worklogGit: SimpleGit, worklogRemoteRepo: string) {
    try {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders) {
            vscode.window.showErrorMessage("No workspace folder found.");
            return;
        }

        const workspacePath = workspaceFolders[0].uri.fsPath;
        debugLog(`Tracking commits for workspace: ${workspacePath}`);

        const git = simpleGit(workspacePath);

        // Fetch commit history
        const log = await git.log({ maxCount: 20 }); // Fetch last 20 commits

        debugLog(`Fetched ${log.all.length} commits`);

        const commits = log.all.map(commit => ({
            hash: commit.hash,
            message: commit.message,
            author: commit.author_name,
            date: commit.date,
            repository: workspacePath
        }));

        if (commits.length > 0) {
            debugLog(`Saving ${commits.length} new commits.`);
            await saveAndPushWorklog(commits, worklogRepoPath, worklogGit, worklogRemoteRepo);
        } else {
            debugLog("No new commits found.");
            vscode.window.showInformationMessage("No new commits to track.");
        }

    } catch (error) {
        vscode.window.showErrorMessage(`Error tracking commits: ${error}`);
        debugLog(`Error tracking commits: ${error}`);
    }
}

// Save the merged logs to code-worklog and push it
async function saveAndPushWorklog(newCommits: any[], worklogRepoPath: string, worklogGit: SimpleGit, worklogRemoteRepo: string) {
    try {
        // Clone repo if missing
        if (!fs.existsSync(worklogRepoPath)) {
            await worklogGit.clone(worklogRemoteRepo, worklogRepoPath);
        }

        const worklogFilePath = path.join(worklogRepoPath, '.git_worklog.json');
        let existingCommits: any[] = [];

        if (fs.existsSync(worklogFilePath)) {
            try {
                const fileData = fs.readFileSync(worklogFilePath, 'utf-8');
                existingCommits = JSON.parse(fileData);
            } catch (error) {
                vscode.window.showWarningMessage('Could not read existing worklog file, starting fresh.');
            }
        }

        // Append only unique commits
        const updatedCommits = [...existingCommits];

        newCommits.forEach(commit => {
            if (!existingCommits.some(existing => existing.hash === commit.hash)) {
                updatedCommits.push(commit);
            }
        });

        fs.writeFileSync(worklogFilePath, JSON.stringify(updatedCommits, null, 2));

        // Commit and push
        await worklogGit.add(worklogFilePath);
        debugLog(`Committed ${worklogFilePath}`);
        await worklogGit.commit(`Updated worklog with latest commits`);
        debugLog(`Pushing worklog to remote: ${worklogRemoteRepo}`);
        await worklogGit.push('origin', 'main');
        vscode.window.showInformationMessage('Worklog updated and pushed successfully.');
    } catch (error) {
        vscode.window.showErrorMessage(`Failed to push worklog: ${error}`);
    }
}
export function activate(context: vscode.ExtensionContext) {
    const config = vscode.workspace.getConfiguration("gitWorklog");

    // Read user-configured values
    const worklogRepoPath = config.get<string>("repoPath")!.replace("${home}", process.env.HOME || process.env.USERPROFILE || "");
    const worklogRemoteRepo = config.get<string>("remoteRepo")!;

    // Initialize Git with the custom path
    const worklogGit = simpleGit(worklogRepoPath);

    let disposable = vscode.commands.registerCommand('gitWorklog.sync', async () => {
        await trackCommits(worklogRepoPath, worklogGit, worklogRemoteRepo);
    });

    context.subscriptions.push(disposable);
}

export function deactivate() {}