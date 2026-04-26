import { Request, Response } from 'express';
import crypto from 'crypto';
import mongoose from 'mongoose';
import { TenantModel, TenantSchemaType } from '../models/tenant.model';
import { UserModel } from '../models/user.model';
import { sendEmail } from '../services/email.service';
import { FRONTEND_URL } from '../config';

const generateInvitationCode = (): string =>
    crypto.randomBytes(5).toString('hex').slice(0, 10).toUpperCase();

const buildInvitationEmail = (
    tenant: Pick<TenantSchemaType, 'firstName' | 'lastName' | 'email' | 'invitationCode'>
): { subject: string; html: string } => {
    const link = `${FRONTEND_URL}/register?invitationCode=${tenant.invitationCode}&email=${encodeURIComponent(
        tenant.email
    )}`;
    return {
        subject: 'You have been invited to Apartment Management',
        html: `
            <div style="display: flex; flex-direction: column; font-family: Arial, sans-serif;">
                <h1>Hello, ${tenant.firstName} ${tenant.lastName}!</h1>
                <p>Your landlord has invited you to Apartment Management.</p>
                <p>Use the following invitation code when creating your account:</p>
                <p style="font-size: 20px; font-weight: bold; letter-spacing: 2px;">${tenant.invitationCode}</p>
                <p>Or simply click the link below to get started:</p>
                <a href="${link}" style="color: #1565c0;">${link}</a>
            </div>
        `,
    };
};

export const createTenant = async (req: Request, res: Response) => {
    try {
        const userID = req.user?.id;
        if (!userID) {
            res.status(403).json({ error: 'User not authenticated' });
            return;
        }

        const { firstName, lastName, email, phoneNumber, address } = req.body;
        const data = {
            firstName,
            lastName,
            email,
            phoneNumber,
            address,
            isActive: false,
            invitationCode: generateInvitationCode(),
            owner: userID,
            assignedApartmentID: null,
            userID: null,
        };

        const newTenant = await TenantModel.create(data);

        // Fire invitation email; failure must not block tenant creation, but
        // we log it so the landlord can resend from the tenant detail view.
        try {
            const { subject, html } = buildInvitationEmail(newTenant);
            await sendEmail(newTenant.email, subject, html);
        } catch (mailErr) {
            console.error(
                '[createTenant] Failed to send invitation email',
                mailErr
            );
        }

        res.status(201).json(newTenant);
    } catch (error) {
        console.error('[createTenant]', error);
        res.status(500).json({
            error: 'An error occurred while adding a new Tenant',
        });
    }
};

export const resendTenantInvitation = async (req: Request, res: Response) => {
    try {
        const userID = req.user?.id;
        const tenantID = req.params.id;

        if (!userID) {
            res.status(403).json({ error: 'User not authenticated' });
            return;
        }

        if (!mongoose.Types.ObjectId.isValid(tenantID)) {
            res.status(400).json({ error: 'Invalid Tenant ID format' });
            return;
        }

        const tenant = await TenantModel.findOne({
            _id: tenantID,
            owner: userID,
        });

        if (!tenant) {
            res.status(404).json({
                error: 'Tenant not found or you are not the owner',
            });
            return;
        }

        if (tenant.userID) {
            res.status(400).json({
                error: 'Tenant has already accepted the invitation',
            });
            return;
        }

        const { subject, html } = buildInvitationEmail(tenant);
        await sendEmail(tenant.email, subject, html);

        res.status(200).json({ message: 'Invitation resent successfully' });
    } catch (error) {
        console.error('[resendTenantInvitation]', error);
        res.status(500).json({
            error: 'An error occurred while sending invitation',
        });
    }
};

export const getTenants = async (req: Request, res: Response) => {
    try {
        const userID = req.user?.id;
        if (!userID) {
            res.status(403).json({ error: 'User not authenticated' });
            return;
        }

        const tenants = await TenantModel.find({ owner: userID }).lean();

        const linkedUserIds = tenants
            .map((tenant) => tenant.userID)
            .filter((id): id is NonNullable<typeof id> => Boolean(id));

        const linkedUsers = linkedUserIds.length
            ? await UserModel.find({
                  _id: { $in: linkedUserIds },
              })
                  .select('_id isEmailVerified')
                  .lean()
            : [];

        const verificationByUserId = new Map(
            linkedUsers.map((user) => [String(user._id), !!user.isEmailVerified])
        );

        // Keep legacy tenant statuses aligned with real account verification.
        const normalizedTenants = tenants.map((tenant) => {
            const verified = tenant.userID
                ? verificationByUserId.get(String(tenant.userID))
                : undefined;

            return {
                ...tenant,
                isActive: verified ?? tenant.isActive,
            };
        });

        const tenantsToActivate = normalizedTenants
            .filter((tenant) => tenant.userID && tenant.isActive)
            .map((tenant) => tenant._id);

        if (tenantsToActivate.length > 0) {
            await TenantModel.updateMany(
                { _id: { $in: tenantsToActivate }, isActive: false },
                { $set: { isActive: true } }
            );
        }

        res.status(200).json(normalizedTenants);
    } catch (error) {
        console.error('[getTenants]', error);
        res.status(500).json({
            error: 'An error occurred while getting your Tenants',
        });
    }
};

export const getTenantsList = async (req: Request, res: Response) => {
    try {
        const userID = req.user?.id;
        if (!userID) {
            res.status(403).json({ error: 'User not authenticated' });
            return;
        }

        const tenants = await TenantModel.find({
            owner: userID,
            assignedApartmentID: null,
        }).select('_id firstName lastName');
        res.status(200).json(tenants);
    } catch (error) {
        console.error('[getTenantsList]', error);
        res.status(500).json({
            error: 'An error occurred while getting your tenants list',
        });
    }
};

export const getTenant = async (req: Request, res: Response) => {
    try {
        const tenantID = req.params.id;
        const userID = req.user?.id;

        if (!userID) {
            res.status(403).json({ error: 'User not authenticated' });
            return;
        }

        const tenant = await TenantModel.findOne({
            _id: tenantID,
            owner: userID,
        });

        if (!tenant) {
            res.status(404).json({ error: 'Tenant not found' });
            return;
        }

        res.status(200).json(tenant);
    } catch (error) {
        console.error('[getTenant]', error);
        res.status(500).json({
            error: 'An error occurred while getting your Tenant',
        });
    }
};

export const deleteTenant = async (req: Request, res: Response) => {
    try {
        const tenantID = req.params.id;
        const userID = req.user?.id;

        if (!userID) {
            res.status(403).json({ error: 'User not authenticated' });
            return;
        }

        if (!mongoose.Types.ObjectId.isValid(tenantID)) {
            res.status(400).json({ error: 'Invalid Tenant ID format' });
            return;
        }

        const deletedTenant = await TenantModel.findOneAndDelete({
            _id: tenantID,
            owner: userID,
        });

        if (!deletedTenant) {
            res.status(404).json({
                error: 'Tenant not found or you are not the owner',
            });
            return;
        }

        res.status(200).json({ message: 'Tenant deleted successfully' });
    } catch (error) {
        console.error('[deleteTenant]', error);
        res.status(500).json({
            error: 'An error occurred while removing your Tenant',
        });
    }
};

export const patchTenant = async (req: Request, res: Response) => {
    try {
        const tenantID = req.params.id;
        const userID = req.user?.id;

        if (!userID) {
            res.status(403).json({ error: 'User not authenticated' });
            return;
        }

        if (!mongoose.Types.ObjectId.isValid(tenantID)) {
            res.status(400).json({ error: 'Invalid Tenant ID format' });
            return;
        }

        // Prevent clients from rewriting trust-critical fields via PATCH
        const {
            owner: _o,
            invitationCode: _ic,
            userID: _uid,
            ...safeUpdates
        } = req.body ?? {};

        const updatedTenant = await TenantModel.findOneAndUpdate(
            { _id: tenantID, owner: userID },
            { $set: safeUpdates },
            { new: true, runValidators: true }
        );

        if (!updatedTenant) {
            res.status(404).json({
                error: 'Tenant not found or you are not the owner',
            });
            return;
        }

        res.status(200).json({ message: 'Tenant updated successfully' });
    } catch (error) {
        console.error('[patchTenant]', error);
        res.status(500).json({
            error: 'An error occurred while updating your Tenant',
        });
    }
};
