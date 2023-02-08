import AppModel from "./appModel";
class AppController{
    model: AppModel;
    constructor(){
        this.model = new AppModel();
    }
}

export default AppController;