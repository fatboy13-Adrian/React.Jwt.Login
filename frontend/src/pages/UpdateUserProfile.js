import React, { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import axios from "axios";
import Button from "../components/Button";
import TextField from "../components/TextField";
import SelectRole from "../components/SelectRole";
import "../styles/UpdateUserProfile.css";

export default function UpdateUserProfile() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const { token, currentUserId, currentUserRole } = location.state || {};

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    phone: "",
    address: "",
    password: "",
    role: "",
  });

  const [originalData, setOriginalData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const isAdmin = currentUserRole === "ADMIN" || currentUserRole === "ROLE_ADMIN";
  const isSelf = Number(userId) === currentUserId;
  const canEdit = isAdmin || isSelf;
  const canEditRole = isAdmin;

  useEffect(() => {
    if (!token) {
      alert("Please log in to access this page.");
      navigate("/login");
      return;
    }

    if (!canEdit) {
      alert("You are not authorized to update this profile.");
      navigate("/");
      return;
    }

    const fetchUser = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:8080/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const userData = { ...response.data, password: "" };
        setFormData(userData);
        setOriginalData(userData);
        setError("");
      } catch {
        setError("Failed to load user data.");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId, token, canEdit, navigate]);

  const handleChange = (e) => {
    if (!canEdit) return;

    const { name, value } = e.target;

    if (name === "role" && !canEditRole) return;

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Return only fields that have changed AND are not empty strings (except password which can be empty to mean no change)
  const getChangedFields = () => {
    if (!originalData) return {};

    const changed = {};

    Object.entries(formData).forEach(([key, value]) => {
      if (key === "password") {
        // Only include password if non-empty (means user wants to update password)
        if (value.trim() !== "") changed[key] = value;
        return;
      }

      if (key === "role" && !canEditRole) return;

      // Include if changed and value is not empty string (optional fields can be empty)
      if (value !== originalData[key]) {
        changed[key] = value;
      }
    });

    return changed;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!canEdit) {
      alert("You do not have permission to update this user.");
      return;
    }

    if (!token) {
      alert("Your session expired. Please log in again.");
      navigate("/login");
      return;
    }

    const updates = getChangedFields();

    if (Object.keys(updates).length === 0) {
      alert("No changes detected.");
      return;
    }

    try {
      await axios.patch(`http://localhost:8080/users/${userId}`, updates, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert("User updated successfully.");

      // Update original data so form stays in sync
      setOriginalData((prev) => ({
        ...prev,
        ...updates,
        password: "", // clear password locally after update
      }));

      // Clear password field in form
      setFormData((prev) => ({ ...prev, password: "" }));

      if (isSelf) navigate("/");
      else navigate("/dashboard");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update user.");
    }
  };

  if (loading) return <p>Loading user data...</p>;
  if (error) return <p className="error-message">{error}</p>;

  return (
    <div className="container form-wrapper">
      <h2 className="dashboard-title">Update User Profile</h2>

      <form onSubmit={handleSubmit} className="register-form" noValidate>
        <TextField
          id="firstName"
          name="firstName"
          label="First Name"
          value={formData.firstName}
          onChange={handleChange}
          disabled={!canEdit}
        />

        <TextField
          id="lastName"
          name="lastName"
          label="Last Name"
          value={formData.lastName}
          onChange={handleChange}
          disabled={!canEdit}
        />

        <TextField
          id="username"
          name="username"
          label="Username"
          value={formData.username}
          onChange={handleChange}
          disabled={!canEdit}
        />

        <TextField
          id="email"
          name="email"
          label="Email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          disabled={!canEdit}
        />

        <TextField
          id="phone"
          name="phone"
          label="Phone"
          value={formData.phone}
          onChange={handleChange}
          disabled={!canEdit}
        />

        <TextField
          id="address"
          name="address"
          label="Address"
          value={formData.address}
          onChange={handleChange}
          disabled={!canEdit}
        />

        <TextField
          id="password"
          name="password"
          label="Password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Leave blank to keep current password"
          disabled={!canEdit}
        />

        {canEditRole && (
          <SelectRole
            id="role"
            name="role"
            value={formData.role}
            onChange={handleChange}
            aria-label="Select Role"
            className="form-select"
          />
        )}

        <div className="form-actions">
          <Button type="submit" className="action-button" disabled={!canEdit}>
            Update
          </Button>
          <Button
            type="button"
            className="action-button"
            onClick={() => navigate(isSelf ? "/" : "/dashboard")}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}