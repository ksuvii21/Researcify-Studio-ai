const mongoose = require('mongoose'); //Written by myself

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    passwordHash: {
        type: String,
        required: true,
    },
    academicField: {
        type: String,
        required: true, 
    },
    researchInterests: {
        type: [String],
        default: [],
    },
    profileImage: {
        type: String,
        default: null,
    },
}, 
{
    timestamps: true, // Automatically adds createdAt and updatedAt fields
});

module.exports = mongoose.model('User', userSchema);