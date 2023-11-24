import { Elements } from "./elements";
import { GlobalModel } from "./models";

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