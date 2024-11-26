const { Client, LocalAuth } = require('whatsapp-web.js');
const { MongoClient } = require('mongodb');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const path = require('path');

// Removed loading of target groups
// const targetGroups = JSON.parse(fs.readFileSync('./groups.json', 'utf8'));

// MongoDB Connection URI
const uri = 'mongodb+srv://umernew:Haider1122@node1.tkgjljq.mongodb.net/?retryWrites=true&w=majority&appName=node1/lab11'; // Replace with your MongoDB connection string
const clientMongo = new MongoClient(uri);

// Database and collection names
const dbName = "whatsappBot";
const collectionName = "messages";

// Initialize WhatsApp client
const client = new Client({
    authStrategy: new LocalAuth({ clientId: "whatsapp-group-bot" })
});

// Generate and display QR code for authentication
client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
    console.log('Scan the QR code above with your WhatsApp mobile app.');
});

// Log successful authentication
client.on('ready', async () => {
    console.log('WhatsApp client is ready!');

    // Connect to MongoDB
    try {
        await clientMongo.connect();
        console.log('Connected to MongoDB!');
    } catch (err) {
        console.error('Error connecting to MongoDB:', err);
        process.exit(1);
    }
});

// Listen for messages
client.on('message', async (msg) => {
    const chat = await msg.getChat();

    // Process all messages
    console.log(`Message from ${chat.name || chat.id.user}: ${msg.body}`);

    const messageData = {
        id: msg.id._serialized,
        body: msg.body,
        fromMe: msg.fromMe,
        author: msg.author || msg.from,
        timestamp: msg.timestamp,
        type: msg.type,
        hasMedia: msg.hasMedia,
        mediaPath: null,
        chatName: chat.name || null,
        isGroup: chat.isGroup
    };

    // Handle media files
    if (msg.hasMedia) {
        try {
            const media = await msg.downloadMedia();
            const extension = media.mimetype.split('/')[1];
            const mediaPath = `./media/${msg.id.id}.${extension}`;
            fs.writeFileSync(mediaPath, media.data, 'base64');
            messageData.mediaPath = mediaPath;
        } catch (error) {
            console.error('Error handling media:', error);
        }
    }

    // Save message to MongoDB
    try {
        const db = clientMongo.db(dbName);
        const collection = db.collection(collectionName);
        await collection.insertOne(messageData);
        console.log('Message stored in MongoDB:', messageData);
    } catch (err) {
        console.error('Error inserting message into MongoDB:', err);
    }
});

// Start the WhatsApp client
client.initialize();

// Gracefully handle shutdown
process.on('SIGINT', async () => {
    console.log('Shutting down...');
    await clientMongo.close();
    process.exit(0);
});
