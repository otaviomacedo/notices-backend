"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const core = __importStar(require("@actions/core"));
const auth_app_1 = require("@octokit/auth-app");
const rest_1 = require("@octokit/rest");
const fs_1 = require("fs");
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        const content = yield fs_1.promises.readFile('./data/notices.json', 'utf8');
        const notices = JSON.parse(content).notices;
        for (const notice of notices) {
            yield updateIssue(notice);
        }
    });
}
function updateIssue(notice) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const client = new rest_1.Octokit({
                authStrategy: auth_app_1.createAppAuth,
            });
            // const githubToken = core.getInput('github_token', { required: true });
            // const client = github.getOctokit(githubToken);
            const [owner, repo] = core.getInput('repo').split('/');
            const title = notice.title;
            const body = notice.overview;
            const issueNumber = notice.issueNumber;
            const labels = ['p0', 'management/tracking'];
            yield client.issues.update({
                owner,
                repo,
                issue_number: issueNumber,
                title,
                body,
                labels,
            });
        }
        catch (e) {
            core.error(e);
            core.setFailed(e.message);
        }
    });
}
run().catch(err => core.setFailed(err.message));
