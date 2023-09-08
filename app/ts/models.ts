export class DB {
    models: ChatModel[] = [];
    global: GlobalModel = new GlobalModel();
}

export class GlobalModel {
    apiKey: string = '';
    contextWindow: number = 10;
}

export class ChatModel {
    id: number;
    name: string ;
    messages: ChatMessage[] = [];
    gptModel: string = "gpt-3.5-turbo";
    systemPrompt: string = "You are a helpful assistant";
    lastSaved: Date | undefined;

    constructor(){
        this.id = (new Date()).valueOf()
        this.name = "New chat";
    }
}

export type Role ='assistant' | 'user'; 

export class ChatMessage {
    role: Role;
    content: string | undefined;
    
    constructor(role: Role, content: string){
        this.role = role;
        this.content = content;
    }
}