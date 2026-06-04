const fs = require('fs');
const path = require('path');
const cloudinary = require('cloudinary').v2;
const { PrismaClient } = require('@prisma/client');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const prisma = new PrismaClient();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const IMAGES_DIR = path.join(__dirname, '../../frontend/public/images');
const URL_MAPPING_FILE = path.join(__dirname, 'mapping.json');

async function getFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isDirectory()) {
            getFiles(filePath, fileList);
        } else {
            fileList.push(filePath);
        }
    }
    return fileList;
}

async function run() {
    console.log('Starting Cloudinary migration...');
    const allFiles = await getFiles(IMAGES_DIR);
    const validExts = ['.png', '.jpg', '.jpeg', '.svg', '.gif', '.webp'];
    const imageFiles = allFiles.filter(f => validExts.includes(path.extname(f).toLowerCase()));

    console.log(`Found ${imageFiles.length} image files to upload.`);
    const mapping = {};

    for (const file of imageFiles) {
        // e.g. /images/products/xyz.png
        const relativePath = file.substring(file.indexOf('images')).replace(/\\/g, '/');
        const folder = relativePath.includes('products') ? 'shuddheats/products' : 'shuddheats/assets';
        
        console.log(`Uploading ${relativePath}...`);
        try {
            const result = await cloudinary.uploader.upload(file, { folder, use_filename: true, unique_filename: false });
            mapping[`/${relativePath}`] = result.secure_url;
        } catch (err) {
            console.error(`Failed to upload ${relativePath}:`, err.message);
        }
    }

    fs.writeFileSync(URL_MAPPING_FILE, JSON.stringify(mapping, null, 2));
    console.log(`Uploaded all images. Mapping saved to ${URL_MAPPING_FILE}`);

    // Update DB
    console.log('Updating database records...');
    const products = await prisma.product.findMany();
    for (const product of products) {
        let updated = false;
        let newThumbnail = product.thumbnail;
        let newImages = product.images;

        if (newThumbnail && mapping[newThumbnail]) {
            newThumbnail = mapping[newThumbnail];
            updated = true;
        }

        if (Array.isArray(newImages)) {
            const mappedImages = newImages.map(img => mapping[img] || img);
            if (JSON.stringify(mappedImages) !== JSON.stringify(newImages)) {
                newImages = mappedImages;
                updated = true;
            }
        }

        if (updated) {
            await prisma.product.update({
                where: { id: product.id },
                data: { thumbnail: newThumbnail, images: newImages }
            });
            console.log(`Updated product: ${product.name}`);
        }
    }
    
    console.log('Migration complete!');
    await prisma.$disconnect();
}

run().catch(e => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
});
