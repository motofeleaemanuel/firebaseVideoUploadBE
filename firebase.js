const { initializeApp, cert } = require("firebase-admin/app");
const { storage } = require("firebase-admin");
const { getFirestore } = require("firebase-admin/firestore");
const serviceAccount = require("./credentials.json");
const functions = require("firebase-functions");
const dotenv = require("dotenv");
dotenv.config();

initializeApp({
  credential: cert(serviceAccount),
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
});

const db = getFirestore();
const bucket = storage().bucket();

module.exports = { db, bucket, functions };
