export class DB {
    constructor() {
        this.models = [];
        this.global = new GlobalModel();
    }
}
export class GlobalModel {
    constructor() {
        this.apiKey = '';
        this.contextWindow = 10;
    }
}
export class ChatModel {
    constructor() {
        this.messages = [];
        this.gptModel = "gpt-3.5-turbo";
        this.systemPrompt = "You are a helpful assistant";
        this.id = (new Date()).valueOf();
        this.name = "New chat";
    }
}
export class ChatMessage {
    constructor(role, content) {
        this.role = role;
        this.content = content;
    }
}
