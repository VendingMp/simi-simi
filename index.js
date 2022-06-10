import makeWASocket, { DisconnectReason } from '@adiwajshing/baileys'
import { Boom } from '@hapi/boom'
import makeWASocket, { BufferJSON, useSingleFileAuthState } from '@adiwajshing/baileys'
import * as fs from 'fs'

// utility function to help save the auth state in a single file
// it's utility ends at demos -- as re-writing a large file over and over again is very inefficient
const { state, saveState } = useSingleFileAuthState('./session.json')
// will use the given state to connect
// so if valid credentials are available -- it'll connect without QR
const conn = makeSocket({ auth: state }) 
// this will be called as soon as the credentials are updated
sock.ev.on ('creds.update', saveState)

async function connectToWhatsApp () {
    const sock = makeWASocket({
        // can provide additional config here
        printQRInTerminal: true
    })
    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update
        if(connection === 'close') {
            const shouldReconnect = (lastDisconnect.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut
            console.log('connection closed due to ', lastDisconnect.error, ', reconnecting ', shouldReconnect)
            // reconnect if not logged out
            if(shouldReconnect) {
                connectToWhatsApp()
            }
        } else if(connection === 'open') {
            console.log('opened connection')
        }
    })
    sock.ev.on('messages.upsert', m => {
        console.log(JSON.stringify(m, undefined, 2))

        console.log('replying to', m.messages[0].key.remoteJid)
        await sock.sendMessage(m.messages[0].key.remoteJid!, { text: 'Hello there!' })
    })
}
// run in main file
connectToWhatsApp()
