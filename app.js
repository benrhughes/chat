var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { ChatVm } from "./chatVm.js";
import { Elements } from "./elements.js";
import { ChatModel, DB, DB as Database } from "./models.js";
export class App {
    constructor() {
        this.localStorageKey = "chat-db";
        this.db = new Database();
        this.load();
    }
    load() {
        var _a;
        this.loadDb();
        Elements.apiKey.value = this.db.global.apiKey;
        Elements.contextWindow.value = ((_a = this.db.global.contextWindow) === null || _a === void 0 ? void 0 : _a.toString()) || "10";
        for (const chat of this.db.models) {
            this.addChatOptionToUi(chat);
        }
        let chat;
        if (this.db.models.length > 0) {
            chat = this.db.models[0];
        }
        else {
            chat = new ChatModel();
            this.db.models.push(chat);
        }
        this.currentChat = new ChatVm(chat);
        this.bindUi();
    }
    loadDb() {
        const raw = localStorage.getItem(this.localStorageKey);
        if (!raw)
            return;
        this.db = JSON.parse(raw);
    }
    saveDb() {
        if (this.currentChat) {
            this.currentChat.model.lastSaved = new Date();
        }
        //reverse-chron sort on last saved
        this.db.models.sort((a, b) => new Date(b.lastSaved).valueOf() - new Date(a.lastSaved).valueOf());
        localStorage.setItem(this.localStorageKey, JSON.stringify(this.db));
    }
    addChatOptionToUi(model) {
        const option = document.createElement("option");
        option.value = model.id.toString();
        option.text = model.name;
        Elements.selectedChat.appendChild(option);
    }
    clearDb() {
        const proceed = confirm("This will delete all of your current data. Do you wish to proceed?");
        if (!proceed)
            return;
        this.db = new DB();
        this.saveDb();
        this.load();
    }
    chatSelected(e) {
        const selectedValue = e.target.value;
        if (!selectedValue)
            return;
        if (selectedValue.toLocaleLowerCase() === "new") {
            this.currentChat = new ChatVm(new ChatModel());
            this.db.models.push(this.currentChat.model);
            this.addChatOptionToUi(this.currentChat.model);
        }
        else {
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
        input.onchange = (event) => {
            const proceed = confirm("This will override all of your current data. Do you wish to proceed?");
            if (!proceed)
                return;
            let target = event.target;
            let file = target.files ? target.files[0] : null;
            if (file) {
                let reader = new FileReader();
                reader.onload = function (e) {
                    var _a;
                    const text = ((_a = e.target) === null || _a === void 0 ? void 0 : _a.result) || '';
                    localStorage.setItem(app.localStorageKey, text);
                    app.load();
                };
                reader.readAsText(file);
            }
        };
        input.click();
    }
    toggleSettings(e) {
        const settings = Elements.settings;
        if (settings === null || settings === void 0 ? void 0 : settings.classList.contains("hidden")) {
            settings === null || settings === void 0 ? void 0 : settings.classList.remove("hidden");
            settings === null || settings === void 0 ? void 0 : settings.classList.add("flex");
        }
        else {
            settings === null || settings === void 0 ? void 0 : settings.classList.add("hidden");
            settings === null || settings === void 0 ? void 0 : settings.classList.remove("flex");
        }
        e.preventDefault();
        e.stopPropagation();
        return false;
    }
    deleteChat() {
        this.db.models = this.db.models.filter(x => { var _a; return x.id !== ((_a = this.currentChat) === null || _a === void 0 ? void 0 : _a.model.id); });
        this.currentChat = new ChatVm(this.db.models[0]);
        this.saveDb();
    }
    promptEnter(event) {
        if (event.shiftKey)
            return;
        if (event.key === "Enter") {
            event.preventDefault();
            this.sendMessage();
            Elements.prompt.value = "";
        }
    }
    sendMessage() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.db.global.apiKey) {
                alert('You need to enter an API Key');
                return;
            }
            yield ((_a = this.currentChat) === null || _a === void 0 ? void 0 : _a.sendMessage(this.db.global));
            this.saveDb();
        });
    }
    saveSettings() {
        this.db.global.apiKey = Elements.apiKey.value;
        this.db.global.contextWindow = +Elements.contextWindow.value;
        this.saveDb();
        alert("Settings saved");
    }
    bindUi() {
        Elements.saveSettingsBtn.addEventListener("click", () => __awaiter(this, void 0, void 0, function* () {
            this.saveSettings();
        }));
        Elements.exportBtn.addEventListener("click", () => __awaiter(this, void 0, void 0, function* () {
            this.export();
        }));
        Elements.importBtn.addEventListener("click", () => __awaiter(this, void 0, void 0, function* () {
            this.import();
        }));
        Elements.clearPersistanceBtn.addEventListener("click", () => __awaiter(this, void 0, void 0, function* () {
            this.clearDb();
        }));
        Elements.deleteChatBtn.addEventListener("click", () => {
            this.deleteChat();
        });
        Elements.clearMessagesBtn.addEventListener("click", () => __awaiter(this, void 0, void 0, function* () {
            var _a;
            (_a = this.currentChat) === null || _a === void 0 ? void 0 : _a.clearMessages();
        }));
        Elements.selectedChat.addEventListener("change", (e) => __awaiter(this, void 0, void 0, function* () {
            this.chatSelected(e);
        }));
        Elements.settingsToggleBtn.addEventListener("click", (e) => __awaiter(this, void 0, void 0, function* () {
            return this.toggleSettings(e);
        }));
        Elements.prompt.addEventListener("keydown", (event) => __awaiter(this, void 0, void 0, function* () {
            this.promptEnter(event);
        }));
    }
}
