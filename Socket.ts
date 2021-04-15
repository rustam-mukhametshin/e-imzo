export class Socket {

    constructor(
        private url: string,
        private error
    ) {
    }

    init(): WebSocket {
        if (!window.WebSocket) {
            if (this.error) {
                this.error();
            }
            return;
        }

        let socket;
        try {
            socket = new WebSocket(this.url);
        } catch (e) {
            this.error(e);
        }

        socket.onerror = (e) => {
            if (this.error) {
                this.error(e);
            }
        }

        return socket;
    }
}
