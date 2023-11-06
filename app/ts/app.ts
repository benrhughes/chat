import { ChatVm } from "./chatVm.js";
import { Elements } from "./elements.js";
import { GlobalsVm } from "./globalsVm.js";
import { ChatModel, DB, DB as Database } from "./models.js";

export class App {
    localStorageKey = "chat-db";
    db: Database = new Database();
    currentChat: ChatVm | undefined;
    globals: GlobalsVm | undefined;

    constructor() {
        this.load();
    }

    load() {
        this.loadDb();

        this.globals = new GlobalsVm(this.db.global);
        this.globals.updateUiFromModel();

        for (const chat of this.db.models) {
            this.addChatOptionToUi(chat);
        }

        let chat;
        if (this.db.models.length > 0) {
            chat = this.db.models[0];
        } else {
            chat = new ChatModel();
            this.db.models.push(chat);
        }

        this.currentChat = new ChatVm(chat);

        Elements.selectedChat.value = chat.id.toString();

        this.bindUiEventHandlers();
    }

    loadDb() {
        const raw = localStorage.getItem(this.localStorageKey);
        if (!raw) return;

        this.db = JSON.parse(raw);
    }

    saveDb(): void {
        if (this.currentChat) {
            this.currentChat.updateModelFromUi();
            this.currentChat.model.lastSaved = new Date();
        }

        //reverse-chron sort on last saved
        this.db.models.sort((a, b) => new Date(b.lastSaved!).valueOf() - new Date(a.lastSaved!).valueOf())
        localStorage.setItem(this.localStorageKey, JSON.stringify(this.db));
    }

    addChatOptionToUi(model: ChatModel) {
        const option = document.createElement("option");
        option.value = model.id.toString();
        option.text = model.name;
        Elements.selectedChat.appendChild(option);
    }

    clearDb() {
        const proceed = confirm("This will delete all of your current data. Do you wish to proceed?");
        if (!proceed) return;
        this.db = new DB();
        this.saveDb();
        this.load();
    }

    chatSelected(e: Event) {
        const selectedValue = (e.target as HTMLSelectElement).value;
        if (!selectedValue) return;

        if (selectedValue.toLocaleLowerCase() === "new") {
            this.currentChat = new ChatVm(new ChatModel());
            this.db.models.push(this.currentChat.model);
            this.addChatOptionToUi(this.currentChat.model);
        } else {
            const found = this.db.models.find(x => x.id === +selectedValue);
            if (!found) {
                alert(`Model with id ${selectedValue} couldn't be loaded`);
                return;
            }

            this.currentChat = new ChatVm(found);
        }
    }

    export() {
        const blob = new Blob([localStorage.getItem(this.localStorageKey) || ''], { type: 'text/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `chat export ${new Date().toISOString()}.json`;
        a.click();
    }

    import() {
        const app = this;
        const input = document.createElement('input');
        input.type = 'file';
        input.onchange = (event: Event) => {
            const proceed = confirm("This will override all of your current data. Do you wish to proceed?");
            if (!proceed) return;
            let target = event.target as HTMLInputElement;
            let file: File | null = target.files ? target.files[0] : null;

            if (file) {
                let reader = new FileReader();
                reader.onload = function (e: ProgressEvent<FileReader>) {
                    const text = e.target?.result as string || '';
                    localStorage.setItem(app.localStorageKey, text);
                    app.load();
                };
                reader.readAsText(file);
            }
        };

        input.click();
    }

    toggleSettings(e: MouseEvent) {
        const settings = Elements.settings;
        if (settings?.classList.contains("hidden")) {
            settings?.classList.remove("hidden");
            settings?.classList.add("flex");
        } else {
            settings?.classList.add("hidden");
            settings?.classList.remove("flex");
        }

        e.preventDefault();
        e.stopPropagation();
        return false;
    }

    deleteChat() {
        if(!confirm("Delete the current chat?")) { return; }
        this.db.models = this.db.models.filter(x => x.id !== this.currentChat?.model.id);
        this.currentChat = new ChatVm(this.db.models[0]);
        this.saveDb();
    }

    promptEnter(event: KeyboardEvent) {
        if (event.shiftKey) return;

        if (event.key === "Enter") {
            event.preventDefault();
            this.sendMessage();
            Elements.prompt.value = "";
        }
    }

    async sendMessage() {
        if (!this.globals?.model.apiKey) {
            alert('You need to enter an API Key');
            return;
        }

        await this.currentChat?.sendMessage(this.globals.model);
        this.saveDb();
    }

    saveSettings() {
        this.globals?.updateModelFromUi();
        this.saveDb();
        alert("Settings saved");
    }
    
    // clone and replace the element to remove any event handlers
    unbind(element: HTMLElement){
        var clone = element.cloneNode(true);
        element.parentNode?.replaceChild(clone, element);
    }
    
    bindUiEventHandlers() {
        this.unbind(Elements.saveSettingsBtn);
        Elements.saveSettingsBtn.addEventListener("click", async () => {
            this.saveSettings();
        });

        this.unbind(Elements.exportBtn);
        Elements.exportBtn.addEventListener("click", async () => {
            this.export();
        });

        this.unbind(Elements.importBtn);
        Elements.importBtn.addEventListener("click", async () => {
            this.import();
        });

        this.unbind(Elements.clearPersistanceBtn);
        Elements.clearPersistanceBtn.addEventListener("click", async () => {
            this.clearDb();
        });

        this.unbind(Elements.deleteChatBtn);
        Elements.deleteChatBtn.addEventListener("click", e => {
            this.deleteChat();
        });

        this.unbind(Elements.clearMessagesBtn);
        Elements.clearMessagesBtn.addEventListener("click", async e => {
            if(!confirm("Delete all messages for this chat?")){ return; }
            this.currentChat?.clearMessages();
        });

        this.unbind(Elements.summarizeMessagesBtn);
        Elements.summarizeMessagesBtn.addEventListener("click", async e => {
            if(!confirm('This will replace all of your chat history with a summary of the conversation. Are you sure?')){
                return;
            }
            
            if (!this.globals?.model.apiKey) {
                alert('You need to enter an API Key');
                return;
            }
            
            await this.currentChat?.summarizeHistory(this.globals.model);
            this.saveDb();
            this.load();
        });
        
        this.unbind(Elements.selectedChat);
        Elements.selectedChat.addEventListener("change", async (e) => {
            this.chatSelected(e);
        });

        this.unbind(Elements.settingsToggleBtn);
        Elements.settingsToggleBtn.addEventListener("click", async e => {
            return this.toggleSettings(e);
        });

        this.unbind(Elements.prompt);
        Elements.prompt.addEventListener("keydown", async (event) => {
            this.promptEnter(event);
        });
    }
}