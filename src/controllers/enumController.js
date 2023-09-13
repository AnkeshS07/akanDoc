const qualificationModel = require("../models/qualificationModel");
const specializationModel = require("../models/specialization");
const skillModel = require("../models/skillModel");

//========================================================================================================================//

/**
 * The below code defines several functions for creating, retrieving, updating, and deleting enums for
 * specializations, qualifications, and skills.
 */

//===========================================================================================================================//

const postSpecializationEnums = async (req, res) => {
  try {
    const { name, status, type } = req.body;
    if (!name) {
      return res.status(400).send({ status: 400, message: "name is required" });
    }
    const newSpecialization = await specializationModel.create({
      name: name,
      status: status,
      type: type,
    });

    await newSpecialization.save();

    res.status(201).json({
      status: 201,
      data: newSpecialization,
      message: "Specialization enum added successfully",
    });
  } catch (error) {
    console.error("Error adding specialization:", error);
    res.status(500).json({
      status: 500,
      data: null,
      message: "Failed to add specialization",
      error: error.message,
    });
  }
};

//===========================================================================================================================//

const getSpecializationEnum = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const query = {};
    const options = { page: parseInt(page), limit: parseInt(limit) };

    const result = await specializationModel.paginate(query, options);

    const metaData = {
      page: result.page,
      limit: result.limit,
      total: result.total,
      totalPages: result.totalPages,
      hasNextPage: result.hasNextPage,
    };

    res.status(200).json({
      status: 200,
      metaData: metaData,
      list: result.data,
      message: "Specializations retrieved successfully",
    });
  } catch (error) {
    console.error("Error retrieving specializations:", error);
    res.status(500).json({
      status: 500,
      list: null,
      message: "Failed to retrieve specializations",
    });
  }
};

//===========================================================================================================================//

const updateSpecializationEnum = async (req, res) => {
  try {
    const { name, status, type } = req.body;

    const updatedHealthEnum = await specializationModel.findByIdAndUpdate(
      req.params.id,
      { name, status, type },
      { new: true }
    );

    res.status(200).json({
      status: 200,
      data: updatedHealthEnum,
      message: "Health enum updated successfully",
    });
  } catch (error) {
    console.error("Error updating health enum:", error);
    res.status(500).json({
      status: 500,
      data: null,
      message: "Failed to update health enum",
      error: error.message,
    });
  }
};

//===========================================================================================================================//

const deleteSpecializationEnum = async (req, res) => {
  try {
    const updatedHealthEnum = await specializationModel.findByIdAndDelete(
      req.params.id
    );
    console.log(req.params._id);
    res.status(200).json({
      status: 200,
      data: {},
      message: "specialization enum deleted successfully",
    });
  } catch (error) {
    console.error("Error updating specialization enum:", error);
    res.status(500).json({
      status: 500,
      data: null,
      message: "Failed to update specialization enum",
      error: error.message,
    });
  }
};

//===========================================================================================================================//

const postQualificationEnums = async (req, res) => {
  try {
    const { name, status, type } = req.body;
    if (!name) {
      return res.status(400).send({ status: 400, message: "name is required" });
    }
    const newQualification = new qualificationModel({
      name: name,
      status: status,
      type: type,
    });

    await newQualification.save();

    res.status(201).json({
      status: 201,
      data: newQualification,
      message: "Qualification enum added successfully",
    });
  } catch (error) {
    console.error("Error adding qualification:", error);
    res.status(500).json({
      status: 500,
      data: null,
      message: "Failed to add qualification",
      error: error.message,
    });
  }
};

//===========================================================================================================================//

const getQualificationEnum = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const query = {};
    const options = { page: parseInt(page), limit: parseInt(limit) };

    const result = await qualificationModel.paginate(query, options);

    const metaData = {
      page: result.page,
      limit: result.limit,
      total: result.total,
      totalPages: result.totalPages,
      hasNextPage: result.hasNextPage,
    };

    res.status(200).json({
      status: 200,
      metaData: metaData,
      list: result.data,
      message: "Qualifications retrieved successfully",
    });
  } catch (error) {
    console.error("Error retrieving qualifications:", error);
    res.status(500).json({
      status: 500,
      list: null,
      message: "Failed to retrieve qualifications",
    });
  }
};

//===========================================================================================================================//

const updateQualificationEnum = async (req, res) => {
  try {
    const { name, status, type } = req.body;

    const updatedHealthEnum = await qualificationModel.findByIdAndUpdate(
      req.params.id,
      { name, status, type },
      { new: true }
    );
    console.log(req.params._id);
    res.status(200).json({
      status: 200,
      data: updatedHealthEnum,
      message: "Qualification enum updated successfully",
    });
  } catch (error) {
    console.error("Error updating Qualification enum:", error);
    res.status(500).json({
      status: 500,
      data: null,
      message: "Failed to update Qualification enum",
      error: error.message,
    });
  }
};

//===========================================================================================================================//

const deleteQualificationEnum = async (req, res) => {
  try {
    const updatedHealthEnum = await qualificationModel.findByIdAndDelete(
      req.params.id
    );
    console.log(req.params._id);
    res.status(200).json({
      status: 200,
      data: {},
      message: "Qualification enum deleted successfully",
    });
  } catch (error) {
    console.error("Error updating Qualification enum:", error);
    res.status(500).json({
      status: 500,
      data: null,
      message: "Failed to update Qualification enum",
      error: error.message,
    });
  }
};

//===========================================================================================================================//

const postSkillEnums = async (req, res) => {
  try {
    const { name, status, type } = req.body;
    if (!name) {
      return res.status(400).send({ status: 400, message: "name is required" });
    }
    const newSpecialization = new skillModel({
      name: name,
      status: status,
      type: type,
    });

    await newSpecialization.save();

    res.status(201).json({
      status: 201,
      data: newSpecialization,
      message: "Skill enum added successfully",
    });
  } catch (error) {
    console.error("Error adding Skill:", error);
    res.status(500).json({
      status: 500,
      data: null,
      message: "Failed to add Skill",
      error: error.message,
    });
  }
};

//===========================================================================================================================//

const getSkillEnums = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const query = {};
    const options = { page: parseInt(page), limit: parseInt(limit) };

    const result = await skillModel.paginate(query, options);

    const metaData = {
      page: result.page,
      limit: result.limit,
      total: result.total,
      totalPages: result.totalPages,
      hasNextPage: result.hasNextPage,
    };

    res.status(200).json({
      status: 200,
      metaData: metaData,
      list: result.data,
      message: "Skill retrieved successfully",
    });
  } catch (error) {
    console.error("Error retrieving SKill:", error);
    res
      .status(500)
      .json({ status: 500, list: null, message: "Failed to retrieve Skill" });
  }
};

//===========================================================================================================================//

const updateSkillEnum = async (req, res) => {
  try {
    const { name, status, type } = req.body;

    const updatedHealthEnum = await skillModel.findByIdAndUpdate(
      req.params.id,
      { name, status, type },
      { new: true }
    );
    console.log(req.params._id);
    res.status(200).json({
      status: 200,
      data: updatedHealthEnum,
      message: "skill enum updated successfully",
    });
  } catch (error) {
    console.error("Error updating skill enum:", error);
    res.status(500).json({
      status: 500,
      data: null,
      message: "Failed to update skill enum",
      error: error.message,
    });
  }
};

//===========================================================================================================================//

const deleteSkillEnum = async (req, res) => {
  try {
    const updatedHealthEnum = await skillModel.findByIdAndDelete(req.params.id);
    res.status(200).json({
      status: 200,
      data: {},
      message: "skill enum deleted successfully",
    });
  } catch (error) {
    console.error("Error updating skill enum:", error);
    res.status(500).json({
      status: 500,
      data: null,
      message: "Failed to update skill enum",
      error: error.message,
    });
  }
};

//===========================================================================================================================//

module.exports = {
  postSpecializationEnums,
  getSpecializationEnum,
  updateSpecializationEnum,
  deleteSpecializationEnum,
  postQualificationEnums,
  getQualificationEnum,
  updateQualificationEnum,
  deleteQualificationEnum,
  postSkillEnums,
  getSkillEnums,
  updateSkillEnum,
  deleteSkillEnum,
};
