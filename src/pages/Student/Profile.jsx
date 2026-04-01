import React, { useState, useEffect, useRef } from 'react';
import { User, Mail, Tag, Save, Camera } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { useToast } from '../../components/ui/Toast';
import Loader from '../../components/ui/Loader';
import './Profile.css';

const BASE_URL = "https://careerintel-w10f.onrender.com";

const Profile = () => {
    const toast = useToast();
    const fileInputRef = useRef(null);

    // Initialize with empty array to avoid flashing
    const [skills, setSkills] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [selectedSkill, setSelectedSkill] = useState(null);
    const [profileImage, setProfileImage] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);

    const [formData, setFormData] = useState({
        first_name: "",
        last_name: "",
        email: ""
    });

    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});

    // Validate single field
    const validateField = (name, value) => {
        if (name === "first_name" && !value?.trim()) {
            return "First name is required";
        }
        if (name === "email") {
            if (!value?.trim()) return "Email is required";

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) return "Invalid email format";
        }
        return "";
    };

    // Validate all form fields
    const validate = () => {
        const errors = {};

        if (!formData.first_name?.trim()) {
            errors.first_name = "First name is required";
        }

        if (!formData.email?.trim()) {
            errors.email = "Email is required";
        }

        return errors;
    };

    // FETCH USER DATA
    const fetchData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");

            const userRes = await fetch(
                "https://careerintel-w10f.onrender.com/user/profile",
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            const userData = await userRes.json();

            setUser(userData);

            setFormData({
                first_name: userData.first_name || "",
                last_name: userData.last_name || "",
                email: userData.email || ""
            });

            if (userData.profile_image) {
                const fullUrl = userData.profile_image.startsWith("http")
                    ? userData.profile_image
                    : `${BASE_URL}${userData.profile_image}`;
                setProfileImage(fullUrl);
            }

            const skillsRes = await fetch(
                "https://careerintel-w10f.onrender.com/skills",
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            const skillsData = await skillsRes.json();
            setSkills(skillsData || []);

        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        const handleFocus = () => {
            fetchData();
        };

        window.addEventListener("focus", handleFocus);

        return () => {
            window.removeEventListener("focus", handleFocus);
        };
    }, []);



    // HANDLE INPUT CHANGE
    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Real-time validation
        const error = validateField(name, value);
        setErrors(prev => ({
            ...prev,
            [name]: error
        }));
    };

    // Handle field blur - validate on blur
    const handleBlur = (e) => {
        const { name, value } = e.target;

        setTouched(prev => ({
            ...prev,
            [name]: true
        }));

        // Validate on blur
        const error = validateField(name, value);
        setErrors(prev => ({
            ...prev,
            [name]: error
        }));
    };

    // Check if form is valid
    const isFormValid =
        formData.first_name?.trim() &&
        formData.email?.trim() &&
        !errors.first_name &&
        !errors.email;

    // SAVE PROFILE TO DATABASE
    const handleSave = async () => {
        // Validate form
        const validationErrors = validate();
        setErrors(validationErrors);

        if (Object.keys(validationErrors).length > 0) {
            return;
        }

        try {
            const payload = {
                first_name: formData.first_name.trim(),
                last_name: formData.last_name?.trim() || "",
                email: formData.email.trim()
            };

            const res = await fetch("https://careerintel-w10f.onrender.com/user/update", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                },
                body: JSON.stringify(payload)
            });

            const data = await res.json();

            if (!res.ok) {
                toast.error(data.detail || "Failed to update profile");
                return;
            }

            localStorage.setItem("token", data.access_token);
            toast.success(data.message || "Profile updated successfully");

            // Clear errors on success
            setErrors({});

            // Refetch user data to ensure consistency
            await fetchData();

        } catch (err) {
            console.error(err);
            toast.error("Failed to update profile");
        }
    };

    const searchSkills = async (query) => {
        if (!query) {
            setSuggestions([]);
            return;
        }

        try {
            const res = await fetch(
                `https://careerintel-w10f.onrender.com/skills/search?query=${query}`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`
                    }
                }
            );

            const data = await res.json();
            setSuggestions(data);
        } catch (err) {
            console.error("Search failed", err);
        }
    };

    // SKILLS
    const addSkill = async (e) => {
        e.preventDefault();

        if (!selectedSkill) {
            toast.error("Please select a skill from dropdown");
            return;
        }

        try {
            const res = await fetch(
                "https://careerintel-w10f.onrender.com/skills/add",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${localStorage.getItem("token")}`
                    },
                    body: JSON.stringify({
                        skill_id: selectedSkill.id
                    })
                }
            );

            if (!res.ok) {
                const data = await res.json();
                toast.error(data.detail);
                return;
            }

            const newSkills = [...skills, selectedSkill.name];
            setSkills(newSkills);
            localStorage.setItem("user_skills", JSON.stringify(newSkills));
            setSearchQuery("");
            setSelectedSkill(null);
            toast.success("Skill added successfully");

        } catch (err) {
            console.error(err);
        }
    };

    const removeSkill = async (skillToRemove) => {

        await fetch(`https://careerintel-w10f.onrender.com/skills/remove?name=${skillToRemove}`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`
            }
        });

        const newSkills = skills.filter(skill => skill !== skillToRemove);
        setSkills(newSkills);
        localStorage.setItem("user_skills", JSON.stringify(newSkills));
    };

    // PHOTO UPLOAD HANDLERS
    const handlePhotoClick = () => {
        fileInputRef.current?.click();
    };

    const handlePhotoChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            toast.error("Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed");
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error("File too large. Maximum size is 5MB");
            return;
        }

        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append("file", file);

            const token = localStorage.getItem("token");
            const res = await fetch("https://careerintel-w10f.onrender.com/user/upload-photo", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`
                },
                body: formData
            });

            const data = await res.json();

            if (!res.ok) {
                toast.error(data.detail || "Failed to upload photo");
                return;
            }

            // Update UI with new image - ensure full URL
            const imageUrl = (data.image_url || data.profile_image);
            const fullUrl = imageUrl.startsWith("http")
                ? imageUrl
                : `${BASE_URL}${imageUrl}`;
            setProfileImage(fullUrl);
            localStorage.setItem("profile_image", fullUrl);

            // Also update user in localStorage
            const storedUser = localStorage.getItem("user");
            if (storedUser) {
                const userData = JSON.parse(storedUser);
                userData.profile_image = fullUrl;
                localStorage.setItem("user", JSON.stringify(userData));
            }

            toast.success("Profile photo updated successfully");

        } catch (err) {
            console.error("Upload error:", err);
            toast.error("Failed to upload photo");
        } finally {
            setIsUploading(false);
            // Reset input
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    // Show loader while fetching initial data
    if (loading) {
        return (
            <div className="profile-page">
                <div className="page-header">
                    <h1 className="page-title">Personal Profile</h1>
                    <p className="page-subtitle">Manage your information and career preferences.</p>
                </div>
                <Loader message="Loading profile..." size="lg" />
            </div>
        );
    }

    // Get initials for fallback avatar
    const getInitials = () => {
        const first = formData.first_name?.charAt(0) || "";
        const last = formData.last_name?.charAt(0) || "";
        return first + last;
    };

    // Profile status logic
    const hasSkills = skills.length > 0;
    const hasTargetRole = !!user?.target_role;

    const getProfileStatus = () => {
        if (!hasSkills) return "Incomplete";
        if (hasSkills && !hasTargetRole) return "In Progress";
        return "Complete";
    };

    const targetRole = user?.target_role || "Not Set";
    const profileStatus = getProfileStatus();

    return (
        <div className="profile-page">

            <div className="page-header">
                <h1 className="page-title">Personal Profile</h1>
                <p className="page-subtitle">Manage your information and career preferences.</p>
            </div>

            <div className="profile-grid">

                {/* LEFT PANEL */}
                <div className="profile-left">
                    <Card className="profile-photo-card">

                        <div className="profile-photo-wrapper">
                            <div className="profile-photo" onClick={handlePhotoClick} style={{ cursor: 'pointer' }}>
                                {profileImage ? (
                                    <img
                                        src={profileImage}
                                        alt="Profile"
                                        style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                                        onError={(e) => {
                                            // Fallback to initials if image fails
                                            e.target.style.display = 'none';
                                            e.target.nextSibling?.classList.remove('hidden');
                                        }}
                                    />
                                ) : (
                                    <span className="avatar-initials">{getInitials()}</span>
                                )}
                                <div className="photo-overlay">
                                    <Camera size={20} />
                                </div>
                            </div>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handlePhotoChange}
                                accept="image/jpeg,image/png,image/gif,image/webp"
                                style={{ display: 'none' }}
                            />
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handlePhotoClick}
                                disabled={isUploading}
                            >
                                {isUploading ? "Uploading..." : "Change Photo"}
                            </Button>
                        </div>

                        <div className="profile-status">
                            <h3>{formData.first_name} {formData.last_name}</h3>
                            <p>Student</p>
                            <div className="badge success">Active Learner</div>
                        </div>

                    </Card>

                    <Card title="Quick Stats" className="mt-6">
                        <div className="profile-stats">

                            <div className="profile-stat-item">
                                <span className="ps-label">Skills</span>
                                <span className="ps-value">{skills.length}</span>
                            </div>

                            <div className="profile-stat-item">
                                <span className="ps-label">Target Role</span>
                                <span className="ps-value">{targetRole}</span>
                            </div>

                            {!hasTargetRole && (
                                <div className="profile-stat-action">
                                    <Button size="sm" onClick={() => window.location.href = "/career-recommendations"}>
                                        Set Target Role
                                    </Button>
                                </div>
                            )}

                            <div className="profile-stat-item">
                                <span className="ps-label">Profile Status</span>
                                <span className="ps-value">{profileStatus}</span>
                            </div>

                        </div>
                    </Card>
                </div>

                {/* RIGHT PANEL */}
                <div className="profile-right">
                    <Card title="Basic Information">

                        <form className="profile-form" onSubmit={(e)=>e.preventDefault()} noValidate>

                            <div className="form-row">

                                <div className="form-group">
                                    <label><User size={16}/> First Name</label>
                                    <input
                                        name="first_name"
                                        value={formData.first_name}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        className={errors.first_name && touched.first_name ? "input-error" : ""}
                                    />
                                    {errors.first_name && touched.first_name && <span className="error-text">{errors.first_name}</span>}
                                </div>

                                <div className="form-group">
                                    <label><User size={16}/> Last Name</label>
                                    <input
                                        name="last_name"
                                        value={formData.last_name}
                                        onChange={handleChange}
                                    />
                                </div>

                            </div>

                            <div className="form-group">
                                <label><Mail size={16}/> Email</label>
                                <input
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    className={errors.email && touched.email ? "input-error" : ""}
                                />
                                {errors.email && touched.email && <span className="error-text">{errors.email}</span>}
                            </div>

                            <div className="section-divider"></div>

                            {/* SKILLS */}
                            <div className="form-group">
                                <label><Tag size={16}/> Skills</label>

                                <div className="tag-input-container">

                                    <div className="tags-wrapper">
                                        {skills.map(skill => (
                                            <span key={skill} className="skill-tag">
                                                {skill}
                                                <button type="button" onClick={()=>removeSkill(skill)}>&times;</button>
                                            </span>
                                        ))}
                                    </div>

                                    <div className="tag-add-row">
                                        <div className="skill-search-wrapper">

                                            <input
                                                placeholder="Search skill..."
                                                value={searchQuery}
                                                onChange={(e) => {
                                                    const value = e.target.value;
                                                    setSearchQuery(value);
                                                    searchSkills(value);
                                                    setSelectedSkill(null);
                                                }}
                                            />

                                            {suggestions.length > 0 && (
                                                <div className="skill-dropdown">
                                                    {suggestions.map(skill => (
                                                        <div
                                                            key={skill.id}
                                                            className="skill-option"
                                                            onClick={() => {
                                                                setSelectedSkill(skill);
                                                                setSearchQuery(skill.name);
                                                                setSuggestions([]);
                                                            }}
                                                        >
                                                            {skill.name}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                        </div>

                                        <Button variant="secondary" size="sm" onClick={addSkill}>
                                            Add
                                        </Button>
                                    </div>

                                </div>
                            </div>

                            <div className="form-actions">
                                <Button onClick={handleSave} disabled={!isFormValid}>
                                    <Save size={18}/> Save Changes
                                </Button>
                            </div>

                        </form>
                    </Card>
                </div>

            </div>
        </div>
    );
};

export default Profile;