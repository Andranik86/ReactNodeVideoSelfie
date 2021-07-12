const path = require('path')
const fs = require('fs')
const http = require('http')

const {
    Server: socketIo
} = require('socket.io')

const { v4: uuidv4 } = require('uuid')
const mime = require('mime')

const MEDIA_DIR = path.join(__dirname, './media')
try {
    fs.mkdirSync(MEDIA_DIR)
} catch { }

const io = new socketIo({
    cors: ['*'],
})

io.on('connection', socket => {
    console.log(`connected ${socket.id}`)

    socket.on('disconnected', reason => {
        console.log(`disconnected ${socket.id} due to ${reason}`)
    })

    socket.on('get_record_id', (cb) => {
        console.log('get_record_id')
        const recordId = uuidv4()
        let writeStream = null

        const handleData = ({ mediaType, data }) => {
            if (!writeStream) {
                const extname = mime.getExtension(mediaType)
                console.log(mediaType)
                const mediaPath = path.join(MEDIA_DIR, `${recordId}.${extname}`)
                writeStream = fs.createWriteStream(mediaPath)
            }
            console.log(data)
            writeStream.write(Buffer.from(data))
        }
        const handleFinishRecord = () => {
            socket.off(`record_data_finish_${recordId}`, handleFinishRecord)
            socket.off(`record_data_${recordId}`, handleData)
            writeStream.end()
        }

        try {
            socket.on(`record_data_${recordId}`, handleData)
        } catch {
            return cb(null)
        }
        try {
            socket.on(`record_data_finish_${recordId}`, handleFinishRecord)
        } catch {
            socket.off(`record_data_${recordId}`, handleData)
            return cb(null)
        }
        console.log('rec')
        cb(recordId)
    })



    socket.on('msg', console.log)
})



module.exports = io