export class DB {
    chats: ChatModel[] = [];
    global: GlobalModel = new GlobalModel();
}

export class GlobalModel {
    apiKey: string = '';
    public static apiUrl = 'https://api.openai.com/v1/chat/completions';
}

export class ChatModel {
    id: number;
    name: string ;
    messages: ChatMessage[] = [];
    gptModel: string = "gpt-4.1";
    systemPrompt: string = "You are a helpful assistant";
    lastSaved: Date | undefined;
    contextWindow: number = 10;
    temperature: number = 0.8;

    constructor(){
        this.id = (new Date()).valueOf()
        this.name = "New chat";
    }
}

export type Role ='assistant' | 'user' | 'system' | 'developer'; 

export class ChatMessage {
    role: Role;
    content: string | undefined;
    
    constructor(role: Role, content: string){
        this.role = role;
        this.content = content;
    }
}