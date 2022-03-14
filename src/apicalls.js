import axios from "axios";

const BRAVO_API_URL = process.env.VUE_APP_BRAVO_API_URL;

const getStates = async () => {
    let data = await axios.get(BRAVO_API_URL + 'State');
    return data;
}

const addState = async (name, codState) => {
    let postData = { codState, name };
    console.log(postData);
    let data = await axios.post(BRAVO_API_URL + 'State', postData);
    return data;
}

const updState = async (id, name, codState) => {
    let postData = { id, codState, name };
    let data = await axios.put(BRAVO_API_URL + 'State', postData);
    return data;
}

const delState = async (id) => {
    let postData = { data: { id } };
    console.log(postData);
    let data = await axios.delete(BRAVO_API_URL + 'State', postData);
    return data;
}

export {
    getStates,
    addState,
    updState,
    delState,
}