import { Elements } from "./elements.js";
import { GlobalModel } from "./models.js";

export class GlobalsVm {
    constructor(public model: GlobalModel){
    }

    updateUiFromModel(){
        Elements.apiKey.value = this.model.apiKey;
    }

    updateModelFromUi(){
        this.model.apiKey = Elements.apiKey.value;
    }
}