// require('dotenv').config();

// const { Client, LocalAuth } = require('whatsapp-web.js');
// const { MongoClient } = require('mongodb');
// const qrcode = require('qrcode-terminal');
// const fs = require('fs');
// const path = require('path');

// // Define the chat IDs you want to export messages from
// // const targetChatIds = ['120363372798698747@g.us']; // Replace with your chat IDs

// const targetChatIds = ['120363208764870386@g.us']; // Replace with your chat IDs

// // MongoDB Connection URI (Use environment variables for sensitive data)
// const uri = 'mongodb+srv://umernew:Haider1122@node1.tkgjljq.mongodb.net/?retryWrites=true&w=majority&appName=node1/lab11';
// const clientMongo = new MongoClient(uri);

// // Database and collection names
// const dbName = "whatsappBot";
// const collectionName = "messages";

// // Ensure the media directory exists at startup
// const mediaDir = './media';
// if (!fs.existsSync(mediaDir)) {
//     fs.mkdirSync(mediaDir);
// }

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

//     // Export all messages from target chat IDs with pagination
//     for (const chatId of targetChatIds) {
//         try {
//             const chat = await client.getChatById(chatId);

//             console.log(`Exporting messages from group: ${chat.name}`);
//             let lastMessageId = null;
//             let allMessages = [];
//             const seenMessageIds = new Set(); // Track fetched message IDs to avoid duplicates

//             // Fetch messages iteratively until no more messages are found
//             while (true) {
//                 const messages = await chat.fetchMessages({
//                     limit: 100, // Fetch messages in batches of 100
//                     before: lastMessageId // Fetch messages before the last fetched message
//                 });

//                 if (messages.length === 0) break; // Exit loop if no more messages

//                 // Add unique messages to the array
//                 messages.forEach((msg) => {
//                     if (!seenMessageIds.has(msg.id._serialized)) {
//                         allMessages.push(msg);
//                         seenMessageIds.add(msg.id._serialized);
//                     }
//                 });

//                 // Update lastMessageId for the next batch
//                 lastMessageId = messages[messages.length - 1].id;
//                 console.log(`Fetched ${messages.length} messages, total: ${allMessages.length}`);

//                 // Break if no new unique messages are fetched
//                 if (messages.length > 0 && lastMessageId === messages[messages.length - 1].id) break;
//             }

//             // Process and store all messages
//             const formattedMessages = await Promise.all(allMessages.map(async (msg) => {
//                 const messageData = {
//                     id: msg.id._serialized,
//                     body: msg.body,
//                     fromMe: msg.fromMe,
//                     author: msg.author || msg.from,
//                     timestamp: msg.timestamp,
//                     type: msg.type,
//                     hasMedia: msg.hasMedia,
//                     mediaPath: null, // Initialize mediaPath as null
//                     chatName: chat.name,
//                     chatId: chat.id._serialized,
//                     isGroup: chat.isGroup
//                 };

//                 // Handle media
//                 if (msg.hasMedia) {
//                     try {
//                         const media = await msg.downloadMedia();
//                         if (media && media.mimetype) {
//                             const extension = media.mimetype.split('/')[1];
//                             const validExtensions = ['jpeg', 'jpg', 'png']; // Only allow these image types

//                             if (validExtensions.includes(extension.toLowerCase())) {
//                                 const mediaPath = path.join(mediaDir, `${msg.id.id}.${extension}`);
//                                 fs.writeFileSync(mediaPath, media.data, 'base64');
//                                 messageData.mediaPath = mediaPath; // Save the path to MongoDB
//                                 console.log(`Downloaded image saved to: ${mediaPath}`);
//                             } else {
//                                 console.log(`Skipping non-image media: ${media.mimetype}`);
//                             }
//                         }
//                     } catch (error) {
//                         console.error('Error downloading media:', error);
//                     }
//                 }

//                 return messageData;
//             }));

//             // Save messages to MongoDB
//             const db = clientMongo.db(dbName);
//             const collection = db.collection(collectionName);

//             // Insert messages with valid media paths
//             const messagesToInsert = formattedMessages.filter((msg) => msg.mediaPath || !msg.hasMedia);
//             await collection.insertMany(messagesToInsert);

//             console.log(`Exported and saved ${messagesToInsert.length} messages from ${chat.name}`);
//         } catch (error) {
//             console.error(`Error exporting messages for chat ID ${chatId}:`, error);
//         }
//     }

//     console.log('Export completed!');
// });

// // Start the WhatsApp client
// client.initialize();

// // Gracefully handle shutdown
// process.on('SIGINT', async () => {
//     console.log('Shutting down...');
//     await clientMongo.close();
//     process.exit(0);
// });


require('dotenv').config();

const { Client, LocalAuth } = require('whatsapp-web.js');
const { MongoClient } = require('mongodb');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const path = require('path');

// Define the chat IDs you want to export messages from
const targetChatIds = ['120363208764870386@g.us']; // Replace with your chat IDs

// MongoDB Connection URI (Use environment variables for sensitive data)
const uri = 'mongodb+srv://umernew:Haider1122@node1.tkgjljq.mongodb.net/?retryWrites=true&w=majority&appName=node1/lab11'; // Ensure this variable is defined in your .env file
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

    // Export all messages from target chat IDs with pagination
    for (const chatId of targetChatIds) {
        try {
            const chat = await client.getChatById(chatId);

            console.log(`Exporting messages from group: ${chat.name}`);
            let lastMessageId = null;
            let allMessages = [];
            const seenMessageIds = new Set(); // Track fetched message IDs to avoid duplicates
            let iterations = 0; // To prevent potential infinite loops

            // Fetch messages iteratively until no more messages are found
            while (true) {
                const options = { limit: 100000 };
                if (lastMessageId) {
                    options.before = lastMessageId;
                }
                const messages = await chat.fetchMessages(options);

                if (messages.length === 0) break; // Exit loop if no more messages

                // Add unique messages to the array
                messages.forEach((msg) => {
                    if (!seenMessageIds.has(msg.id._serialized)) {
                        allMessages.push(msg);
                        seenMessageIds.add(msg.id._serialized);
                    }
                });

                // Update lastMessageId for the next batch
                const newLastMessageId = messages[messages.length - 1].id._serialized;

                // Break if lastMessageId doesn't change (to prevent infinite loops)
                if (lastMessageId === newLastMessageId) {
                    console.log('No new messages to fetch. Exiting loop.');
                    break;
                }

                lastMessageId = newLastMessageId;
                console.log(`Fetched ${messages.length} messages, total: ${allMessages.length}`);

                // Optional: Prevent infinite loops by limiting iterations
                iterations++;
                if (iterations > 1000) {
                    console.log('Reached iteration limit. Exiting loop.');
                    break;
                }
            }

            // Process and store all messages
            const formattedMessages = await Promise.all(allMessages.map(async (msg) => {
                const messageData = {
                    id: msg.id._serialized,
                    body: msg.body,
                    fromMe: msg.fromMe,
                    author: msg.author || msg.from,
                    timestamp: msg.timestamp,
                    type: msg.type,
                    hasMedia: msg.hasMedia,
                    mediaPath: null, // Initialize mediaPath as null
                    chatName: chat.name,
                    chatId: chat.id._serialized,
                    isGroup: chat.isGroup
                };

                // Handle media
                if (msg.hasMedia) {
                    try {
                        const media = await msg.downloadMedia();
                        if (media && media.mimetype) {
                            const extension = media.mimetype.split('/')[1];
                            const validExtensions = ['jpeg', 'jpg', 'png']; // Only allow these image types

                            if (validExtensions.includes(extension.toLowerCase())) {
                                const mediaPath = path.join(mediaDir, `${msg.id.id}.${extension}`);
                                fs.writeFileSync(mediaPath, media.data, 'base64');
                                messageData.mediaPath = mediaPath; // Save the path to MongoDB
                                console.log(`Downloaded image saved to: ${mediaPath}`);
                            } else {
                                console.log(`Skipping non-image media: ${media.mimetype}`);
                            }
                        }
                    } catch (error) {
                        console.error('Error downloading media:', error);
                    }
                }

                return messageData;
            }));

            // Save messages to MongoDB
            const db = clientMongo.db(dbName);
            const collection = db.collection(collectionName);

            // Insert messages with valid media paths
            const messagesToInsert = formattedMessages.filter((msg) => msg.mediaPath || !msg.hasMedia);
            await collection.insertMany(messagesToInsert);

            console.log(`Exported and saved ${messagesToInsert.length} messages from ${chat.name}`);
        } catch (error) {
            console.error(`Error exporting messages for chat ID ${chatId}:`, error);
        }
    }

    console.log('Export completed!');
});

// Start the WhatsApp client
client.initialize();

// Gracefully handle shutdown
process.on('SIGINT', async () => {
    console.log('Shutting down...');
    await clientMongo.close();
    process.exit(0);
});
