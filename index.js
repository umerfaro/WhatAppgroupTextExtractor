// const { Client, LocalAuth } = require('whatsapp-web.js');
// const { MongoClient } = require('mongodb');
// const qrcode = require('qrcode-terminal');
// const fs = require('fs');
// const path = require('path');

// // Define the chat IDs you want to listen to
// const targetChatIds = ['120363372798698747@g.us', '120363283394355609@g.us']; // Replace with your chat IDs

// // MongoDB Connection URI (Use environment variables for sensitive data)
// const uri = 'mongodb+srv://umernew:Haider1122@node1.tkgjljq.mongodb.net/?retryWrites=true&w=majority&appName=node1/lab11'; // Set your MongoDB URI in an environment variable
// const clientMongo = new MongoClient(uri);

// // Database and collection names
// const dbName = "whatsappBot";
// const collectionName = "messages";

// // Initialize WhatsApp client
// const client = new Client({
//     authStrategy: new LocalAuth({ clientId: "whatsapp-group-bot" })
// });

// // Generate and display QR code for authentication
// client.on('qr', (qr) => {
//     qrcode.generate(qr, { small: true });
//     console.log('Scan the QR code above with your WhatsApp mobile app.');
// });

// // Log successful authentication
// client.on('ready', async () => {
//     console.log('WhatsApp client is ready!');

//     // Connect to MongoDB
//     try {
//         await clientMongo.connect();
//         console.log('Connected to MongoDB!');
//     } catch (err) {
//         console.error('Error connecting to MongoDB:', err);
//         process.exit(1);
//     }

//     // Fetch and log chat names and IDs for your reference
//     const chats = await client.getChats();
//     console.log('Available Chats:');
//     chats.forEach(chat => {
//         console.log(`Chat Name: ${chat.name || chat.id.user}, Chat ID: ${chat.id._serialized}`);
//     });
// });

// // Listen for messages
// client.on('message', async (msg) => {
//     try {
//         const chat = await msg.getChat();

//         // Check if the message is from a target chat ID
//         if (targetChatIds.includes(chat.id._serialized)) {
//             console.log(`Message from ${chat.name || chat.id.user}: ${msg.body}`);

//             const messageData = {
//                 id: msg.id._serialized,
//                 body: msg.body,
//                 fromMe: msg.fromMe,
//                 author: msg.author || msg.from,
//                 timestamp: msg.timestamp,
//                 type: msg.type,
//                 hasMedia: msg.hasMedia,
//                 mediaPath: null,
//                 chatName: chat.name || chat.id.user,
//                 chatId: chat.id._serialized,
//                 isGroup: chat.isGroup
//             };

//             // Handle media files
//             if (msg.hasMedia) {
//                 try {
//                     // Ensure the media directory exists
//                     if (!fs.existsSync('./media')) {
//                         fs.mkdirSync('./media');
//                     }

//                     const media = await msg.downloadMedia();
//                     const extension = media.mimetype.split('/')[1];
//                     const mediaPath = `./media/${msg.id.id}.${extension}`;
//                     fs.writeFileSync(mediaPath, media.data, 'base64');
//                     messageData.mediaPath = mediaPath;
//                 } catch (error) {
//                     console.error('Error handling media:', error);
//                 }
//             }

//             // Save message to MongoDB
//             try {
//                 const db = clientMongo.db(dbName);
//                 const collection = db.collection(collectionName);
//                 await collection.insertOne(messageData);
//                 console.log('Message stored in MongoDB:', messageData);
//             } catch (err) {
//                 console.error('Error inserting message into MongoDB:', err);
//             }
//         }
//     } catch (error) {
//         console.error('Error in message handler:', error);
//     }
// });

// // Start the WhatsApp client
// client.initialize();

// // Gracefully handle shutdown
// process.on('SIGINT', async () => {
//     console.log('Shutting down...');
//     await clientMongo.close();
//     process.exit(0);
// });


require('dotenv').config(); // Add this at the top to load environment variables

const { Client, LocalAuth } = require('whatsapp-web.js');
const { MongoClient } = require('mongodb');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const path = require('path');

// Define the chat IDs you want to listen to
const targetChatIds = ['120363283394355609@g.us']; // Replace with your chat IDs

// MongoDB Connection URI (Use environment variables for sensitive data)
const uri = 'mongodb+srv://umernew:Haider1122@node1.tkgjljq.mongodb.net/?retryWrites=true&w=majority&appName=node1/lab11'; // Ensure this variable is defined
const clientMongo = new MongoClient(uri);

// Database and collection names
const dbName = "whatsappBot";
const collectionName = "messages";

// Ensure the media directory exists at startup
const mediaDir = './media';
if (!fs.existsSync(mediaDir)) {
    fs.mkdirSync(mediaDir);
}

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

    // Fetch and log chat names and IDs for your reference
    const chats = await client.getChats();
    console.log('Available Chats:');
    chats.forEach(chat => {
        console.log(`Chat Name: ${chat.name || chat.id.user}, Chat ID: ${chat.id._serialized}`);
    });
});

// Listen for messages
client.on('message', async (msg) => {
    try {
        const chat = await msg.getChat();

        // Check if the message is from a target chat ID
        if (targetChatIds.includes(chat.id._serialized)) {
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
                chatName: chat.name || chat.id.user,
                chatId: chat.id._serialized,
                isGroup: chat.isGroup
            };

            // Handle media files
            if (msg.hasMedia) {
                try {
                    const media = await msg.downloadMedia();

                    // Check if media is defined and has mimetype
                    if (media && media.mimetype) {
                        const extension = media.mimetype.split('/')[1];
                        const mediaPath = `./media/${msg.id.id}.${extension}`;
                        fs.writeFileSync(mediaPath, media.data, 'base64');
                        messageData.mediaPath = mediaPath;
                    } else {
                        console.error(`Failed to download media for message ID: ${msg.id._serialized}`);
                    }
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
        }
    } catch (error) {
        console.error('Error in message handler:', error);
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
