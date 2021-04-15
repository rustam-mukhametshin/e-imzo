export interface CapiwsInterface{
    url: string;

    callFunction(funcDef, callback, error);

    version(callback, error);

    apiDoc(callback, error);

    apiKey(domainAndKey, callback, error);
}
