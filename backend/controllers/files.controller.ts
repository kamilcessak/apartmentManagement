import { Request, Response } from 'express';
import path from 'path';
import { existsSync, unlinkSync } from 'fs';
import { MulterFileType } from '../types/files.types';
import { UploadedFileModel } from '../models/uploadedFile.model';
import { userCanAccessUpload } from '../services/filesAccess.service';

type MulterRequest = Request & {
    file?: MulterFileType;
    files?: MulterFileType[];
};

const guessMime = (filename: string): string => {
    const lower = filename.toLowerCase();
    if (lower.endsWith('.pdf')) return 'application/pdf';
    if (lower.endsWith('.png')) return 'image/png';
    if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) return 'image/jpeg';
    if (lower.endsWith('.gif')) return 'image/gif';
    if (lower.endsWith('.webp')) return 'image/webp';
    return 'application/octet-stream';
};

const safeUploadFilename = (raw: string): string | null => {
    const decoded = decodeURIComponent(raw);
    const base = path.basename(decoded);
    if (decoded.includes('..') || base !== decoded) {
        return null;
    }
    return base;
};

export const uploadFile = async (req: MulterRequest, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'File not uploaded' });
        }

        const userID = req.user?.id;
        if (!userID) {
            return res.status(403).json({ error: 'User not authenticated' });
        }

        await UploadedFileModel.create({
            filename: req.file.filename,
            owner: userID,
        });

        const fileUrl = `/uploads/${req.file.filename}`;
        res.status(200).json({
            success: true,
            url: fileUrl,
            originalName: req.file.originalname,
            fileName: req.file.filename,
            type: req.file.mimetype,
        });
    } catch (error) {
        res.status(500).json({
            error: 'An error occurred while uploading file.',
        });
    }
};

export const uploadMultipleFiles = async (
    req: MulterRequest,
    res: Response
) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ error: 'Files not uploaded.' });
        }

        const userID = req.user?.id;
        if (!userID) {
            return res.status(403).json({ error: 'User not authenticated' });
        }

        await UploadedFileModel.insertMany(
            req.files.map((f) => ({
                filename: f.filename,
                owner: userID,
            }))
        );

        const files = req.files.map((e) => {
            const fileUrl = `/uploads/${e.filename}`;
            return {
                url: fileUrl,
                originalName: e.originalname,
                fileName: e.filename,
                type: e.mimetype,
            };
        });

        return res.status(200).json({
            success: true,
            files,
        });
    } catch (error) {
        res.status(500).json({
            error: 'An error occurred while uploading files.',
        });
    }
};

export const streamUploadedFile = async (req: Request, res: Response) => {
    try {
        const filename = safeUploadFilename(req.params.filename);
        if (!filename) {
            res.status(400).json({ error: 'Invalid filename' });
            return;
        }

        const user = req.user;
        if (!user?.id || !user.role) {
            res.status(401).json({ error: 'Access denied' });
            return;
        }

        const allowed = await userCanAccessUpload(
            String(user.id),
            user.role as 'Landlord' | 'Tenant',
            filename
        );
        if (!allowed) {
            res.status(403).json({ error: 'Forbidden' });
            return;
        }

        const abs = path.join(process.cwd(), 'uploads', filename);
        if (!existsSync(abs)) {
            res.status(404).json({ error: 'File not found' });
            return;
        }

        res.setHeader('Content-Type', guessMime(filename));
        res.setHeader(
            'Content-Disposition',
            `inline; filename="${encodeURIComponent(filename)}"`
        );
        res.sendFile(abs);
    } catch (error) {
        console.error('[streamUploadedFile]', error);
        res.status(500).json({ error: 'Failed to stream file' });
    }
};

export const getFile = async (req: Request, res: Response) => {
    try {
        const filename = safeUploadFilename(req.params.filename);
        if (!filename) {
            return res.status(400).json({ error: 'Invalid filename' });
        }

        const user = req.user;
        if (!user?.id || !user.role) {
            return res.status(401).json({ error: 'Access denied' });
        }

        const allowed = await userCanAccessUpload(
            String(user.id),
            user.role as 'Landlord' | 'Tenant',
            filename
        );
        if (!allowed) {
            return res.status(403).json({ error: 'Forbidden' });
        }

        const fileUrl = path.join(process.cwd(), 'uploads', filename);

        if (!existsSync(fileUrl)) {
            return res.status(404).json({ error: 'File not found' });
        }

        res.status(200).json({
            fileName: filename,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: 'An error occurred while getting a file.',
        });
    }
};

export const deleteFile = async (req: Request, res: Response) => {
    try {
        const filename = safeUploadFilename(req.params.filename);
        if (!filename) {
            return res.status(400).json({ error: 'Invalid filename' });
        }

        const user = req.user;
        if (!user?.id || !user.role) {
            return res.status(401).json({ error: 'Access denied' });
        }

        if (user.role !== 'Landlord') {
            return res.status(403).json({ error: 'Forbidden' });
        }

        const allowed = await userCanAccessUpload(
            String(user.id),
            'Landlord',
            filename
        );
        if (!allowed) {
            return res.status(403).json({ error: 'Forbidden' });
        }

        const fileUrl = path.join(process.cwd(), 'uploads', filename);
        if (!existsSync(fileUrl)) {
            return res.status(404).json({ error: 'File not found' });
        }

        unlinkSync(fileUrl);
        await UploadedFileModel.deleteOne({ filename }).catch(() => undefined);

        res.status(200).json({ success: true, message: 'File is deleted' });
    } catch (error) {
        res.status(500).json({
            error: 'An error occurred while deleting file.',
        });
    }
};
