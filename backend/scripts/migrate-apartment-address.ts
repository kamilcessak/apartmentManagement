/**
 * One-time migration: legacy single `address` string → structured fields.
 *
 * Ładuje zmienne z pliku `backend/.env` (ścieżka względem tego pliku), niezależnie
 * od tego, skąd wywołujesz komendę.
 *
 * URI (pierwsza niepusta wartość):
 *   MIGRATION_MONGO_URI → MONGODB_URI → ATLAS_URI
 *
 * Przykłady:
 *   cd backend && npm run migrate:apartment-address
 *   docker compose exec backend npm run migrate:apartment-address
 *
 * W Dockerze w `backend/.env` host musi być `mongodb` (nazwa serwisu), nie `localhost`.
 */

import path from 'path';
import { fileURLToPath } from 'url';

import dotenv from 'dotenv';
import mongoose from 'mongoose';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envResult = dotenv.config({ path: path.resolve(__dirname, '../.env') });
if (envResult.error) {
    console.warn(
        `[migrate] Nie znaleziono lub nie wczytano pliku .env: ${path.resolve(__dirname, '../.env')}`
    );
    console.warn(`[migrate] Powód: ${envResult.error.message}`);
}

const ATLAS_URI = (
    process.env.MIGRATION_MONGO_URI ||
    process.env.MONGODB_URI ||
    process.env.ATLAS_URI ||
    ''
).trim();

const DB_NAME = process.env.MONGO_DB_NAME?.trim() || 'apartmentManagement';

const parseLegacyAddress = (address: string) => {
    if (typeof address !== 'string' || !address.trim()) return null;
    const commaIdx = address.lastIndexOf(',');
    if (commaIdx === -1) return null;
    const left = address.slice(0, commaIdx).trim();
    const right = address.slice(commaIdx + 1).trim();
    const m = right.match(/^(\d{2}-\d{3})\s+(.+)$/);
    if (!m) return null;
    const postalCode = m[1];
    const city = m[2].trim();
    const m2 = left.match(/^(.+)\s+(\d+[A-Za-z]?(?:\/\d+[A-Za-z]?)?)$/);
    if (!m2) return null;
    const street = m2[1].trim();
    const buildingCombo = m2[2];
    const slash = buildingCombo.match(/^(\d+[A-Za-z]?)\/(\d+[A-Za-z]?)$/);
    if (slash) {
        return {
            street,
            buildingNumber: slash[1],
            apartmentNumber: slash[2],
            postalCode,
            city,
        };
    }
    return {
        street,
        buildingNumber: buildingCombo,
        postalCode,
        city,
    };
};

/** Dokument wymaga migracji: jest niepusty `address`, a brakuje sensownych pól strukturalnych. */
const needsMigrationFilter = {
    address: { $exists: true, $type: 'string', $nin: ['', null] },
    $or: [
        { street: { $exists: false } },
        { street: null },
        { street: '' },
        { buildingNumber: { $exists: false } },
        { buildingNumber: null },
        { buildingNumber: '' },
        { postalCode: { $exists: false } },
        { postalCode: null },
        { postalCode: '' },
        { city: { $exists: false } },
        { city: null },
        { city: '' },
    ],
};

async function main() {
    if (!ATLAS_URI) {
        console.error(
            '[migrate] Brak URI. Ustaw w backend/.env jedno z: ATLAS_URI, MONGODB_URI lub MIGRATION_MONGO_URI.'
        );
        process.exit(1);
    }

    const redacted = ATLAS_URI.replace(
        /\/\/([^:]+):([^@]+)@/,
        '//***:***@'
    );
    console.log(`[migrate] Łączenie… db=${DB_NAME} uri≈${redacted}`);

    try {
        await mongoose.connect(ATLAS_URI, {
            dbName: DB_NAME,
            serverSelectionTimeoutMS: 12_000,
        });
    } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        console.error('[migrate] Nie udało się połączyć z MongoDB:', msg);
        if (/ENOTFOUND|getaddrinfo/i.test(msg) && /mongodb/i.test(ATLAS_URI)) {
            console.error(
                '\n[migrate] Host „mongodb” działa tylko w sieci Dockera. Wybierz jedno:\n' +
                    '  • Uruchom migrację w kontenerze backendu:\n' +
                    '      docker compose exec backend npm run migrate:apartment-address\n' +
                    '  • Albo z hosta podaj URI z localhost (port 27017 z compose jest wystawiony):\n' +
                    '      MIGRATION_MONGO_URI="mongodb://admin:password@127.0.0.1:27017/?authSource=admin" npm run migrate:apartment-address\n'
            );
        }
        process.exit(1);
    }

    const coll = mongoose.connection.collection('apartments');

    const total = await coll.estimatedDocumentCount();
    const withAddress = await coll.countDocuments({
        address: { $exists: true, $type: 'string', $nin: ['', null] },
    });
    const matched = await coll.countDocuments(needsMigrationFilter);

    console.log(
        `[migrate] Kolekcja "apartments": ok. ${total} dokumentów, z polem address (niepuste): ${withAddress}, pasuje do migracji: ${matched}.`
    );

    if (matched === 0) {
        if (withAddress > 0) {
            console.warn(
                '[migrate] Są dokumenty z "address", ale wszystkie mają już uzupełnione street/building/postal/city — migracja nie jest potrzebna, albo filtr nie obejmuje Twojego przypadku.'
            );
        } else {
            console.warn(
                '[migrate] Brak dokumentów z legacy polem "address" — nic do zrobienia.'
            );
        }
    }

    const cursor = coll.find(needsMigrationFilter);

    let migrated = 0;
    const failed: { id: unknown; address: string }[] = [];

    for await (const doc of cursor) {
        const legacy = doc.address as string;
        const parsed = parseLegacyAddress(legacy);
        if (!parsed) {
            failed.push({ id: doc._id, address: legacy });
            continue;
        }
        await coll.updateOne(
            { _id: doc._id },
            {
                $set: parsed,
                $unset: { address: '' },
            }
        );
        migrated += 1;
    }

    console.log(`[migrate] Zmigrowano: ${migrated} mieszkań.`);
    if (failed.length) {
        console.warn(
            `[migrate] Nie udało się sparsować adresu (${failed.length} dokumentów, bez zmian):`
        );
        for (const f of failed) {
            console.warn(`  _id=${f.id} address=${JSON.stringify(f.address)}`);
        }
    }

    await mongoose.disconnect();
    console.log('[migrate] Gotowe.');
}

main().catch((e) => {
    console.error('[migrate] Błąd (niepołączeniowy):', e);
    process.exit(1);
});
