/**
 * Validator for Hospital Profile Update payload.
 */
function validateHospitalProfileUpdate(req, res, next) {
  const { name, address, numberOfBeds, contactNumber } = req.body;
  const errors = {};

  if (name !== undefined) {
    if (typeof name !== "string" || name.trim() === "") {
      errors.name = "Name must be a non-empty string.";
    }
  }

  if (address !== undefined) {
    if (typeof address !== "string") {
      errors.address = "Address must be a string.";
    }
  }

  if (numberOfBeds !== undefined) {
    if (typeof numberOfBeds !== "number" || numberOfBeds < 0) {
      errors.numberOfBeds = "Number of beds must be a non-negative number.";
    }
  }

  if (contactNumber !== undefined) {
    if (typeof contactNumber !== "string") {
      errors.contactNumber = "Contact number must be a string.";
    }
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ message: "Validation failed", errors });
  }

  next();
}

/**
 * Validator for Hospital Settings Update payload.
 */
function validateHospitalSettingsUpdate(req, res, next) {
  const { settings } = req.body;
  const errors = {};

  if (settings === undefined || typeof settings !== "object" || settings === null) {
    errors.settings = "Settings object is required.";
  } else {
    const { notificationPreferences, theme, marketingEmails } = settings;

    if (notificationPreferences !== undefined) {
      if (typeof notificationPreferences !== "object" || notificationPreferences === null) {
        errors.notificationPreferences = "Notification preferences must be an object.";
      } else {
        const { email, sms, app } = notificationPreferences;
        if (email !== undefined && typeof email !== "boolean") {
          errors["notificationPreferences.email"] = "Email preference must be a boolean.";
        }
        if (sms !== undefined && typeof sms !== "boolean") {
          errors["notificationPreferences.sms"] = "SMS preference must be a boolean.";
        }
        if (app !== undefined && typeof app !== "boolean") {
          errors["notificationPreferences.app"] = "App preference must be a boolean.";
        }
      }
    }

    if (theme !== undefined) {
      if (typeof theme !== "string" || !["light", "dark"].includes(theme)) {
        errors.theme = "Theme must be either 'light' or 'dark'.";
      }
    }

    if (marketingEmails !== undefined) {
      if (typeof marketingEmails !== "boolean") {
        errors.marketingEmails = "Marketing emails must be a boolean.";
      }
    }
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ message: "Validation failed", errors });
  }

  next();
}

module.exports = {
  validateHospitalProfileUpdate,
  validateHospitalSettingsUpdate,
};
