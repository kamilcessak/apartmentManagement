import { Request, Response } from 'express';
import { MulterFileType } from '../types/files.types';
import path from 'path';
import { existsSync, unlinkSync } from 'fs';

type MulterRequest = Request & {
    file?: MulterFileType;
    files?: MulterFileType[];
};

export const uploadFile = async (req: MulterRequest, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'File not uploaded' });
        }

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

export const getFile = async (req: Request, res: Response) => {
    try {
        const fileUrl = path.join(
            process.cwd(),
            'uploads',
            req.params.filename
        );

        if (!existsSync(fileUrl)) {
            return res.status(404).json({ error: 'File not found' });
        }
        res.status(200).json({
            url: `${req.protocol}://${req.get('host')}/uploads/${req.params.filename}`,
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
        const fileUrl = path.join(
            process.cwd(),
            'uploads',
            req.params.filename
        );
        if (!existsSync(fileUrl)) {
            return res.status(404).json({ error: 'File not found' });
        }
        unlinkSync(fileUrl);
        res.status(200).json({ success: true, message: 'File is deleted' });
    } catch (error) {
        res.status(500).json({
            error: 'An error occurred while deleting file.',
        });
    }
};
