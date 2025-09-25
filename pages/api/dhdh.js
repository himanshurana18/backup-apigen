import { dbConnect } from "@/lib/dbConnect";
import { Dhdh } from "@/models/Dhdh";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { PERMISSIONS, hasPermission } from "@/lib/rbac";
import { withDynamicModels, getModelForApi } from "@/lib/apiUtils";



const checkAuth = async (req, res) => {
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    res.status(401).json({ message: "Unauthorized" });
    return false;
  }
  return session;
};

async function handler(req, res) {
  await dbConnect();
  const { method } = req;
  const session = await checkAuth(req, res);
  if (!session) return;

  // Get the Dhdh model dynamically to ensure schema is up-to-date
  const Dhdh = await getModelForApi('dhdh');

  if (method === "POST") {
    if (!hasPermission(session.user.userRole, PERMISSIONS.CREATE)) {
      return res.status(403).json({ message: "Permission denied" });
    }

    const { djdj, user, seoTitle, seoDescription, focusKeywords, canonicalUrl, metaRobots, openGraphTitle, openGraphDescription } = req.body;
    
    const dataDoc = await Dhdh.create({
      djdj, user, 
      
      seoTitle, 
      seoDescription, 
      focusKeywords, 
      canonicalUrl, 
      metaRobots, 
      openGraphTitle, 
      openGraphDescription,
      user: session.user.id
    });
    
    res.json(dataDoc);
  }

  if (method === "GET") {
    if (!hasPermission(session.user.userRole, PERMISSIONS.READ)) {
      return res.status(403).json({ message: "Permission denied" });
    }

    const { id, page = 1, limit = 10, search } = req.query;
    if (id) {
      const item = await Dhdh.findById(id);
      if (!item) {
        return res.status(404).json({ message: "Item not found" });
      }
     
      return res.json(item);
    }

    const query = {};
    
    // Add search functionality
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      const searchableFields = ['djdj'];
      query.$or = searchableFields.map(field => ({
        [field]: searchRegex
      }));
    }

    const total = await Dhdh.countDocuments(query);
    const items = await Dhdh.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({ total, page: parseInt(page), limit: parseInt(limit), items });
  }

  if (method === "PUT") {
    if (!hasPermission(session.user.userRole, PERMISSIONS.UPDATE)) {
      return res.status(403).json({ message: "Permission denied" });
    }

    const { _id, djdj, user, seoTitle, seoDescription, focusKeywords, canonicalUrl, metaRobots, openGraphTitle, openGraphDescription } = req.body;
    
    // Check if item exists and user has permission
    const existingItem = await Dhdh.findById(_id);
    if (!existingItem) {
      return res.status(404).json({ message: "Item not found" });
    }
 
    
    
    await Dhdh.updateOne({ _id }, {
      djdj, user, 
      
      seoTitle, 
      seoDescription, 
      focusKeywords, 
      canonicalUrl, 
      metaRobots, 
      openGraphTitle, 
      openGraphDescription
    });
    res.json(true);
  }

  if (method === "DELETE") {
    if (!hasPermission(session.user.userRole, PERMISSIONS.DELETE)) {
      return res.status(403).json({ message: "Permission denied" });
    }

    if (req.query?.id) {
      // Check if item exists and user has permission
      const item = await Dhdh.findById(req.query.id);
      if (!item) {
        return res.status(404).json({ message: "Item not found" });
      }

      // Prevent deleting the last superadmin
      if (item.userRole === 'superadmin') {
        const superadminCount = await Dhdh.countDocuments({ userRole: 'superadmin' });
        if (superadminCount <= 1) {
          return res.status(409).json({ message: "Cannot delete the last superadmin user" });
        }
      }
 
      
      await Dhdh.deleteOne({ _id: req.query.id });
      res.json(true);
    }
  }
}

// Wrap handler with dynamic model support
export default withDynamicModels(handler);