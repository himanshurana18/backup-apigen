import { dbConnect } from "./dbConnect";
import APIToken from "@/models/APIToken";

export async function verifyApiToken(req, res) {
  try {
    await dbConnect();
    
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Missing or invalid authorization header' });
      return null;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    const apiToken = await APIToken.findOne({ 
      token, 
      isActive: true 
    });

    if (!apiToken) {
      res.status(401).json({ error: 'Invalid or inactive API token' });
      return null;
    }

    // Check if token has expired
    if (apiToken.expiresAt && new Date() > apiToken.expiresAt) {
      res.status(401).json({ error: 'API token has expired' });
      return null;
    }

    return {
      tokenType: apiToken.tokenType,
      tokenId: apiToken._id
    };
  } catch (error) {
    console.error('Error verifying API token:', error);
    res.status(500).json({ error: 'Internal server error' });
    return null;
  }
}