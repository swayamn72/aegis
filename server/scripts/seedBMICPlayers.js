import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { v2 as cloudinary } from 'cloudinary';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_SECRET_KEY,
});

// Import models
import Player from '../models/player.model.js';
import Team from '../models/team.model.js';

const jsonPath = path.join(__dirname, '../../client/src/assets/bmic_2025_players.json');

// Manual mapping of ingame_name (lowercase) to image file
const imageMap = {
    'aaru': 'aaru.jpg',
    'akop': 'akop.jpg',
    'wizzgod': 'wizzgod.jpg',
    'attanki': 'attanki.jpg',
    'nakul': 'nakul.jpg',
    'goblin': 'goblin.png',
    'jokerr': 'joker.png',
    'jelly': 'jelly.png',
    'kiolmao': 'kiolmao.png',
    'destro': 'destro.png',
    'justin': 'justin.png',
    'deltapg': 'deltapg.png',
    'neyo': 'neyo.png',
    'shadow': 'shadow.jpg',
    'clutchgod': 'clutchgod.png',
    'chpz': 'chpz.png',
    'osal': 'osal.png',
    'favian': 'favian.png',
    'nolbu': 'nolbu.png',
    'forest': 'forest.png',
    'dokc': 'dokc.jpg',
    'bini': 'bini.jpg',
    'xzy': 'xzy.png',
    'tizi': 'tizi.jpg',
    'sporta': 'sporta.png',
    'sixta': 'sixta.png',
    'cyxae': 'cyxae.png',
    'hyunbin': 'hyunbin.jpg',
    'qx': 'qx.jpg',
    'reijioco': 'reiji.jpg',
    'duelo': 'duelo.jpg',
    'devine': 'devine.jpg',
    'sara': 'sara.jpg',
    'garnet': 'garnet.jpg',
    'naoto': 'naoto.jpg'
};

// Function to get image file, handling conflicts
const getImageFile = (playerData) => {
    const name = playerData.ingame_name.toLowerCase();
    if (name === 'omega') {
        if (playerData.team === 'K9 Esports') return 'omega.png';
        if (playerData.team === 'Mysterious 4') return 'm4omega.png';
    }
    if (name === 'apollo') {
        if (playerData.team === 'Madkings Esports') return 'madkingsapollo.jpg';
        if (playerData.team === 'REJECT') return 'rcapollo.jpg';
    }
    return imageMap[name] || null;
};

async function seedBMICPlayers() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // Read JSON file
        const data = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

        // Group players by team
        const teamsMap = {};
        data.forEach((player, index) => {
            if (!teamsMap[player.team]) {
                teamsMap[player.team] = {
                    teamName: player.team,
                    country: player.country,
                    region: player.country === 'India' ? 'India' : 'Global',
                    players: []
                };
            }
            teamsMap[player.team].players.push({
                ...player,
                email: `testplayer${index + 1}@dummy.com`, // Emails: testplayer1, testplayer2, etc.
                password: '12345678'
            });
        });

        let playerCounter = 1; // For unique emails

        for (const teamName in teamsMap) {
            const teamData = teamsMap[teamName];
            const playersData = teamData.players;

            // Create players
            const createdPlayers = [];
            for (const playerData of playersData) {
                try {
                    const teamSlug = playerData.team.replace(/\s+/g, '').toLowerCase();
                    const player = new Player({
                        username: `${playerData.ingame_name}_${teamSlug}`, // Make unique by appending team slug
                        inGameName: playerData.ingame_name,
                        realName: playerData.real_name,
                        email: `testplayer${playerCounter}@dummy.com`,
                        password: '12345678', // Hash if needed, but for seeding, plain text
                        verified: true, // Set to true for seeding
                        country: playerData.country,
                        primaryGame: 'BGMI',
                        teamStatus: 'in a team'
                    });

                    // Check for profile image using manual mapping
                    const imageFile = getImageFile(playerData);
                    if (imageFile) {
                        const imagePath = path.join(__dirname, '../../client/src/assets/bmicplayerimages', imageFile);
                        if (fs.existsSync(imagePath)) {
                            try {
                                const result = await cloudinary.uploader.upload(imagePath, {
                                    folder: 'player_profiles',
                                });
                                player.profilePicture = result.secure_url;
                                console.log(`Uploaded image for ${playerData.ingame_name}`);
                            } catch (uploadError) {
                                console.error(`Error uploading image for ${playerData.ingame_name}:`, uploadError.message);
                            }
                        } else {
                            console.log(`Image file ${imageFile} not found for ${playerData.ingame_name}`);
                        }
                    }

                    await player.save();
                    createdPlayers.push(player);
                    playerCounter++;
                    console.log(`Created player: ${player.username}`);
                } catch (error) {
                    console.error(`Error creating player ${playerData.ingame_name}:`, error.message);
                }
            }

            if (createdPlayers.length === 0) {
                console.log(`No players created for team ${teamName}, skipping team creation.`);
                continue;
            }

            // Create team
            try {
                // Generate unique teamTag from teamName (e.g., "Orangutan" -> "ORAN")
                const teamTag = teamData.teamName.replace(/\s+/g, '').substring(0, 4).toUpperCase();
                const team = new Team({
                    teamName: teamData.teamName,
                    teamTag: teamTag,
                    country: teamData.country,
                    region: teamData.region,
                    primaryGame: 'BGMI',
                    captain: createdPlayers[0]._id, // First player as captain
                    players: createdPlayers.map(p => p._id)
                });
                await team.save();

                // Update players with team reference
                for (const player of createdPlayers) {
                    player.team = team._id;
                    await player.save();
                }

                console.log(`Created team: ${team.teamName} with ${createdPlayers.length} players`);
            } catch (error) {
                console.error(`Error creating team ${teamData.teamName}:`, error.message);
            }
        }

        console.log('✅ Seeding completed');
    } catch (error) {
        console.error('❌ Seeding failed:', error);
    } finally {
        await mongoose.disconnect();
        console.log('✅ Disconnected from MongoDB');
    }
}

seedBMICPlayers();
