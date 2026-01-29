/**
 * Script para comprimir y optimizar imágenes del banco
 * 
 * USO: node scripts/compressImages.js
 * 
 * Este script:
 * 1. Lee las imágenes de assets/bank/ (PNG, JPG, etc.)
 * 2. Las convierte a WebP (mejor compresión)
 * 3. Las redimensiona a un tamaño razonable
 * 4. ELIMINA los PNG originales automáticamente
 * 
 * NOTA: Requiere sharp instalado: npm install --save-dev sharp
 */

const fs = require('fs');
const path = require('path');

// Configuración
const CONFIG = {
    // Carpeta de imágenes
    bankFolder: path.join(__dirname, '..', 'assets', 'bank'),
    // Tamaño máximo (mantiene aspecto)
    maxSize: 512,
    // Calidad WebP (1-100, 85 es buen balance)
    quality: 85,
    // Eliminar PNG originales después de convertir
    deletePngAfterConvert: true,
};

async function compressImages() {
    let sharp;
    try {
        sharp = require('sharp');
    } catch (error) {
        console.error('❌ Error: sharp no está instalado.');
        console.log('   Ejecuta: npm install --save-dev sharp');
        return;
    }

    console.log('🖼️  Compressor de Imágenes - WebP');
    console.log('='.repeat(50));

    // Leer archivos de imagen (solo formatos a convertir, NO webp existentes)
    const convertibleExtensions = /\.(png|jpg|jpeg|gif|bmp|tiff)$/i;
    let files;
    try {
        files = fs.readdirSync(CONFIG.bankFolder).filter(f => convertibleExtensions.test(f));
    } catch (error) {
        console.error('❌ Error leyendo carpeta:', error.message);
        return;
    }

    if (files.length === 0) {
        console.log('✅ No hay imágenes PNG/JPG para convertir');
        console.log('   (Todas las imágenes ya están en formato WebP)');
        return;
    }

    console.log(`\n🔍 Encontradas ${files.length} imágenes para convertir a WebP\n`);

    let totalOriginal = 0;
    let totalOptimized = 0;
    const deletedFiles = [];

    for (const file of files) {
        const inputPath = path.join(CONFIG.bankFolder, file);
        const baseName = path.parse(file).name;
        const ext = path.parse(file).ext.toLowerCase();

        try {
            const originalStats = fs.statSync(inputPath);
            const originalSizeKB = originalStats.size / 1024;
            totalOriginal += originalStats.size;

            // Procesar imagen
            let image = sharp(inputPath);
            const metadata = await image.metadata();

            // Redimensionar si es necesario (mantiene aspecto)
            if (metadata.width > CONFIG.maxSize || metadata.height > CONFIG.maxSize) {
                image = image.resize(CONFIG.maxSize, CONFIG.maxSize, {
                    fit: 'inside',
                    withoutEnlargement: true,
                });
            }

            // Guardar como WebP
            const webpPath = path.join(CONFIG.bankFolder, `${baseName}.webp`);
            await image
                .webp({ quality: CONFIG.quality, alphaQuality: CONFIG.quality })
                .toFile(webpPath);

            const webpStats = fs.statSync(webpPath);
            const webpSizeKB = webpStats.size / 1024;
            totalOptimized += webpStats.size;

            const savings = ((1 - webpStats.size / originalStats.size) * 100).toFixed(1);

            console.log(`✅ ${baseName}${ext} → ${baseName}.webp`);
            console.log(`   ${originalSizeKB.toFixed(1)} KB → ${webpSizeKB.toFixed(1)} KB (${savings}% reducción)`);

            // Eliminar el archivo original (PNG/JPG)
            if (CONFIG.deletePngAfterConvert) {
                fs.unlinkSync(inputPath);
                deletedFiles.push(file);
                console.log(`   🗑️  Eliminado: ${file}`);
            }

        } catch (error) {
            console.error(`❌ Error procesando ${file}:`, error.message);
        }
    }

    // Resumen
    console.log('\n' + '='.repeat(50));
    console.log('📊 RESUMEN DE OPTIMIZACIÓN');
    console.log('='.repeat(50));
    console.log(`   Imágenes convertidas: ${files.length}`);
    console.log(`   Tamaño original:      ${(totalOriginal / 1024 / 1024).toFixed(2)} MB`);
    console.log(`   Tamaño WebP:          ${(totalOptimized / 1024 / 1024).toFixed(2)} MB`);
    console.log(`   Ahorro total:         ${((1 - totalOptimized / totalOriginal) * 100).toFixed(1)}%`);
    if (deletedFiles.length > 0) {
        console.log(`   Archivos eliminados:  ${deletedFiles.length} PNG/JPG`);
    }
    console.log('='.repeat(50));

    console.log('\n✨ ¡Optimización completada!');
    console.log('   Ahora ejecuta: node scripts/generateImageBank.js');
}

compressImages().catch(console.error);

