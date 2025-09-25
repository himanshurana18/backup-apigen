export const ROLES = {
  SUPERADMIN: "superadmin",
  CONTENTMANAGER: "contentmanager",
  DEMO: "demo",
};

export const PERMISSIONS = {
  CREATE: "create",
  READ: "read",
  UPDATE: "update",
  DELETE: "delete",
};

// Initially empty - will be populated dynamically
export const ROUTE_ACCESS = {};

// Initially empty - will be populated dynamically
export const ROLE_PERMISSIONS = {};

// store all detected routes
export const ALL_ROUTES = new Set();

// Initialize the RBAC system
export const initializeRBAC = async () => {
  try {
    // First try to get roles from database
    const roles = await loadRolesFromDB();

    if (!roles || roles.length === 0) {
      console.warn("No roles found in database. Using default roles.");
      setupDefaultRoles();
    } else {
      roles.forEach((role) => {
        updateRBACForRole(role);
      });
    }

    if (typeof window !== "undefined") {
      await detectRoutes();
    }

    return true;
  } catch (err) {
    console.error("Error initializing RBAC:", err);
    setupDefaultRoles();
    return false;
  }
};

// ✅ Correct function syntax
export function setupDefaultRoles() {
  // clear existing data
  Object.keys(ROLE_PERMISSIONS).forEach((key) => {
    delete ROLE_PERMISSIONS[key];
  });

  Object.keys(ROUTE_ACCESS).forEach((key) => {
    delete ROUTE_ACCESS[key];
  });

  const defaultRoutes = {
    "/builder": [ROLES.SUPERADMIN, ROLES.DEMO],
    "/setting/apitokens": [ROLES.SUPERADMIN, ROLES.CONTENTMANAGER, ROLES.DEMO],
    "/setting/envdata": [ROLES.SUPERADMIN],
    "/setting/profile": [ROLES.SUPERADMIN, ROLES.CONTENTMANAGER, ROLES.DEMO],
    "/setting/overview": [ROLES.SUPERADMIN, ROLES.CONTENTMANAGER, ROLES.DEMO],
    "/setting/permission": [ROLES.SUPERADMIN],
    "/setting": [ROLES.SUPERADMIN, ROLES.CONTENTMANAGER, ROLES.DEMO],
    "/": [ROLES.SUPERADMIN, ROLES.CONTENTMANAGER, ROLES.DEMO],
    "/manager": [ROLES.SUPERADMIN, ROLES.CONTENTMANAGER, ROLES.DEMO],
    "/media": [ROLES.SUPERADMIN, ROLES.CONTENTMANAGER, ROLES.DEMO],
    "/builder/[model]": [ROLES.SUPERADMIN],
  };
  Object.keys(defaultRoutes).forEach((route) => {
    ROUTE_ACCESS[route] = [...defaultRoutes[route]];
    ALL_ROUTES.add(route);
  });
  ROLE_PERMISSIONS[ROLES.SUPERADMIN] = {
    [PERMISSIONS.CREATE]: true,
    [PERMISSIONS.READ]: true,
    [PERMISSIONS.UPDATE]: true,
    [PERMISSIONS.DELETE]: true,
    routes: ["*"], // Access to add routes
  };
  ROLE_PERMISSIONS[ROLES.CONTENTMANAGER] = {
    [PERMISSIONS.CREATE]: true,
    [PERMISSIONS.READ]: true,
    [PERMISSIONS.UPDATE]: true,
    [PERMISSIONS.DELETE]: true,
    routes: [
      "/manager",
      "/media",
      "/setting/overview",
      "/setting/apitokens",
      "/setting/profile",
      "/",
    ],
  };
  ROLE_PERMISSIONS[ROLES.DEMO] = {
    [PERMISSIONS.CREATE]: false,
    [PERMISSIONS.READ]: true,
    [PERMISSIONS.UPDATE]: false,
    [PERMISSIONS.DELETE]: false,
    routes: [
      "/manager",
      "/media",
      "/setting/overview",
      "/setting/apitokens",
      "/setting/profile",
      "/builder",
    ],
  };

  const loadRolesFromDB = async () => {
    try {
      if (typeof window === "undefined") {
        try {
          const mongoose = await import("mongoose");
          const { Role } = await import("../models/Role");

          if (!mongoose.connection.readyState) {
            const MONGODB_URI = process.env.MONGODB_URI;
            if (!MONGODB_URI) {
              return null;
            }
            await mongoose.default.connect(MONGODB_URI, {
              bufferCommands: false,
            });
          }
          return await Role.find({});
        } catch (err) {
          console.error("Server side DB connection error", err);
          return null;
        }
      } else {
        const response = await fetch("/api/roles");
        if (!response.ok) {
          throw new Error("Failed to fetch roles from API");
        }
        const data = await response.json();
        return data.success ? data.roles : [];
      }
    } catch (err) {
      console.error("Error loading roles from DB:", err);
      return null;
    }
  };

  // populate ROUTE_ACCESS
}
// Dynamically detect routes in the app
export const detectRoutes = async () => {
  try {
    // Try to get routes from NEXT.JS router (client side)
    if (typeof window !== "undefined") {
      // Find all elements with href attributes that start with "/"
      const links = document.querySelectorAll("a[href^='/']");
      links.forEach((link) => {
        const href = link.getAttribute("href");

        // Add to ALL_ROUTES if not already present
        if (href && !href.includes("#") && !href.includes("?")) {
          ALL_ROUTES.add(href);
        }

        // If not already in ROUTE_ACCESS, add with SUPERADMIN access
        if (!ROUTE_ACCESS[href]) {
          ROUTE_ACCESS[href] = [ROLES.SUPERADMIN];
        }
      });
    }
    return Array.from(ALL_ROUTES);
  } catch (error) {
    console.error("Route detection failed:", error);
    return Array.from(ALL_ROUTES);
  }
};
export const getAllRoles = async () => {
  try {
    const response = await fetch("/api/roles");
    if (!response.ok) throw new Error("Failed to fetch roles");

    const data = await response.json();
    return data.success ? data.data : [];
  } catch (err) {
    console.error("Error fetching roles:", err);

    // Return static roles as fallback
    return Object.keys(ROLES).map((key) => ({
      name: ROLES[key],
      permissions: ROLE_PERMISSIONS[ROLES[key]],
      isSystemRole: true,
    }));
  }
};
export const updateRBACFromRole = (role) => {
  if (!role.name) return false;

  // The role name in lowercase
  const roleName = role.name.toLowerCase();

  // Update the ROLES object if it doesn't exist
  let roleKey = null;
  Object.keys(ROLES).forEach((key) => {
    if (ROLES[key].toLowerCase() === roleName) {
      roleKey = ROLES[key];
    }
  });

  // if role does not exist in ROLES, add it
  if (!roleKey) {
    roleKey = roleName;
    ROLES[roleName.toUpperCase().replace(/\s+/g, "_")] = roleName;
  }
  ROLE_PERMISSIONS[roleKey] = {
    [PERMISSIONS.CREATE]: role.permissions?.create || false,
    [PERMISSIONS.READ]: role.permissions?.read || true,
    [PERMISSIONS.UPDATE]: role.permissions?.update || false,
    [PERMISSIONS.DELETE]: role.permissions?.delete || false,
  };

  // Update ROUTE_ACCESS to match the role's routes
  // First, remove this role from all routes
  Object.keys(ROUTE_ACCESS).forEach((route) => {
    ROUTE_ACCESS[route] = ROUTE_ACCESS[route].filter((r) => r !== roleKey);
  });

  // then, add the role to its permitted routes
  if (role.routes.includes("*")) {
    // If wildcard access, add to all routes
    Object.keys(ROUTE_ACCESS).forEach((route) => {
      if (!ROUTE_ACCESS[route].includes(roleKey)) {
        ROUTE_ACCESS[route].push(roleKey);
      }
    });
  } else {
    role.routes.forEach((route) => {
      ALL_ROUTES.add(route); // Ensure route is in ALL_ROUTES
      if (!ROUTE_ACCESS[route]) {
        ROUTE_ACCESS[route] = [roleKey];
      } else {
        if (!ROUTE_ACCESS[route].includes(roleKey)) {
          ROUTE_ACCESS[route].push(roleKey);
        }
      }
    });
  }

  return true;
};

export const syncRBAC = async () => {
  try {
    // First, detect any new routes
    await detectRoutes();

    // Fetch roles from the api
    const roles = await loadRolesFromDB();
    if (!roles || roles.length === 0) {
      throw new Error("No roles found in database");
    }

    // Update each role in the RBAC config
    let updatedCount = 0;
    roles.forEach((role) => {
      if (updateRBACForRole(role)) {
        updatedCount++;
      }
    });
    console.log(
      `✅ RBAC configuration updated with ${updatedCount} roles from database`
    );
    return true;
  } catch (err) {
    console.error("Error syncing RBAC:", err);
    return false;
  }
};
export const getLocalRoles = () => {};

export const hasPermission = () => {};
export const hasRouteAccess = (userRole, path) => {
  if (!userRole || !ROLE_PERMISSIONS[userRole]) return false;

  // Superadmin has access to everything
  if (userRole === ROLES.SUPERADMIN) return true;

  // check if the route is explicitly restricted
  if (ROUTE_ACCESS[path] && !ROUTE_ACCESS[path].includes(userRole)) {
    return false;
  }

  // check if the user's role has access to the route pattern
  return ROLE_PERMISSIONS[userRole].routes.some((routePattern) => {
    if (!routePattern) return true;
    const pattern = new RegExp("^" + routePattern.replace(/\*/g, ".*") + "$");
    return pattern.test(path);
  });
};
export const checkRouteAccess = (req, res, next) => {
  const session = req.session;
  if (!session || !session.user || !session.user.userRole) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const path = req.path;
  if (!hasRouteAccess(session.user.userRole, path)) {
    return res.status(403).json({ message: "Access Denied" });
  }

  next();
};

if (typeof window !== "undefined") {
  // Initialize RBAC on module load if we are in the browser

  if (
    document.readyState === "complete" ||
    document.readyState === "interactive"
  ) {
    setTimeout(initializeRBAC, 1);
  } else {
    document.addEventListener("DOMContentLoaded", initializeRBAC);
  }
} else {
  // Server side initialization can be done per request basis
  initializeRBAC();
}
