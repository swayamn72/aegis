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
import Team from '../models/team.model.js';

const logosPath = path.join(__dirname, '../../client/src/assets/bmicteamlogos');

// Manual mapping of teamName to logo file
const teamLogoMap = {
    'CAG OSAKA': 'ca.png',
    'Dplus': 'dplus.png',
    'DRX': 'drx.png',
    'Gods Reign': 'godsreign.png',
    'K9 Esports': 'k9.png',
    'MAKING THE ROAD': 'mtr.png',
    'Mysterious 4': 'mysterious4.png',
    'Nebula Esports': 'nebula.png',
    'Nongshim Redforce': 'nsr.png',
    'Orangutan': 'orangutan.png',
    'REIGNITE': 'reignite.png',
    'Team SouL': 'soul.png',
    'True Rippers': 'truerippers.png'
};

async function uploadTeamLogos() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // Get all teams
        const teams = await Team.find({});
        console.log(`Found ${teams.length} teams in database`);

        // Upload logos and update teams
        for (const team of teams) {
            const logoFile = teamLogoMap[team.teamName];

            if (logoFile) {
                const logoPath = path.join(logosPath, logoFile);
                if (fs.existsSync(logoPath)) {
                    try {
                        const result = await cloudinary.uploader.upload(logoPath, {
                            folder: 'team_logos',
                        });
                        team.logo = result.secure_url;
                        await team.save();
                        console.log(`✅ Updated logo for team: ${team.teamName}`);
                    } catch (uploadError) {
                        console.error(`❌ Error uploading logo for ${team.teamName}:`, uploadError.message);
                    }
                } else {
                    console.log(`⚠️ Logo file ${logoFile} not found for team: ${team.teamName}`);
                }
            } else {
                console.log(`⚠️ No logo mapping for team: ${team.teamName}`);
            }
        }

        console.log('✅ Logo upload completed');
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('✅ Disconnected from MongoDB');
    }
}

uploadTeamLogos();
