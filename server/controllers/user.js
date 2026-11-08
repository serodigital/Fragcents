import userModel from "../models/user.js";
import { hashPassword } from "../helpers/auth.js";

// Works out who is making the request and whether they may touch this user
const canAccess = async (req, targetId) => {
  const requester = await userModel.findById(req.user?._id).select("role");
  if (!requester) return false;
  const isOwner = String(requester._id) === String(targetId);
  const isAdminUser = requester.role === 1;
  return isOwner || isAdminUser;
};

// Get all users (admin only, set on the route)
export const getAllUsers = async (req, res) => {
  try {
    const users = await userModel.find({}).select("-password");
    res.status(200).json({ success: true, users });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error fetching users" });
  }
};

// Get one user (yourself, or any user if you are an admin)
export const getUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (!(await canAccess(req, id))) {
      return res.status(403).json({ success: false, message: "Not allowed" });
    }

    const user = await userModel.findById(id).select("-password");
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.status(200).json({ success: true, user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error fetching user" });
  }
};

// Update a user (yourself, or any user if you are an admin)
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, lastName, email, address, phone, password } = req.body;

    if (!(await canAccess(req, id))) {
      return res.status(403).json({ success: false, message: "Not allowed" });
    }

    const updateData = {};

    if (name !== undefined) {
      if (!String(name).trim()) {
        return res
          .status(400)
          .json({ success: false, message: "First name cannot be empty" });
      }
      updateData.name = String(name).trim();
    }

    if (lastName !== undefined) updateData.lastName = String(lastName).trim();
    if (address !== undefined) updateData.address = address;
    if (phone !== undefined) updateData.phone = phone;

    if (email) {
      const taken = await userModel.findOne({ email, _id: { $ne: id } });
      if (taken) {
        return res
          .status(400)
          .json({ success: false, message: "Email is already taken" });
      }
      updateData.email = email;
    }

    if (password) {
      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          message: "Password must be at least 6 characters long",
        });
      }
      updateData.password = await hashPassword(password);
    }

    const updatedUser = await userModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .select("-password");

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error updating user" });
  }
};
// Update a user's role (admin only, set on the route)
export const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (![0, 1, 2].includes(role)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid role value" });
    }

    const updatedUser = await userModel
      .findByIdAndUpdate(id, { role }, { new: true })
      .select("-password");

    if (!updatedUser) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.status(200).json({
      success: true,
      message: "User role updated",
      user: updatedUser,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "Error updating user role" });
  }
};

// Delete a user (admin only, set on the route)
export const deleteUser = async (req, res) => {
  try {
    await userModel.findByIdAndDelete(req.params.id);
    res
      .status(200)
      .json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error deleting user" });
  }
};
