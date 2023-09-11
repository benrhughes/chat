import { Elements } from "./elements.js";
import { GlobalModel } from "./models.js";

export class GlobalsVm {
    constructor(public model: GlobalModel){

    }

    updateUiFromModel(){
        Elements.apiKey.value = this.model.apiKey;
        Elements.contextWindow.value = this.model.contextWindow?.toString() || "10";
        Elements.temperature.value = this.model.temperature?.toString() || "0.8";
    }

    updateModelFromUi(){
        this.model.apiKey = Elements.apiKey.value;
        this.model.contextWindow = +Elements.contextWindow.value;
        this.model.temperature = +Elements.temperature.value;
    }
}