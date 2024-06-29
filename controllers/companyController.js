// companyController.js
const { createCompanyTable, saveCompany } = require("../models/company");
const { client } = require("../db/index.js");
const analytics = require('../segment/segmentConfig');
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const { sendErrorResponse } = require("../utils/res_error");

// Helper function to validate company input
const validateCompanyInput = (name, website, isActive, stripeCustomerId, planId, job_title, company_size) => {
  if (!name || typeof name !== 'string' || name.trim() === '') {
    return "Invalid or missing 'company name'";
  }
  if (website && (typeof website !== 'string' || !website.match(/^(https?:\/\/)?([\w\d\-]+\.){1,}\w{2,}(\/[\w\d#?&%=]*)?$/))) {
    return "Invalid 'website' URL";
  }
  if (isActive !== undefined && typeof isActive !== 'boolean') {
    return "'isActive' should be a boolean";
  }
  if (stripeCustomerId && (typeof stripeCustomerId !== 'string' || stripeCustomerId.trim() === '')) {
    return "Invalid 'stripeCustomerId'";
  }
  if (planId && (typeof planId !== 'string' || planId.trim() === '')) {
    return "Invalid 'planId'";
  }
  if (job_title && (typeof job_title !== 'string' || job_title.trim() === '')) {
    return "Invalid 'job_title'";
  }
  if (company_size && (typeof company_size !== 'string' || company_size.trim() === '')) {
    return "Invalid 'company_size'";
  }

  // Optional: Check for maximum length constraints
  const MAX_NAME_LENGTH = 255;
  const MAX_WEBSITE_LENGTH = 255;
  const MAX_STRIPE_ID_LENGTH = 255;
  const MAX_PLAN_ID_LENGTH = 255;

  if (name.length > MAX_NAME_LENGTH) {
    return `'company name' exceeds maximum length of ${MAX_NAME_LENGTH} characters`;
  }
  if (website && website.length > MAX_WEBSITE_LENGTH) {
    return `'website' exceeds maximum length of ${MAX_WEBSITE_LENGTH} characters`;
  }
  if (stripeCustomerId && stripeCustomerId.length > MAX_STRIPE_ID_LENGTH) {
    return `'stripeCustomerId' exceeds maximum length of ${MAX_STRIPE_ID_LENGTH} characters`;
  }
  if (planId && planId.length > MAX_PLAN_ID_LENGTH) {
    return `'planId' exceeds maximum length of ${MAX_PLAN_ID_LENGTH} characters`;
  }

  return null;
};

// Get all companies
const getAllCompany = catchAsyncErrors(async (req, res) => {
  await createCompanyTable();

  // Check if req.user and req.user.id are defined
  if (!req.user || !req.user.id) {
    console.error("User ID is missing in the request");
    return res.status(400).json({ error: "User ID is missing in the request" });
  }

  const companyResult = await client.query(`
    SELECT companies.*, "users".id as created_by, "users".first_name as created_by_user
    FROM companies
    LEFT JOIN "users" ON companies.created_by = "users".id
  `);

  if (companyResult.rows.length === 0) {
    return sendErrorResponse(res, 404, "No companies found");
  }

  analytics.track({
    userId: String(req.user?.id || 'anonymous'),
    event: 'Viewed All Companies',
    properties: {
      viewedAt: new Date().toISOString(),
      companyCount: companyResult.rows.length,
    }
  });

  res.status(200).json(companyResult.rows);
});

// Get all companies of a specific user
// const getAllCompaniesOfUser = catchAsyncErrors(async (req, res) => {
//   await createCompanyTable();

//   // Check if req.user and req.user.id are defined
//   if (!req.user || !req.user.id) {
//     console.error("User ID is missing in the request");
//     return res.status(400).json({ error: "User ID is missing in the request" });
//   }

//   const userId = req.user.id;

//   const userCompanies = await client.query('SELECT * FROM companies WHERE created_by = $1', [userId]);

//   analytics.track({
//     userId: String(userId),
//     event: 'User Viewed Their Companies',
//     properties: {
//       viewedAt: new Date().toISOString(),
//       companyCount: userCompanies.rows.length,
//     }
//   });

//   res.status(200).json(userCompanies.rows);
// });

// Get all companies of a specific user
const getAllCompaniesOfUser = catchAsyncErrors(async (req, res) => {
  await createCompanyTable();

  // Check if req.user and req.user.id are defined
  if (!req.user || !req.user.id) {
    console.error("User ID is missing in the request");
    return res.status(400).json({ error: "User ID is missing in the request" });
  }

  const userId = req.user.id;

  const query = `
    SELECT companies.id, companies.name, companies.website, companies.created_date, companies.updated_date, 
           companies.is_active, companies.stripe_customer_id, companies.plan_id,
           company_size.size_range AS company_size, job_titles.title AS job_title
    FROM companies
    LEFT JOIN company_size ON companies.company_size_id = company_size.id
    LEFT JOIN job_titles ON companies.job_title_id = job_titles.id
    WHERE companies.created_by = $1
  `;

  const userCompanies = await client.query(query, [userId]);

  analytics.track({
    userId: String(userId),
    event: 'User Viewed Their Companies',
    properties: {
      viewedAt: new Date().toISOString(),
      companyCount: userCompanies.rows.length,
    }
  });

  res.status(200).json(userCompanies.rows);
});


// Helper function to find job role ID by name
// const findJobTitle = async (name) => {
//   try {
//     const result = await client.query('SELECT id FROM job_titles WHERE title = $1', [name]);
//     if (result.rowCount > 0) {
//       return result.rows[0].id;
//     } else {
//       throw new Error('Invalid Job Title');
//     }
//   } catch (error) {
//     throw error;
//   }
// };

// const findOrCreateJobTitle = async (name) => {
//   try {
//     const result = await client.query('SELECT id FROM job_titles WHERE title = $1', [name]);
//     if (result.rowCount > 0) {
//       return result.rows[0].id;
//     } else {
//       const insertResult = await client.query(
//         'INSERT INTO job_titles (title) VALUES ($1) RETURNING id',
//         [name]
//       );
//       return insertResult.rows[0].id;
//     }
//   } catch (error) {
//     throw error;
//   }
// };
const findOrCreateJobTitle = async (name) => {
  try {
    // Check if the job title exists with custom = false
    const result = await client.query('SELECT id FROM job_titles WHERE title = $1 AND custom = false', [name]);
    if (result.rowCount > 0) {
      return result.rows[0].id;
    } else {
      // Insert the new custom job title
      const insertResult = await client.query(
        'INSERT INTO job_titles (title, custom) VALUES ($1, $2) RETURNING id',
        [name, true]
      );
      return insertResult.rows[0].id;
    }
  } catch (error) {
    throw error;
  }
};


// Helper function to find company size ID by name
const findCompanySize = async (name) => {
  try {
    const result = await client.query('SELECT id FROM company_size WHERE size_range = $1', [name]);
    if (result.rowCount > 0) {
      return result.rows[0].id;
    } else {
      throw new Error('Invalid Company Size');
    }
  } catch (error) {
    throw error;
  }
};

// Create company
const createCompany = catchAsyncErrors(async (req, res) => {
  await createCompanyTable();

  // Check if req.user and req.user.id are defined
  if (!req.user || !req.user.id ) {
    console.error("User ID is missing in the request");
    return res.status(400).json({ error: "User ID is missing in the request" });
  }

  const userId = req.user.id;
  const { name, website, isActive, stripeCustomerId, planId, job_title, company_size } = req.body;

  // Validate company input
  const validationError = validateCompanyInput(name, website, isActive, stripeCustomerId, planId, job_title, company_size);
  if (validationError) {
    return sendErrorResponse(res, 400, validationError);
  }

  const jobRoleId = await findOrCreateJobTitle(job_title);
    const companySizeId = await findCompanySize(company_size);

  // const existingCompany = await client.query('SELECT * FROM companies WHERE name = $1', [name]);
  // if (existingCompany.rows.length > 0) {
  //   return sendErrorResponse(res, 400, "company name already taken");
  // }

  const companyData = {
    name,
    website,
    created_by: userId,
    isActive,
    stripeCustomerId,
    planId,
    job_title_id: jobRoleId,
    company_size_id: companySizeId,
  };

  const newCompany = await saveCompany(companyData);

  analytics.identify({
    userId: String(userId),
    traits: {
      name: newCompany.name,
      website: newCompany.website,
      createdBy: newCompany.created_by,
      isActive: newCompany.is_active,
      stripeCustomerId: newCompany.stripe_customer_id,
      planId: newCompany.plan_id,
      job_title: newCompany.job_title_id,
      company_size: newCompany.company_size_id,
    }
  });

  analytics.track({
    userId: String(userId),
    event: 'Company Created',
    properties: {
      companyName: newCompany.name,
      createdBy: newCompany.created_by,
      isActive: newCompany.is_active,
      createdAt: new Date().toISOString(),
    }
  });

  res.status(201).json({
    success: true,
    message: "Company created successfully",
    company: newCompany,
    userId: userId
  });
});

// Update company
const updateCompany = catchAsyncErrors(async (req, res) => {
  const companyId = req.params.id;
  const { name, website, isActive, stripeCustomerId, planId, job_title, company_size } = req.body;

  // Check if req.user and req.user.id are defined
  if (!req.user || !req.user.id) {
    console.error("User ID is missing in the request");
    return res.status(400).json({ error: "User ID is missing in the request" });
  }

  const validationError = validateCompanyInput(name);
  if (validationError) {
    return sendErrorResponse(res, 400, validationError);
  }

  const existingCompany = await client.query('SELECT * FROM companies WHERE id = $1', [companyId]);
  if (existingCompany.rows.length === 0) {
    return sendErrorResponse(res, 404, "Company not found");
  }

  let jobRoleId;
  let companySizeId;
  if(job_title && company_size){
    jobRoleId = await findOrCreateJobTitle(job_title);
     companySizeId = await findCompanySize(company_size);
  }

  // const duplicateCompany = await client.query('SELECT * FROM companies WHERE name = $1 AND id != $2', [name, companyId]);
  // if (duplicateCompany.rows.length > 0) {
  //   return sendErrorResponse(res, 400, "Another company with this name already exists");
  // }

  const updatedCompanyData = {
    name,
    website: website || existingCompany.rows[0].website,
    isActive: isActive !== undefined ? isActive : existingCompany.rows[0].is_active,
    stripeCustomerId: stripeCustomerId || existingCompany.rows[0].stripe_customer_id,
    planId: planId || existingCompany.rows[0].plan_id,
    job_title_id: jobRoleId || existingCompany.rows[0].job_title_id,
    company_size_id: companySizeId || existingCompany.rows[0].company_size_id,
  };

  await client.query(
    'UPDATE companies SET name = $1, website = $2, is_active = $3, stripe_customer_id = $4, plan_id = $5, job_title_id = $6, company_size_id = $7 WHERE id = $8',
    [updatedCompanyData.name, updatedCompanyData.website, updatedCompanyData.isActive, updatedCompanyData.stripeCustomerId, updatedCompanyData.planId,updatedCompanyData.job_title_id,
      updatedCompanyData.company_size_id, companyId]
  );

  analytics.identify({
    userId: String(companyId),
    traits: {
      name: updatedCompanyData.name,
      website: updatedCompanyData.website,
      isActive: updatedCompanyData.isActive,
      stripeCustomerId: updatedCompanyData.stripeCustomerId,
      planId: updatedCompanyData.planId,
      job_title: updatedCompanyData.job_title_id,
      company_size: updatedCompanyData.company_size_id,
    }
  });

  analytics.track({
    userId: String(companyId),
    event: 'Company Updated',
    properties: {
      companyName: updatedCompanyData.name,
      updatedAt: new Date().toISOString(),
    }
  });

  res.status(200).json({ success: true, message: "Company updated successfully" });
});

// Delete company
const deleteCompany = catchAsyncErrors(async (req, res) => {
  const companyId = req.params.id;

  // Check if req.user and req.user.id are defined
  if (!req.user || !req.user.id) {
    console.error("User ID is missing in the request");
    return res.status(400).json({ error: "User ID is missing in the request" });
  }

  const existingCompany = await client.query('SELECT * FROM companies WHERE id = $1', [companyId]);
  if (existingCompany.rows.length === 0) {
    return sendErrorResponse(res, 404, "Company not found");
  }

  await client.query('BEGIN');

  try {
    // await client.query('DELETE FROM assessments WHERE company_id = $1', [companyId]);
    // await client.query('DELETE FROM tests WHERE company_id = $1', [companyId]);
    await client.query('DELETE FROM companies WHERE id = $1', [companyId]);
    await client.query('COMMIT');

    analytics.track({
      userId: String(companyId),
      event: 'Company Deleted',
      properties: {
        deletedAt: new Date().toISOString(),
      }
    });

    res.status(200).json({ success: true, message: "Company deleted successfully" });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Error deleting company:", error.message);
    res.status(500).json({ error: "Error deleting company", error: error.message });
  }
});

module.exports = { getAllCompany, createCompany, getAllCompaniesOfUser, updateCompany, deleteCompany };
