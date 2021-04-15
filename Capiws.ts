import { CapiwsInterface } from './interfaces/CapiwsInterface';
import { Socket } from './Socket';

export class Capiws implements CapiwsInterface {

    url: string;

    constructor() {
        this.setDomain();
    }

    private setDomain(): void {
        const domain = window.location.protocol.toLowerCase() === "https:" ?
            "wss://127.0.0.1:64443" : "ws://127.0.0.1:64646";

        this.url = domain + "/service/cryptapi";
    }

    callFunction(funcDef, callback, error) {

        const socket = this.getSocket(error);

        socket.onmessage = (event) => {
            const data = this.parseData(event.data);

            socket.close();

            callback(event, data);
        };

        socket.onopen = () => {
            const data = this.convertData(funcDef);

            console.log(data);

            socket.send(data);
        };
    }

    version(callback, error) {
        const socket = this.getSocket(error);

        socket.onmessage = (event) => {
            const data = this.parseData(event.data);

            socket.close();

            callback(event, data);
        };

        socket.onopen = () => {
            const data = this.convertData({name: 'version'});

            socket.send(data);
        };
    }

    apiDoc(callback, error) {

        const socket = this.getSocket(error);

        socket.onmessage = (event) => {
            const data = this.parseData(event.data);

            socket.close();

            callback(event, data);
        };

        socket.onopen = () => {
            const data = this.convertData({name: 'apidoc'});

            socket.send(data);
        };
    }

    apiKey(domainAndKey, callback, error) {

        const socket = this.getSocket(error);

        socket.onmessage = (event) => {
            const data = this.parseData(event.data);

            socket.close();

            callback(event, data);
        };

        socket.onopen = () => {
            const data = this.parseData(
                {
                    name: 'apikey',
                    arguments: domainAndKey
                }
            )
            socket.send(data);
        };
    }

    private getSocket = error => new Socket(this.url, error).init();

    private parseData = data => JSON.parse(data);

    private convertData = data => JSON.stringify(data);

}
