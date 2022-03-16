import axios from "axios";

const BRAVO_API_URL = process.env.VUE_APP_BRAVO_API_URL;

const getAll = async (entityName) => {
    let data = await axios.get(BRAVO_API_URL + entityName);
    return data;
}

const addEntity = async (entityName, entityData) => {
    let data = await axios.post(BRAVO_API_URL + entityName, entityData);
    return data;
}

const updEntity = async (entityName, entityData) => {
    let data = await axios.put(BRAVO_API_URL + entityName, entityData);
    return data;
}

const delEntity = async (entityName, entityData) => {
    let postData = { data: entityData };
    let data = await axios.delete(BRAVO_API_URL + entityName, postData);
    return data;
}


export {
    getAll,
    addEntity,
    updEntity,
    delEntity
}