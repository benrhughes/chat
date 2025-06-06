import { marked } from 'marked';
import { Elements } from './elements';
import { ChatMessage, ChatModel, GlobalModel } from './models';

export class ChatVm{
    constructor(public model: ChatModel) {
        this.updateUiFromModel();
    }

    async sendMessage(global: GlobalModel){
        this.updateModelFromUi();

        let message = new ChatMessage('user', Elements.prompt.value);
        this.updateHistory(message);

        const tmpMsg = this.addMessageToUi(new ChatMessage("assistant", "..."));

        let messages: ChatMessage[]= [];
        
        if(this.model.systemPrompt){
            // only add the system prompt if a value for it has been set 
            messages.push(new ChatMessage("developer", this.model.systemPrompt));
        }
        messages = [...messages, ...this.model.messages.slice(-this.model.contextWindow)];
        
        const response = await fetch(GlobalModel.apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${global.apiKey}`
            },
            body: JSON.stringify({
                model: this.model.gptModel,
                temperature: this.model.temperature,
                messages: messages
            })
        });

        tmpMsg?.parentElement?.removeChild(tmpMsg);
        
        if (response.ok) {
            const data = await response.json();
            const assistantMessage = data.choices[0]?.message.content ?? 'No output';
            message = new ChatMessage('assistant', assistantMessage);
            this.updateHistory(message);
        } else {
            const text = `An error occurred calling the ChatGPT API.\n${response.status}: ${response.statusText}\n${response.body}`;
            console.error(text);
            alert(text);
        }
    }

    updateUiFromModel() {
        Elements.systemMessage.value = this.model.systemPrompt;
        Elements.gptModel.value = this.model.gptModel;
        Elements.chatName.value = this.model.name || 'New Chat';
        Elements.chatTitle.innerHTML = this.model.name;
        Elements.contextWindow.value = this.model.contextWindow?.toString() || "10";
        Elements.temperature.value = this.model.temperature?.toString() || "0.8";

        this.clearHistoryUi();
        this.model.messages.forEach(element => {
            this.addMessageToUi(element);
        });
    }

    updateModelFromUi() {
        this.model.systemPrompt = Elements.systemMessage.value;
        this.model.gptModel = Elements.gptModel.value; 
        this.model.name = Elements.chatName.value;
        this.model.contextWindow = +Elements.contextWindow.value;
        this.model.temperature = +Elements.temperature.value;
    }

    addMessageToUi(message: ChatMessage) {
        const historyList = document.getElementById('historyList');
        if(!historyList) return;

        const historyItem = document.createElement('div');

        const classes = ['p-3', 'my-2', 'border-round-lg', 'w-content'];
        
        if (message.role === 'user') {
            classes.push('bg-cyan-500');
            classes.push('ml-auto');
        } else {
            classes.push('surface-700');
        }

        historyItem.classList.add(...classes);

        const content = document.createElement('div'); 
        // content.innerText = `${message.content}`;

        const html = marked(message.content || '');
        content.innerHTML = html;

        historyItem.appendChild(content);

        if (historyList.firstChild) {
            historyList.insertBefore(historyItem, historyList.firstChild);
        } else {
            historyList.appendChild(historyItem);
        }

        return historyItem;
    }

    clearHistoryUi() {
        const historyList = document.getElementById('historyList');
        if(!historyList) return;
        
        while (historyList.firstChild) {
            historyList.removeChild(historyList.firstChild);
        }
    }

    clearMessages() {
        this.model.messages = [];
        this.updateUiFromModel();
    }

    updateHistory(message: ChatMessage) {
        this.model.messages.push(message);
        this.addMessageToUi(message);
    }
    
    async summarizeHistory(global: GlobalModel){
        const json = JSON.stringify(this.model.messages);
        const msg = new ChatMessage(
            'user', 
            `As concisely as possible, summarize this conversation between a user and chatgpt. It will be used as context for future chats.\r\n${json}`
        );
        
        const tmpMsg = this.addMessageToUi(new ChatMessage("assistant", "..."));

        const response = await fetch(GlobalModel.apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${global.apiKey}`
            },
            body: JSON.stringify({
                model: this.model.gptModel,
                temperature: this.model.temperature,
                messages: [msg]
            })
        });

        tmpMsg?.parentElement?.removeChild(tmpMsg);

        if (response.ok) {
            const data = await response.json();
            const assistantMessage = data.choices[0]?.message.content ?? 'No output';
            this.model.messages = [new ChatMessage('assistant', `Here is a summary of the conversation to date:\n ${assistantMessage}`)];
        } else {
            const text = `An error occurred calling the ChatGPT API.\n${response.status}: ${response.statusText}\n${response.body}`;
            console.error(text);
            alert(text);
        }
    }
}