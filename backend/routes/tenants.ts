import express from "express";
import db from "../db/connection";
import { ObjectId } from "mongodb";

const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const collection = db.collection("tenants");
        const tenants = await collection.find({}).toArray();
        setTimeout(async () => {
            res.status(200).json(tenants);
        }, 2000);
    } catch (error) {
        console.error(error);
        res.status(500).send("Error fetching tenants");
    }
});

router.post("/", async (req, res) => {
    try {
        const { firstName, lastName, address, email, phoneNumber, personalId } = req.body;

        const newTenant = {
            firstName,
            lastName,
            address,
            email,
            phoneNumber,
            personalId
        };

        const collection = db.collection("tenants");

        await collection.insertOne(newTenant);

        res.status(201).json(newTenant);
    } catch (error) {
        console.error("Error adding tenant:", error);
        res.status(500).send("Error adding tenant");
    }
});

router.delete('/:id', async(req, res) => {
    try {
        const tenantId = req.params.id;
        const collection = db.collection("tenants");
        const tenantObjectId = new ObjectId(tenantId);

        const deleteTenant = await collection.deleteOne({ _id: tenantObjectId });

        if(deleteTenant.deletedCount === 0){
            return res.status(404).send("Tenant not found");
        }else{
            return res.status(204).send();
        }
    }
    catch(error){
        console.error("Error deleting tenant:", error);
        res.status(500).send("Error deleting tenant");
    }
})

router.patch("/:id", async (req, res) => {
    try {
        const tenantId = parseInt(req.params.id);
        const updates = req.body;

        const collection = db.collection("tenants");
        const tenantObjectId = new ObjectId(tenantId);

        console.log('hejka1', tenantId, tenantObjectId);

        const updatedTenant = await collection.findOneAndUpdate(
            { _id: tenantObjectId },
            { $set: updates },
            { returnDocument: "after" }
        );

        if (!updatedTenant?.value) {
            return res.status(404).send("Tenant not found");
        }

        res.status(200).json(updatedTenant.value);
    } catch (error) {
        console.error("Error updating tenant:", error);
        res.status(500).send("Error updating tenant");
    }
});

export default router;
