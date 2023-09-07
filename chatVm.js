var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Elements } from './elements.js';
import { ChatMessage } from './models.js';
export class ChatVm {
    constructor(model) {
        this.model = model;
        this.updateUiFromModel();
    }
    sendMessage(global) {
        var _a, _b, _c;
        return __awaiter(this, void 0, void 0, function* () {
            this.updateModelFromUi();
            let message = new ChatMessage('user', Elements.prompt.value);
            this.updateHistory(message);
            const tmpMsg = this.addMessageToUi(new ChatMessage("assistant", "..."));
            const response = yield fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${global.apiKey}`
                },
                body: JSON.stringify({
                    model: this.model.gptModel,
                    messages: [{ role: 'system', content: this.model.systemPrompt }, ...this.model.messages.slice(-global.contextWindow)]
                })
            });
            if (response.ok) {
                const data = yield response.json();
                const assistantMessage = (_b = (_a = data.choices[0]) === null || _a === void 0 ? void 0 : _a.message.content) !== null && _b !== void 0 ? _b : 'No output';
                (_c = tmpMsg === null || tmpMsg === void 0 ? void 0 : tmpMsg.parentElement) === null || _c === void 0 ? void 0 : _c.removeChild(tmpMsg);
                message = new ChatMessage('assistant', assistantMessage);
                this.updateHistory(message);
            }
            else {
                console.error('Failed to call GPT-4 API');
            }
        });
    }
    updateUiFromModel() {
        Elements.systemMessage.value = this.model.systemPrompt;
        Elements.gptModel.value = this.model.gptModel;
        Elements.chatName.value = this.model.name || 'New Chat';
        Elements.chatTitle.innerHTML = this.model.name;
        this.clearHistoryUi();
        this.model.messages.forEach(element => {
            this.addMessageToUi(element);
        });
    }
    updateModelFromUi() {
        this.model.systemPrompt = Elements.systemMessage.value;
        this.model.gptModel = Elements.gptModel.value;
        this.model.name = Elements.chatName.value;
    }
    addMessageToUi(message) {
        const historyList = document.getElementById('historyList');
        if (!historyList)
            return;
        const historyItem = document.createElement('div');
        const classes = ['p-3', 'my-2', 'border-round-lg', 'w-content'];
        if (message.role === 'user') {
            classes.push('bg-cyan-500');
            classes.push('ml-auto');
        }
        else {
            classes.push('surface-700');
        }
        // historyItem.setAttribute('style', 'max-width: 90%;');
        historyItem.classList.add(...classes);
        const content = document.createElement('div');
        content.innerText = `${message.content}`;
        historyItem.appendChild(content);
        if (historyList.firstChild) {
            historyList.insertBefore(historyItem, historyList.firstChild);
        }
        else {
            historyList.appendChild(historyItem);
        }
        return historyItem;
    }
    clearHistoryUi() {
        const historyList = document.getElementById('historyList');
        if (!historyList)
            return;
        while (historyList.firstChild) {
            historyList.removeChild(historyList.firstChild);
        }
    }
    clearMessages() {
        this.model.messages = [];
        this.updateUiFromModel();
    }
    updateHistory(message) {
        this.model.messages.push(message);
        this.addMessageToUi(message);
    }
}
