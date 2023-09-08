export class Elements {
    static get prompt() {
        return this.inputById('promptInput');
    }

    static get systemMessage() {
        return this.inputById('systemMessage');
    }

    static get gptModel() {
        return this.inputById('modelSelect');
    }

    static get selectedChat() {
        return this.inputById('chatSelect');
    }

    static get chatName() {
        return this.inputById('chatName');
    }

    static get apiKey() {
        return this.inputById('apiKey');
    }

    static get contextWindow() {
        return this.inputById('contextWindow');
    }

    static get clearPersistanceBtn(){
        return this.byId("clearPersistance");
    }

    static get exportBtn(){
        return this.byId("export");
    }

    static get importBtn(){
        return this.byId("import");
    }

    static get deleteChatBtn(){
        return this.byId("deleteChat");
    }
    
    static get clearMessagesBtn(){
        return this.byId("clearMessages");
    }
    
    static get settingsToggleBtn(){
        return this.byId("settingsToggle");
    }

    static get saveSettingsBtn(){
        return this.byId("saveSettings");
    }

    static get settings(){
        return this.byId("settings");
    }

    static get sendMessageBtn(){
        return this.byId("fetchData");
    }

    static get chatTitle(){
        return this.byId("chatTitle");
    }

    static inputById(id: string) :HTMLInputElement {
        return (document.getElementById(id) as HTMLInputElement);
    }

    static byId(id: string): HTMLElement{
        const el = document.getElementById(id);
        if(!el) {throw `Element not found: ${id}`};

        return el;
    }
}
